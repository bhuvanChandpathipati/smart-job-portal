import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Users, Star, PlusCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Spinner, StatCard, PageHeader, StatusBadge, Empty } from '../../components/ui';
import { StatusPie, SimpleBar, SimpleLine } from '../../components/Charts';
import { fmtDate } from '../../utils/format';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch('/dashboard/recruiter');
  if (loading || !data) return <Spinner />;
  const t = data.totals;
  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]}`} subtitle="Your hiring pipeline at a glance.">
        <Link to="/recruiter/jobs/new" className="btn-primary"><PlusCircle className="h-4 w-4" /> Post a job</Link>
        <Link to="/recruiter/applicants" className="btn-outline">View applicants</Link>
      </PageHeader>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Jobs posted" value={t.jobs} />
        <StatCard icon={CheckCircle2} label="Active jobs" value={t.active} tone="green" />
        <StatCard icon={Users} label="Total applicants" value={t.applicants} tone="sky" />
        <StatCard icon={Star} label="Shortlisted" value={t.shortlisted} tone="amber" />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <SimpleBar title="Applicants per job" data={data.applicantsPerJob} bars={[{ key: 'applicants', label: 'Applicants' }]} />
        <StatusPie data={data.statusDistribution} title="Application status" />
        <SimpleLine title="Jobs posted (last 6 months)" data={data.jobsByMonth} lines={[{ key: 'count', label: 'Jobs' }]} />
      </div>
      <div className="card"><h2 className="mb-3 font-semibold">Recent applicants</h2>
        {!data.recent.length ? <Empty title="No applicants yet" text="Applicants will show up here as students apply." /> : (
          <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Status</th><th></th></tr></thead>
            <tbody>{data.recent.map((a) => <tr key={a._id}><td className="font-medium">{a.student?.name}</td><td>{a.job?.title}</td><td>{fmtDate(a.createdAt)}</td><td><StatusBadge status={a.status} /></td>
              <td className="text-right"><Link className="btn-outline btn-sm" to={`/recruiter/applicants/${a._id}`}>View</Link></td></tr>)}</tbody></table></div>)}</div>
    </>
  );
}
