import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Empty, StatusBadge } from '../../components/ui';
import { STATUSES, fmtDate } from '../../utils/format';

export default function AdminApplications() {
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('');
  useEffect(() => { setRows(null); api.get('/applications/all', { params: { status } }).then((r) => setRows(r.data.applications)).catch((e) => { toast.error(errMsg(e)); setRows([]); }); }, [status]);
  return (
    <>
      <PageHeader title="All applications" subtitle="Monitor activity across the platform." />
      <select className="input mb-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      {!rows ? <Spinner /> : !rows.length ? <Empty icon={FileText} title="No applications found" /> : (
        <div className="card overflow-x-auto !p-0"><table className="tbl"><thead><tr><th>Student</th><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
          <tbody>{rows.map((a) => <tr key={a._id}><td className="font-medium">{a.student?.name}</td><td>{a.job?.title}</td><td>{a.job?.company?.name}</td><td>{fmtDate(a.createdAt)}</td><td><StatusBadge status={a.status} /></td></tr>)}</tbody></table></div>)}
    </>
  );
}
