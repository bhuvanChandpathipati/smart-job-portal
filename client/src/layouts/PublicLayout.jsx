import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import { homeFor } from '../utils/format';

export const Logo = ({ to = '/' }) => (
  <Link to={to} className="flex items-center gap-2 text-lg font-bold">
    <span className="rounded-lg bg-indigo-600 p-1.5 text-white"><Briefcase className="h-5 w-5" /></span> Smart Job Portal
  </Link>
);

export default function PublicLayout() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const links = [['/', 'Home'], ['/jobs', 'Find Jobs'], ['/about', 'About'], ['/contact', 'Contact']];
  const cls = ({ isActive }) => `text-sm font-medium hover:text-indigo-600 ${isActive ? 'text-indigo-600' : ''}`;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">{links.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{t}</NavLink>)}</nav>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={toggle} className="btn-outline btn-sm" aria-label="Toggle dark mode">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            {user ? <button className="btn-primary" onClick={() => nav(homeFor(user.role))}>Dashboard</button> : <>
              <Link to="/login" className="btn-outline">Login</Link><Link to="/register/student" className="btn-primary">Get Started</Link></>}
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 md:hidden" onClick={() => setOpen(false)}>
            {links.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{t}</NavLink>)}
            {user ? <Link to={homeFor(user.role)} className="btn-primary">Dashboard</Link> : <><Link to="/login" className="btn-outline">Login</Link><Link to="/register/student" className="btn-primary">Get Started</Link></>}
            <button onClick={toggle} className="btn-outline">{dark ? 'Light mode' : 'Dark mode'}</button>
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
          <div className="md:col-span-2"><Logo /><p className="muted mt-3 max-w-sm text-sm">An intelligent platform for job search, recruitment and application management. Built as a final-year project.</p></div>
          <div><h4 className="mb-3 font-semibold">For students</h4><ul className="muted space-y-2 text-sm"><li><Link to="/jobs">Find jobs</Link></li><li><Link to="/register/student">Create profile</Link></li></ul></div>
          <div><h4 className="mb-3 font-semibold">For recruiters</h4><ul className="muted space-y-2 text-sm"><li><Link to="/register/recruiter">Post a job</Link></li><li><Link to="/contact">Contact us</Link></li></ul></div>
        </div>
        <p className="muted border-t border-slate-200 py-4 text-center text-xs dark:border-slate-800">© {new Date().getFullYear()} Smart Job Portal. Academic project.</p>
      </footer>
    </div>
  );
}
