import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Briefcase } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Empty } from '../../components/ui';
import { fmtDate } from '../../utils/format';

export default function AdminJobs() {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState('');
  const load = async () => { try { setRows((await api.get('/admin/jobs', { params: { search } })).data.jobs); } catch (e) { toast.error(errMsg(e)); } };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]); // eslint-disable-line
  const del = async (j) => {
    if (!window.confirm(`Remove "${j.title}"? The recruiter will be notified.`)) return;
    try { await api.delete(`/admin/jobs/${j._id}`); toast.success('Job removed'); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <>
      <PageHeader title="Manage jobs" subtitle="Remove inappropriate or outdated postings." />
      <input className="input mb-4 max-w-sm" placeholder="Search by job title" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search jobs" />
      {!rows ? <Spinner /> : !rows.length ? <Empty icon={Briefcase} title="No jobs found" /> : (
        <div className="card overflow-x-auto !p-0"><table className="tbl"><thead><tr><th>Title</th><th>Company</th><th>Recruiter</th><th>Posted</th><th>Applicants</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{rows.map((j) => (
            <tr key={j._id}><td className="font-medium"><Link className="hover:text-indigo-600" to={`/jobs/${j._id}`}>{j.title}</Link></td><td>{j.company?.name}</td><td>{j.recruiter?.name}</td><td>{fmtDate(j.createdAt)}</td><td>{j.applicants}</td>
              <td className="text-right"><button className="btn-outline btn-sm text-red-600" onClick={() => del(j)}><Trash2 className="h-4 w-4" /> Remove</button></td></tr>))}</tbody></table></div>)}
    </>
  );
}
