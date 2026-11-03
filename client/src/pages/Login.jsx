import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { Field } from '../components/ui';
import { homeFor } from '../utils/format';

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const u = await login(f.email, f.password); toast.success(`Welcome back, ${u.name.split(' ')[0]}`); nav(loc.state?.from || homeFor(u.role), { replace: true }); }
    catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <form onSubmit={submit} className="card space-y-4">
        <div><h1 className="text-2xl font-bold">Log in</h1><p className="muted text-sm">Students, recruiters and administrators sign in here.</p></div>
        <Field label="Email"><input type="email" required autoComplete="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required autoComplete="current-password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Log in</button>
        <p className="muted text-center text-sm">New here? <Link className="font-medium text-indigo-600" to="/register/student">Register as student</Link> or <Link className="font-medium text-indigo-600" to="/register/recruiter">as recruiter</Link></p>
      </form>
    </div>
  );
}
