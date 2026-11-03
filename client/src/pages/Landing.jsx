import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, Users, Building2, Briefcase, FileCheck, UserPlus, FileUp, Send, Target, ShieldCheck, Zap, Code2, BarChart3, Cloud, Bug, Palette, Layers } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import JobCard from '../components/JobCard';
import { Spinner } from '../components/ui';

const catIcons = { 'Software Development': Code2, 'Data & Analytics': BarChart3, 'DevOps & Cloud': Cloud, 'Testing & QA': Bug, Design: Palette, Other: Layers };
const testimonials = [
  ['Demo Student A', 'The skill match percentage showed me exactly which skills to learn next before applying.'],
  ['Demo Student B', 'Tracking every application status in one place saved me from messy spreadsheets.'],
  ['Demo Recruiter C', 'Shortlisting applicants by skills and match score cut our first-round screening time.']
];

export default function Landing() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const stats = useFetch('/dashboard/public');
  const jobs = useFetch('/jobs?limit=6');
  const s = stats.data;
  return (
    <>
      <section className="bg-gradient-to-b from-indigo-50 to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">Find Your Dream Career With Smart Job Portal</h1>
          <p className="muted mx-auto mt-5 max-w-2xl text-lg">Connect with top recruiters, discover opportunities and take the next step in your career.</p>
          <form onSubmit={(e) => { e.preventDefault(); nav(`/jobs?q=${encodeURIComponent(q)}`); }} className="mx-auto mt-8 flex max-w-xl gap-2">
            <input className="input py-3" placeholder="Job title, skill or company" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search jobs" />
            <button className="btn-primary px-5"><Search className="h-4 w-4" /> Search</button>
          </form>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/jobs" className="btn-primary">Explore Jobs</Link>
            <Link to="/register/student" className="btn-outline">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {stats.loading ? <Spinner /> : s && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[[Briefcase, 'Open jobs', s.jobs], [Building2, 'Companies', s.companies], [Users, 'Students', s.students], [FileCheck, 'Applications', s.applications]].map(([I, l, v]) => (
              <div key={l} className="card text-center"><I className="mx-auto mb-2 h-6 w-6 text-indigo-600" /><p className="text-3xl font-bold">{v}</p><p className="muted text-sm">{l}</p></div>))}
          </div>)}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6 flex items-end justify-between"><h2 className="text-2xl font-bold">Featured jobs</h2><Link to="/jobs" className="text-sm font-medium text-indigo-600">View all jobs</Link></div>
        {jobs.loading ? <Spinner /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{jobs.data?.jobs.map((j) => <JobCard key={j._id} job={j} />)}</div>}
        {!jobs.loading && !jobs.data?.jobs.length && <p className="muted text-center">No jobs yet. Run the seed script to add demo data.</p>}
      </section>

      <section className="bg-white py-12 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-2xl font-bold">Popular categories</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {(s?.categories || []).map((c) => { const I = catIcons[c.name] || Layers; return (
              <Link key={c.name} to={`/jobs?category=${encodeURIComponent(c.name)}`} className="card text-center transition-shadow hover:shadow-md">
                <I className="mx-auto mb-2 h-6 w-6 text-indigo-600" /><p className="text-sm font-semibold">{c.name}</p><p className="muted text-xs">{c.count} open</p></Link>); })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[[UserPlus, 'Create an account', 'Register as a student or recruiter in a minute.'], [FileUp, 'Build your profile', 'Add skills and upload your PDF resume.'], [Search, 'Find matching jobs', 'Search, filter and see your skill match.'], [Send, 'Apply and track', 'Follow each application from Applied to Selected.']].map(([I, t, d], i) => (
            <div key={t} className="card"><span className="mb-3 inline-flex rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/40"><I className="h-5 w-5" /></span><h3 className="font-semibold">{i + 1}. {t}</h3><p className="muted mt-1 text-sm">{d}</p></div>))}
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-3">
          {[[Target, 'Skill-based matching', 'Every job shows your match percentage, matching skills and the skills you are missing.'], [ShieldCheck, 'Secure by design', 'JWT sessions, hashed passwords and role-based access for students, recruiters and admins.'], [Zap, 'Runs fully offline', 'No paid APIs or cloud services. The whole platform runs on your own machine.']].map(([I, t, d]) => (
            <div key={t} className="card"><I className="mb-3 h-6 w-6 text-indigo-600" /><h3 className="font-semibold">{t}</h3><p className="muted mt-1 text-sm">{d}</p></div>))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-1 text-2xl font-bold">What users say</h2>
        <p className="muted mb-6 text-sm">Demo testimonials written for this academic project, not real customer reviews.</p>
        <div className="grid gap-4 md:grid-cols-3">{testimonials.map(([n, t]) => <figure key={n} className="card"><blockquote className="text-sm">“{t}”</blockquote><figcaption className="muted mt-3 text-sm font-medium">{n}</figcaption></figure>)}</div>
      </section>
    </>
  );
}
