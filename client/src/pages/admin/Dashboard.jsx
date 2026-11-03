import { GraduationCap, Users, Briefcase, FileText, UserPlus, Send } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Spinner, StatCard, PageHeader } from '../../components/ui';
import { StatusPie, SimpleBar, SimpleLine, ChartCard } from '../../components/Charts';
import { fmtDate } from '../../utils/format';

export default function AdminDashboard() {
  const { data, loading } = useFetch('/dashboard/admin');
  if (loading || !data) return <Spinner />;
  const t = data.totals;
  const icons = { user: UserPlus, job: Briefcase, application: Send };
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Live platform statistics from the database." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Students" value={t.students} />
        <StatCard icon={Users} label="Recruiters" value={t.recruiters} tone="sky" />
        <StatCard icon={Briefcase} label="Jobs" value={t.jobs} tone="green" />
        <StatCard icon={FileText} label="Applications" value={t.applications} tone="amber" />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SimpleLine title="User growth (last 6 months)" data={data.userGrowth} lines={[{ key: 'students', label: 'Students' }, { key: 'recruiters', label: 'Recruiters' }]} />
        <SimpleBar title="Jobs by category" data={data.jobsByCategory} bars={[{ key: 'value', label: 'Jobs' }]} />
        <StatusPie data={data.statusDistribution} title="Applications overview" />
        <div className="card"><h3 className="mb-4 font-semibold">Recent activity</h3>
          <ul className="space-y-3">{data.activities.map((a, i) => { const I = icons[a.type]; return (
            <li key={i} className="flex items-start gap-3 text-sm"><span className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900/40"><I className="h-4 w-4" /></span><span className="flex-1">{a.text}</span><span className="muted whitespace-nowrap text-xs">{fmtDate(a.date)}</span></li>); })}
            {!data.activities.length && <p className="muted text-sm">No activity yet.</p>}</ul></div>
      </div>
    </>
  );
}
