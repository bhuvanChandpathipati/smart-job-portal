import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Spinner, StatusBadge, MatchBadge } from '../../components/ui';
import { fmtDate, fmtSalary, STATUSES } from '../../utils/format';

export default function ApplicationDetails() {
  const { id } = useParams();
  const { data, loading } = useFetch(`/applications/${id}`);
  if (loading) return <Spinner />;
  if (!data) return <p>Application not found.</p>;
  const { application: a, match } = data;
  const reached = new Set(a.statusHistory.map((h) => h.status));
  const flow = a.status === 'Rejected' ? ['Applied', 'Under Review', 'Rejected'] : STATUSES.filter((s) => s !== 'Rejected');
  return (
    <>
      <Link to="/student/applications" className="muted mb-4 inline-flex items-center gap-1 text-sm hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> My applications</Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h1 className="text-xl font-bold">{a.job.title}</h1><p className="muted text-sm">{a.job.company?.name} • {a.job.location}</p></div><StatusBadge status={a.status} /></div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="muted">Applied on</dt><dd className="font-medium">{fmtDate(a.createdAt)}</dd></div>
            <div><dt className="muted">Salary</dt><dd className="font-medium">{fmtSalary(a.job)}</dd></div>
            <div><dt className="muted">Skill match</dt><dd><MatchBadge value={match.matchPercentage} /></dd></div>
          </dl>
          {a.coverNote && <div className="mt-5"><h2 className="mb-1 text-sm font-semibold">Your cover note</h2><p className="muted whitespace-pre-line text-sm">{a.coverNote}</p></div>}
          <Link className="btn-outline mt-5" to={`/student/jobs/${a.job._id}`}>View job posting</Link>
        </div>
        <div className="card"><h2 className="mb-4 font-semibold">Progress</h2>
          <ol className="space-y-4">{flow.map((s) => { const done = reached.has(s); const hist = a.statusHistory.find((h) => h.status === s); return (
            <li key={s} className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white ${done ? (s === 'Rejected' ? 'bg-red-500' : 'bg-indigo-600') : 'bg-slate-300 dark:bg-slate-700'}`}>{done && <Check className="h-3.5 w-3.5" />}</span>
              <div><p className={`text-sm font-medium ${done ? '' : 'muted'}`}>{s}</p>{hist && <p className="muted text-xs">{fmtDate(hist.date)}</p>}</div></li>); })}</ol>
        </div>
      </div>
    </>
  );
}
