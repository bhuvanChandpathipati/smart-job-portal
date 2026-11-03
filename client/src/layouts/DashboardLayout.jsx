import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, Sparkles, Bookmark, FileText, User, FileUp, Bell, Settings, LogOut, Menu, X, Moon, Sun,
  Building2, PlusCircle, Briefcase, Users, GraduationCap, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import api from '../services/api';
import { Logo } from './PublicLayout';
import { Avatar } from '../components/ui';
import { initials } from '../utils/format';

const MENUS = {
  student: [['/student', 'Dashboard', LayoutDashboard, true], ['/student/jobs', 'Find Jobs', Search], ['/student/recommended', 'Recommended Jobs', Sparkles], ['/student/saved', 'Saved Jobs', Bookmark],
    ['/student/applications', 'My Applications', FileText], ['/student/profile', 'My Profile', User], ['/student/resume', 'Resume', FileUp], ['/student/notifications', 'Notifications', Bell], ['/student/settings', 'Settings', Settings]],
  recruiter: [['/recruiter', 'Dashboard', LayoutDashboard, true], ['/recruiter/company', 'Company Profile', Building2], ['/recruiter/jobs/new', 'Post a Job', PlusCircle], ['/recruiter/jobs', 'Manage Jobs', Briefcase, true],
    ['/recruiter/applicants', 'Applicants', Users], ['/recruiter/notifications', 'Notifications', Bell], ['/recruiter/settings', 'Settings', Settings]],
  admin: [['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/students', 'Students', GraduationCap], ['/admin/recruiters', 'Recruiters', Users], ['/admin/jobs', 'Jobs', Briefcase],
    ['/admin/applications', 'Applications', ClipboardList], ['/admin/settings', 'Settings', Settings]]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const nav = useNavigate();
  useEffect(() => {
    if (user.role !== 'admin') api.get('/notifications').then((r) => setUnread(r.data.unread)).catch(() => {});
    const h = () => user.role !== 'admin' && api.get('/notifications').then((r) => setUnread(r.data.unread)).catch(() => {});
    window.addEventListener('sjp:notifications', h);
    return () => window.removeEventListener('sjp:notifications', h);
  }, [user.role]);

  const item = ([to, label, Icon, end]) => (
    <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
      className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
      <Icon className="h-4 w-4" /> <span className="flex-1">{label}</span>
      {label === 'Notifications' && unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-xs text-white">{unread}</span>}
    </NavLink>
  );
  return (
    <div className="min-h-screen lg:flex">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between"><Logo to="/" /><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
        <nav className="flex-1 space-y-1 overflow-y-auto">{MENUS[user.role].map(item)}</nav>
        <button onClick={() => { logout(); nav('/login'); }} className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOut className="h-4 w-4" /> Logout</button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
          <span className="muted hidden text-sm lg:block capitalize">{user.role} workspace</span>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="btn-outline btn-sm" aria-label="Toggle dark mode">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold leading-tight">{user.name}</p><p className="muted text-xs">{user.email}</p></div>
            <Avatar text={initials(user.name)} size="h-9 w-9" />
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
