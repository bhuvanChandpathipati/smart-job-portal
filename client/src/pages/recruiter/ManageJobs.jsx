import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, Pencil, Trash2, Eye, Users } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Empty } from '../../components/ui';
import { fmtDate } from '../../utils/format';

export default function ManageJobs() {
  const { data, loading, reload } = useFetch('/jobs/mine');
  if (loading) return <Spinner />;
  const del = async (j) => {
    if (!window.confirm(`Delete "${j.title}" and its ${j.applicants} application(s)?`)) return;
    try { await api.delete(`/jobs/${j._id}`); toast.success('Job deleted'); reload(); } catch (e) { toast.error(errMsg(e)); }
  };
  const live = (j) => j.isActive && new Date(j.deadline) >= new Date(new Date().setHours(0, 0, 0, 0));
  return (
    <>
      <PageHeader title="Manage jobs" subtitle={`${data.jobs.length} posting${data.jobs.length === 1 ? '' : 's'}`}><Link to="/recruiter/jobs/new" className="btn-primary">Post a job</Link></PageHeader>
      {!data.jobs.length ? <Empty icon={Briefcase} title="You have not posted any jobs" text="Post your first job to start receiving applications." action={<Link to="/recruiter/jobs/new" className="btn-primary">Post a job</Link>} /> : (
        <div className="card overflow-x-auto !p-0"><table className="tbl"><thead><tr><th>Title</th><th>Type</th><th>Location</th><th>Deadline</th><th>Applicants</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{data.jobs.map((j) => (
            <tr key={j._id}><td className="font-medium">{j.title}</td><td>{j.jobType}</td><td>{j.location}</td><td>{fmtDate(j.deadline)}</td>
              <td><Link className="inline-flex items-center gap-1 text-indigo-600" to={`/recruiter/applicants?jobId=${j._id}`}><Users className="h-4 w-4" />{j.applicants}</Link></td>
              <td><span className={`badge ${live(j) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{live(j) ? 'Active' : 'Closed'}</span></td>
              <td><div className="flex justify-end gap-2"><Link className="btn-outline btn-sm" to={`/jobs/${j._id}`} title="View"><Eye className="h-4 w-4" /></Link>
                <Link className="btn-outline btn-sm" to={`/recruiter/jobs/${j._id}/edit`} title="Edit"><Pencil className="h-4 w-4" /></Link>
                <button className="btn-outline btn-sm text-red-600" onClick={() => del(j)} title="Delete"><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody></table></div>)}
    </>
  );
}
