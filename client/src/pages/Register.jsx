import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { Field } from '../components/ui';
import { homeFor } from '../utils/format';

export default function Register({ role }) {
  const { register, user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', phone: '', companyName: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      const u = await register({ name: f.name, email: f.email, password: f.password, phone: f.phone, role, ...(role === 'recruiter' && { companyName: f.companyName }) });
      toast.success('Account created'); nav(homeFor(u.role), { replace: true });
    } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={submit} className="card space-y-4">
        <div><h1 className="text-2xl font-bold">{role === 'student' ? 'Create a student account' : 'Create a recruiter account'}</h1>
          <p className="muted text-sm">{role === 'student' ? 'Find jobs and track your applications.' : 'Post jobs and manage applicants.'}</p></div>
        <Field label="Full name"><input required className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input required type="email" className="input" value={f.email} onChange={set('email')} /></Field>
        {role === 'recruiter' && <Field label="Company name"><input required className="input" value={f.companyName} onChange={set('companyName')} /></Field>}
        <Field label="Phone (optional)"><input className="input" value={f.phone} onChange={set('phone')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" hint="At least 6 characters"><input required minLength={6} type="password" className="input" value={f.password} onChange={set('password')} /></Field>
          <Field label="Confirm password"><input required type="password" className="input" value={f.confirm} onChange={set('confirm')} /></Field>
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account</button>
        <p className="muted text-center text-sm">Already registered? <Link className="font-medium text-indigo-600" to="/login">Log in</Link> · {role === 'student'
          ? <Link className="font-medium text-indigo-600" to="/register/recruiter">I am a recruiter</Link> : <Link className="font-medium text-indigo-600" to="/register/student">I am a student</Link>}</p>
      </form>
    </div>
  );
}
