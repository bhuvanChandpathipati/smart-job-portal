import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, UserCheck, UserX, Users } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Empty } from '../../components/ui';
import { fmtDate } from '../../utils/format';

export default function AdminUsers({ role }) {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState('');
  const load = async () => { try { setRows((await api.get('/admin/users', { params: { role, search } })).data.users); } catch (e) { toast.error(errMsg(e)); } };
  useEffect(() => { setRows(null); const t = setTimeout(load, 250); return () => clearTimeout(t); }, [role, search]); // eslint-disable-line
  const toggle = async (u) => { try { await api.patch(`/admin/users/${u._id}/toggle`); toast.success(u.isActive ? 'Account deactivated' : 'Account activated'); load(); } catch (e) { toast.error(errMsg(e)); } };
  const del = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all related data? This cannot be undone.`)) return;
    try { await api.delete(`/admin/users/${u._id}`); toast.success('User deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <>
      <PageHeader title={role === 'student' ? 'Manage students' : 'Manage recruiters'} subtitle={rows ? `${rows.length} account${rows.length === 1 ? '' : 's'}` : ''} />
      <input className="input mb-4 max-w-sm" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
      {!rows ? <Spinner /> : !rows.length ? <Empty icon={Users} title="No users found" /> : (
        <div className="card overflow-x-auto !p-0"><table className="tbl"><thead><tr><th>Name</th><th>Email</th>{role === 'recruiter' && <th>Company</th>}<th>Joined</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{rows.map((u) => (
            <tr key={u._id}><td className="font-medium">{u.name}</td><td>{u.email}</td>{role === 'recruiter' && <td>{u.company}</td>}<td>{fmtDate(u.createdAt)}</td>
              <td><span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
              <td><div className="flex justify-end gap-2"><button className="btn-outline btn-sm" onClick={() => toggle(u)}>{u.isActive ? <><UserX className="h-4 w-4" /> Deactivate</> : <><UserCheck className="h-4 w-4" /> Activate</>}</button>
                <button className="btn-outline btn-sm text-red-600" onClick={() => del(u)} aria-label="Delete user"><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody></table></div>)}
    </>
  );
}
