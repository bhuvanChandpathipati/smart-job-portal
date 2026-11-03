import { Target, Eye, Cpu } from 'lucide-react';
export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-3xl font-bold">About Smart Job Portal</h1>
      <p className="muted mt-3">Smart Job Portal is a centralized recruitment platform that connects students, recruiters and administrators. It was built as a final-year Computer Science Engineering project using the MERN stack.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[[Target, 'Our objective', 'Make job search and hiring simpler with profiles, resumes, filters and application tracking in one place.'], [Eye, 'Our approach', 'A rule-based recommendation engine compares a student’s skills, experience and education with each job.'], [Cpu, 'Our stack', 'React, Vite, Tailwind CSS, Node.js, Express, MongoDB and JWT. Everything runs locally.']].map(([I, t, d]) => (
          <div key={t} className="card"><I className="mb-3 h-6 w-6 text-indigo-600" /><h3 className="font-semibold">{t}</h3><p className="muted mt-1 text-sm">{d}</p></div>))}
      </div>
    </div>
  );
}
