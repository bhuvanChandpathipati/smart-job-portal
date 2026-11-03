import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import api, { errMsg } from '../services/api';
import { Spinner, PageHeader, Empty } from '../components/ui';
import { fmtDate } from '../utils/format';

export default function Notifications() {
  const { data, loading, reload } = useFetch('/notifications');
  if (loading) return <Spinner />;
  const done = () => { reload(); window.dispatchEvent(new Event('sjp:notifications')); };
  const run = (fn) => async () => { try { await fn(); done(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <>
      <PageHeader title="Notifications" subtitle={`${data.unread} unread`}>
        {data.unread > 0 && <button className="btn-outline" onClick={run(() => api.patch('/notifications/read-all'))}><CheckCheck className="h-4 w-4" /> Mark all as read</button>}
      </PageHeader>
      {!data.notifications.length ? <Empty icon={Bell} title="You are all caught up" text="Updates about applications and jobs will show up here." /> : (
        <ul className="space-y-3">{data.notifications.map((n) => (
          <li key={n._id} className={`card flex items-start gap-3 !py-3 ${n.isRead ? 'opacity-75' : 'border-indigo-300 dark:border-indigo-700'}`}>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-slate-300' : 'bg-indigo-600'}`} />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="muted text-sm">{n.message}</p>
              <p className="muted mt-1 text-xs">{fmtDate(n.createdAt)}{n.link && <> • <Link className="text-indigo-600" to={n.link} onClick={run(() => api.patch(`/notifications/${n._id}/read`))}>Open</Link></>}</p></div>
            {!n.isRead && <button className="btn-outline btn-sm" onClick={run(() => api.patch(`/notifications/${n._id}/read`))}>Mark read</button>}
            <button aria-label="Delete notification" className="text-slate-400 hover:text-red-600" onClick={run(() => api.delete(`/notifications/${n._id}`))}><Trash2 className="h-4 w-4" /></button>
          </li>))}</ul>)}
    </>
  );
}
