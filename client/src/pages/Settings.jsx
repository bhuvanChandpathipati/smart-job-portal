import { useState } from 'react';
import toast from 'react-hot-toast';
import { Moon, Sun } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import { PageHeader, Field } from '../components/ui';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const run = async (fn, ok) => { try { await fn(); toast.success(ok); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your account and appearance." />
      <div className="grid max-w-3xl gap-6">
        <form className="card space-y-4" onSubmit={(e) => { e.preventDefault(); run(async () => setUser((await api.put('/auth/me', { name })).data.user), 'Name updated'); }}>
          <h2 className="font-semibold">Account</h2>
          <Field label="Email"><input className="input" value={user.email} disabled /></Field>
          <Field label="Full name"><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <button className="btn-primary">Save name</button>
        </form>
        <form className="card space-y-4" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.put('/auth/password', pw); setPw({ currentPassword: '', newPassword: '' }); }, 'Password changed'); }}>
          <h2 className="font-semibold">Change password</h2>
          <Field label="Current password"><input type="password" required className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
          <Field label="New password" hint="At least 6 characters"><input type="password" required minLength={6} className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
          <button className="btn-primary">Update password</button>
        </form>
        <div className="card flex items-center justify-between"><div><h2 className="font-semibold">Appearance</h2><p className="muted text-sm">Currently using {dark ? 'dark' : 'light'} mode.</p></div>
          <button className="btn-outline" onClick={toggle}>{dark ? <><Sun className="h-4 w-4" /> Light mode</> : <><Moon className="h-4 w-4" /> Dark mode</>}</button></div>
      </div>
    </>
  );
}
