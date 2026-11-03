import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Download, Check, X } from 'lucide-react';
import api, { errMsg, downloadFile } from '../../services/api';
import { Spinner, PageHeader, Empty, MatchBadge } from '../../components/ui';
import { STATUSES, fmtDate } from '../../utils/format';

export default function Applicants() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const status = params.get('status') || '';
  const jobId = params.get('jobId') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setData((await api.get('/applications/recruiter', { params: { search, status, jobId } })).data); }
    catch (e) { toast.error(errMsg(e)); } finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search, status, jobId]); // eslint-disable-line
  const setP = (k, v) => { const n = new URLSearchParams(params); v ? n.set(k, v) : n.delete(k); setParams(n); };
  const update = async (id, s) => { try { await api.patch(`/applications/${id}/status`, { status: s }); toast.success(`Marked as ${s}`); load(); } catch (e) { toast.error(errMsg(e)); } };

  if (loading) return <Spinner />;
  return (
    <>
      <PageHeader title="Applicants" subtitle={`${data.applications.length} candidate${data.applications.length === 1 ? '' : 's'}`} />
      <div className="card mb-4 grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Search by name, email or skill" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search applicants" />
        <select className="input" value={jobId} onChange={(e) => setP('jobId', e.target.value)} aria-label="Filter by job"><option value="">All jobs</option>{data.jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}</select>
        <select className="input" value={status} onChange={(e) => setP('status', e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {!data.applications.length ? <Empty icon={Users} title="No applicants found" text="Try changing the filters, or wait for students to apply." /> : (
        <div className="card overflow-x-auto !p-0"><table className="tbl"><thead><tr><th>Candidate</th><th>Job</th><th>Match</th><th>Applied</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{data.applications.map((a) => (
            <tr key={a._id}>
              <td><Link to={`/recruiter/applicants/${a._id}`} className="font-medium hover:text-indigo-600">{a.student.name}</Link><p className="muted text-xs">{a.profile?.headline || a.student.email}</p></td>
              <td>{a.job.title}</td><td><MatchBadge value={a.match} /></td><td>{fmtDate(a.createdAt)}</td>
              <td><select className="input !w-auto !py-1 text-xs" value={a.status} onChange={(e) => update(a._id, e.target.value)} aria-label="Update status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
              <td><div className="flex justify-end gap-2">
                <button className="btn-outline btn-sm text-emerald-600" title="Shortlist" onClick={() => update(a._id, 'Shortlisted')}><Check className="h-4 w-4" /></button>
                <button className="btn-outline btn-sm text-red-600" title="Reject" onClick={() => update(a._id, 'Rejected')}><X className="h-4 w-4" /></button>
                <button className="btn-outline btn-sm" title={a.profile?.hasResume ? 'Download resume' : 'No resume uploaded'} disabled={!a.profile?.hasResume} onClick={() => downloadFile(`/resumes/student/${a.student._id}`).catch((e) => toast.error(errMsg(e)))}><Download className="h-4 w-4" /></button></div></td>
            </tr>))}</tbody></table></div>)}
    </>
  );
}
