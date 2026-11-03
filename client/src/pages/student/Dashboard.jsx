import { Link } from 'react-router-dom';
import { FileText, Bookmark, CheckCircle2, Clock, Search, Sparkles, FileUp, User } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Spinner, StatCard, PageHeader, Empty } from '../../components/ui';
import { StatusPie, SimpleLine } from '../../components/Charts';
import JobCard from '../../components/JobCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch('/dashboard/student');
  if (loading || !data) return <Spinner />;
  const t = data.totals;
  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Here is where your job search stands today.">
        <Link to="/student/jobs" className="btn-primary"><Search className="h-4 w-4" /> Find jobs</Link>
        <Link to="/student/resume" className="btn-outline"><FileUp className="h-4 w-4" /> Resume</Link>
        <Link to="/student/profile" className="btn-outline"><User className="h-4 w-4" /> Profile</Link>
      </PageHeader>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total applications" value={t.applications} />
        <StatCard icon={Bookmark} label="Saved jobs" value={t.saved} tone="sky" />
        <StatCard icon={CheckCircle2} label="Shortlisted" value={t.shortlisted} tone="green" />
        <StatCard icon={Clock} label="Pending" value={t.pending} tone="amber" />
      </div>
      <div className="card mb-6">
        <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Profile completion</h2><span className="font-bold">{data.profileCompletion}%</span></div>
        <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2.5 rounded-full bg-indigo-600 transition-all" style={{ width: `${data.profileCompletion}%` }} /></div>
        {data.profileCompletion < 100 && <p className="muted mt-2 text-sm">Add skills, education and a resume to get better recommendations. <Link className="font-medium text-indigo-600" to="/student/profile">Complete profile</Link></p>}
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <StatusPie data={data.statusDistribution} />
        <SimpleLine title="Application history (last 6 months)" data={data.history} lines={[{ key: 'count', label: 'Applications' }]} />
      </div>
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5 text-indigo-600" /> Recommended for you</h2><Link to="/student/recommended" className="text-sm font-medium text-indigo-600">See all</Link></div>
        {data.recommended.length ? <div className="grid gap-4 md:grid-cols-2">{data.recommended.map((r) => <JobCard key={r.job._id} job={r.job} match={r.match} base="/student/jobs" />)}</div>
          : <Empty title="No recommendations yet" text="Add your skills to your profile and we will match you with jobs." action={<Link to="/student/profile" className="btn-primary">Add skills</Link>} />}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recently posted jobs</h2>
        <div className="grid gap-4 md:grid-cols-2">{data.recent.map((j) => <JobCard key={j._id} job={j} base="/student/jobs" />)}</div>
      </section>
    </>
  );
}
