import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Field } from '../components/ui';
export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    // No external services: opens the visitor's own mail app
    window.location.href = `mailto:support@smartjobportal.local?subject=${encodeURIComponent(`Message from ${f.name}`)}&body=${encodeURIComponent(`${f.message}\n\nReply to: ${f.email}`)}`;
  };
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="muted mt-2">Questions about the project or your account? Send a message and your email app will open with it ready to send.</p>
      <form onSubmit={submit} className="card mt-6 space-y-4">
        <Field label="Your name"><input required className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input required type="email" className="input" value={f.email} onChange={set('email')} /></Field>
        <Field label="Message"><textarea required rows={5} className="input" value={f.message} onChange={set('message')} /></Field>
        <button className="btn-primary"><Mail className="h-4 w-4" /> Send message</button>
      </form>
    </div>
  );
}
