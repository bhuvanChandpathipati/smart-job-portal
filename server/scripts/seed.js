// Repeatable seed: safe to run many times (upserts by email / title+company / job+student).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');
const upload = require('../middleware/upload');

const day = (n) => new Date(Date.now() + n * 864e5);
const ago = (n) => day(-n);

function makePdf(lines) {
  const text = lines.map((l, i) => `BT /F1 14 Tf 72 ${770 - i * 22} Td (${String(l).replace(/[()\\]/g, '')}) Tj ET`).join('\n');
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let out = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  return out;
}

const companies = [
  { name: 'TechNova Solutions', location: 'Bengaluru, Karnataka', industry: 'Software Services', size: '501-1000', website: 'https://technova.example', description: 'Product engineering and IT services company building web and mobile platforms for enterprises.' },
  { name: 'CloudNest Technologies', location: 'Hyderabad, Telangana', industry: 'Cloud & DevOps', size: '201-500', website: 'https://cloudnest.example', description: 'Cloud consulting and managed DevOps services for fast-growing startups.' },
  { name: 'DataBridge Analytics', location: 'Pune, Maharashtra', industry: 'Data & Analytics', size: '51-200', website: 'https://databridge.example', description: 'Analytics and business intelligence firm helping retail and banking clients decide with data.' }
];
const recruiters = [
  { name: 'Ananya Rao', email: 'recruiter1@smartjobportal.local', company: 0, designation: 'Talent Acquisition Lead' },
  { name: 'Vikram Reddy', email: 'recruiter2@smartjobportal.local', company: 1, designation: 'HR Manager' },
  { name: 'Meera Kulkarni', email: 'recruiter3@smartjobportal.local', company: 2, designation: 'Senior Recruiter' }
];
const students = [
  ['Rahul Sharma', 'Bachelor', 'Entry Level', 'Full Stack Developer', 'Vijayawada', ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS']],
  ['Priya Nair', 'Bachelor', 'Entry Level', 'Java Developer', 'Kochi', ['Java', 'Spring Boot', 'MySQL', 'SQL', 'Git']],
  ['Arjun Mehta', 'Master', 'Junior', 'Python Developer', 'Mumbai', ['Python', 'Django', 'SQL', 'PostgreSQL', 'REST API']],
  ['Sneha Iyer', 'Bachelor', 'Entry Level', 'Frontend Developer', 'Chennai', ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS']],
  ['Karthik Reddy', 'Bachelor', 'Entry Level', 'Backend Developer', 'Guntur', ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API']],
  ['Divya Patel', 'Bachelor', 'Junior', 'Data Analyst', 'Ahmedabad', ['Python', 'SQL', 'Power BI', 'Excel', 'Pandas']],
  ['Mohammed Faiz', 'Bachelor', 'Entry Level', 'DevOps Aspirant', 'Hyderabad', ['Linux', 'Docker', 'Git', 'AWS', 'Bash']],
  ['Lakshmi Prasanna', 'Bachelor', 'Entry Level', 'QA Intern', 'Visakhapatnam', ['Manual Testing', 'Selenium', 'Java', 'SQL', 'JIRA']],
  ['Aditya Verma', 'Master', 'Junior', 'Cloud Engineer', 'Delhi', ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'Python']],
  ['Neha Gupta', 'Bachelor', 'Entry Level', 'Software Developer', 'Noida', ['Python', 'Java', 'SQL', 'React', 'MongoDB']]
];
const J = (c, rec, title, category, jobType, level, location, min, max, vac, skills, description) => ({ c, rec, title, category, jobType, level, location, min, max, vac, skills, description });
const jobs = [
  J(0, 0, 'Software Developer', 'Software Development', 'Full-time', 'Entry Level', 'Bengaluru, Karnataka', 4, 7, 5, ['Java', 'Python', 'SQL', 'Git', 'Data Structures'], 'Build and maintain enterprise web modules with the product engineering team. You will write clean, tested code, join code reviews and work with senior engineers on design.'),
  J(0, 0, 'Java Developer', 'Software Development', 'Full-time', 'Junior', 'Bengaluru, Karnataka', 6, 10, 3, ['Java', 'Spring Boot', 'MySQL', 'REST API', 'Git'], 'Develop REST services using Spring Boot and MySQL for banking clients. Own features from design to deployment and write unit tests.'),
  J(0, 0, 'Frontend Developer', 'Software Development', 'Full-time', 'Entry Level', 'Bengaluru, Karnataka', 4, 8, 4, ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'], 'Create responsive, accessible user interfaces in React. Work with designers to turn Figma screens into reusable components.'),
  J(0, 0, 'Full Stack Developer', 'Software Development', 'Full-time', 'Junior', 'Remote', 7, 12, 2, ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express'], 'Deliver features across the MERN stack for a SaaS product. Design APIs, build dashboards and improve application performance.'),
  J(0, 0, 'Software Testing Intern', 'Testing & QA', 'Internship', 'Entry Level', 'Bengaluru, Karnataka', 1.2, 2.4, 6, ['Manual Testing', 'Selenium', 'SQL', 'JIRA'], 'Learn test planning, write test cases, report defects in JIRA and help automate regression tests with Selenium.'),
  J(1, 1, 'DevOps Engineer', 'DevOps & Cloud', 'Full-time', 'Junior', 'Hyderabad, Telangana', 8, 14, 3, ['Docker', 'Kubernetes', 'Linux', 'Jenkins', 'AWS', 'Git'], 'Design CI/CD pipelines and manage containerised workloads for client platforms. Improve reliability with monitoring and automation.'),
  J(1, 1, 'Cloud Engineer', 'DevOps & Cloud', 'Full-time', 'Mid Level', 'Hyderabad, Telangana', 10, 18, 2, ['AWS', 'Terraform', 'Linux', 'Python', 'Docker'], 'Architect and operate AWS infrastructure using Terraform. Optimise cost, security and availability for customer workloads.'),
  J(1, 1, 'Python Developer', 'Software Development', 'Full-time', 'Entry Level', 'Hyderabad, Telangana', 4, 8, 4, ['Python', 'Django', 'SQL', 'REST API', 'Git'], 'Build backend services and automation tools in Python and Django. Write maintainable code and document APIs.'),
  J(1, 1, 'Backend Developer', 'Software Development', 'Full-time', 'Junior', 'Remote', 6, 11, 3, ['Node.js', 'Express', 'MongoDB', 'REST API', 'JavaScript'], 'Develop scalable Node.js microservices with MongoDB. Design schemas, secure endpoints and write integration tests.'),
  J(1, 1, 'Cloud Support Intern', 'DevOps & Cloud', 'Internship', 'Entry Level', 'Hyderabad, Telangana', 1.2, 2.0, 4, ['Linux', 'AWS', 'Bash', 'Git'], 'Support the cloud operations team with monitoring, ticket handling and scripting routine tasks on Linux and AWS.'),
  J(2, 2, 'Data Analyst', 'Data & Analytics', 'Full-time', 'Entry Level', 'Pune, Maharashtra', 4, 7, 4, ['Python', 'SQL', 'Excel', 'Power BI', 'Pandas'], 'Clean and analyse retail datasets, build Power BI dashboards and present insights to business stakeholders.'),
  J(2, 2, 'Business Intelligence Developer', 'Data & Analytics', 'Full-time', 'Junior', 'Pune, Maharashtra', 6, 10, 2, ['SQL', 'Power BI', 'Python', 'ETL', 'Excel'], 'Create data models and ETL pipelines that feed executive dashboards for banking clients.'),
  J(2, 2, 'Python Data Engineer', 'Data & Analytics', 'Full-time', 'Mid Level', 'Pune, Maharashtra', 9, 15, 2, ['Python', 'SQL', 'PostgreSQL', 'Pandas', 'Docker'], 'Build reliable batch data pipelines and maintain a PostgreSQL warehouse supporting analytics products.'),
  J(2, 2, 'Software Developer (Part-time)', 'Software Development', 'Part-time', 'Entry Level', 'Pune, Maharashtra', 2, 4, 2, ['JavaScript', 'React', 'SQL', 'Git'], 'Work 20 hours a week on internal tools. Ideal for final-year students who want industry experience alongside studies.'),
  J(2, 2, 'Full Stack Developer Intern', 'Software Development', 'Internship', 'Entry Level', 'Remote', 1.5, 2.4, 5, ['React', 'Node.js', 'MongoDB', 'JavaScript'], 'Contribute to a real analytics web app: build UI components, write REST endpoints and fix bugs under a mentor.')
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_job_portal');
  if (process.argv.includes('--reset')) { await mongoose.connection.dropDatabase(); console.log('Database cleared'); }
  fs.mkdirSync(upload.dir, { recursive: true });

  const ensureUser = async (name, email, password, role) =>
    (await User.findOne({ email })) || User.create({ name, email, password, role });

  await ensureUser(process.env.ADMIN_NAME || 'Portal Administrator', (process.env.ADMIN_EMAIL || 'admin@smartjobportal.local').toLowerCase(), process.env.ADMIN_PASSWORD || 'Admin@12345', 'admin');

  const recUsers = [];
  for (const r of recruiters) {
    const u = await ensureUser(r.name, r.email, 'Recruiter@123', 'recruiter');
    const cd = companies[r.company];
    const company = await Company.findOneAndUpdate({ name: cd.name }, { ...cd, createdBy: u._id }, { upsert: true, new: true });
    await RecruiterProfile.findOneAndUpdate({ user: u._id }, { company: company._id, designation: r.designation, phone: '+91 98765 4321' + r.company }, { upsert: true });
    recUsers.push({ user: u, company });
  }

  const stuUsers = [];
  for (let i = 0; i < students.length; i++) {
    const [name, edu, exp, headline, loc, skills] = students[i];
    const u = await ensureUser(name, `student${i + 1}@smartjobportal.local`, 'Student@123', 'student');
    const set = { phone: `+91 90000 0${1000 + i}`, headline, location: loc, about: `${headline} with hands-on project experience in ${skills.slice(0, 3).join(', ')}. Looking for an entry opportunity to grow.`,
      skills, educationLevel: edu, experienceLevel: exp,
      education: [{ institution: 'Demo Institute of Technology', degree: edu === 'Master' ? 'M.Tech' : 'B.Tech', field: 'Computer Science and Engineering', year: edu === 'Master' ? '2025' : '2026', grade: '8.' + (i % 4 + 2) + ' CGPA' }],
      experience: i % 3 === 0 ? [{ company: 'Demo Startup Pvt Ltd', role: 'Intern', duration: '3 months', description: 'Worked on internal web tools.' }] : [] };
    const p = await StudentProfile.findOneAndUpdate({ user: u._id }, { $set: set }, { upsert: true, new: true });
    if (i < 5 && !p.resume?.filename) {
      const filename = `seed-student${i + 1}.pdf`;
      fs.writeFileSync(path.join(upload.dir, filename), makePdf([name, headline, `Skills: ${skills.join(', ')}`, 'Demo resume generated by the seed script.']));
      p.resume = { filename, originalName: `${name.replace(/ /g, '_')}_Resume.pdf`, size: fs.statSync(path.join(upload.dir, filename)).size, uploadedAt: new Date() };
      await p.save();
    }
    stuUsers.push(u);
  }

  const jobDocs = [];
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i]; const { user, company } = recUsers[j.rec];
    const doc = await Job.findOneAndUpdate({ title: j.title, company: company._id },
      { $set: { recruiter: user._id, description: j.description, skills: j.skills, location: j.location, salaryMin: j.min, salaryMax: j.max, jobType: j.jobType, experienceLevel: j.level, category: j.category, vacancies: j.vac, deadline: day(30 + i * 3), isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true });
    jobDocs.push(doc);
  }

  const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
  let appCount = 0;
  for (let i = 0; i < stuUsers.length; i++) {
    for (const [k, off] of [0, 3, 7].entries()) {
      const job = jobDocs[(i + off) % jobDocs.length];
      const status = statuses[(i + k * 2) % statuses.length];
      const hist = statuses.slice(0, statuses.indexOf(status) + 1).filter((s) => s !== 'Rejected' || status === 'Rejected').map((s, n) => ({ status: s, date: ago(12 - n * 2) }));
      const r = await Application.updateOne({ job: job._id, student: stuUsers[i]._id },
        { $setOnInsert: { status, coverNote: 'I am excited to apply and believe my skills match this role.', statusHistory: hist, createdAt: ago(40 - k * 25 - i * 2) } }, { upsert: true, timestamps: false });
      if (r.upsertedCount) appCount++;
    }
    for (const off of [1, 5]) await SavedJob.updateOne({ student: stuUsers[i]._id, job: jobDocs[(i + off) % jobDocs.length]._id }, { $setOnInsert: {} }, { upsert: true });
    await Notification.updateOne({ user: stuUsers[i]._id, title: 'Welcome to Smart Job Portal' },
      { $setOnInsert: { message: 'Complete your profile and upload your resume to get better job recommendations.', type: 'info', link: '/student/profile' } }, { upsert: true });
  }
  for (const { user } of recUsers) await Notification.updateOne({ user: user._id, title: 'Welcome recruiter' },
    { $setOnInsert: { message: 'Post jobs and manage applicants from your dashboard.', type: 'info', link: '/recruiter/jobs/new' } }, { upsert: true });

  const counts = await Promise.all([User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'recruiter' }), Job.countDocuments(), Application.countDocuments()]);
  console.log(`Seed complete: ${counts[0]} students, ${counts[1]} recruiters, ${counts[2]} jobs, ${counts[3]} applications (${appCount} new)`);
  await mongoose.disconnect();
})().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
