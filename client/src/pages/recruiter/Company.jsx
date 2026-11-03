import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Field } from '../../components/ui';

export default function Company() {
  const [p, setP] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/recruiters/profile').then((r) => setP(r.data.profile)).catch((e) => toast.error(errMsg(e))); }, []);
  if (!p) return <Spinner />;
  const c = p.company;
  const setC = (k) => (e) => setP({ ...p, company: { ...c, [k]: e.target.value } });
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.put('/recruiters/profile', { designation: p.designation, phone: p.phone, company: c }); setP(r.data.profile); toast.success('Company profile saved'); }
    catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save}>
      <PageHeader title="Company profile" subtitle="Students see these details on every job you post.">
        <button className="btn-primary" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</button>
      </PageHeader>
      <div className="card grid gap-4 md:grid-cols-2">
        <Field label="Company name"><input required className="input" value={c.name} onChange={setC('name')} /></Field>
        <Field label="Website"><input className="input" value={c.website} onChange={setC('website')} /></Field>
        <Field label="Industry"><input className="input" value={c.industry} onChange={setC('industry')} /></Field>
        <Field label="Location"><input className="input" value={c.location} onChange={setC('location')} /></Field>
        <Field label="Company size"><select className="input" value={c.size} onChange={setC('size')}><option value="">Select</option>{['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Your designation"><input className="input" value={p.designation} onChange={(e) => setP({ ...p, designation: e.target.value })} /></Field>
        <Field label="Phone"><input className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
        <div className="md:col-span-2"><Field label="About the company"><textarea rows={4} maxLength={1500} className="input" value={c.description} onChange={setC('description')} /></Field></div>
      </div>
    </form>
  );
}
