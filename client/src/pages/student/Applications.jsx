import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Spinner, PageHeader, Empty, StatusBadge } from '../../components/ui';
import { fmtDate } from '../../utils/format';

export default function Applications() {
  const { data, loading } = useFetch('/applications/mine');
  if (loading) return <Spinner />;
  const rows = data.applications.filter((a) => a.job);
  return (
    <>
      <PageHeader title="My applications" subtitle="Track every application and its current status." />
      {!rows.length ? <Empty icon={FileText} title="No applications yet" text="When you apply for a job it will appear here." action={<Link to="/student/jobs" className="btn-primary">Find jobs</Link>} /> : (
        <div className="card overflow-x-auto !p-0"><table className="tbl">
          <thead><tr><th>Job</th><th>Company</th><th>Applied on</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map((a) => (
            <tr key={a._id}><td className="font-medium">{a.job.title}</td><td>{a.job.company?.name}</td><td>{fmtDate(a.createdAt)}</td><td><StatusBadge status={a.status} /></td>
              <td className="text-right"><Link className="btn-outline btn-sm" to={`/student/applications/${a._id}`}>View</Link></td></tr>))}</tbody>
        </table></div>)}
    </>
  );
}
