import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Field, TagInput } from '../../components/ui';
import { EDU_LEVELS, LEVELS } from '../../utils/format';

const blankEdu = { institution: '', degree: '', field: '', year: '', grade: '' };
const blankExp = { company: '', role: '', duration: '', description: '' };

export default function Profile() {
  const [p, setP] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/students/profile').then((r) => setP(r.data.profile)).catch((e) => toast.error(errMsg(e))); }, []);
  if (!p) return <Spinner />;
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const setRow = (key, i, k, v) => setP({ ...p, [key]: p[key].map((r, n) => (n === i ? { ...r, [k]: v } : r)) });
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.put('/students/profile', p); setP(r.data.profile); toast.success('Profile saved'); } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title="My profile" subtitle="Recruiters see this when you apply. Skills drive your job recommendations.">
        <button className="btn-primary" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</button>
      </PageHeader>
      <div className="card grid gap-4 md:grid-cols-2">
        <Field label="Headline"><input className="input" maxLength={120} placeholder="e.g. Full Stack Developer" value={p.headline} onChange={set('headline')} /></Field>
        <Field label="Phone"><input className="input" value={p.phone} onChange={set('phone')} /></Field>
        <Field label="Location"><input className="input" value={p.location} onChange={set('location')} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Education level"><select className="input" value={p.educationLevel} onChange={set('educationLevel')}>{EDU_LEVELS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Experience level"><select className="input" value={p.experienceLevel} onChange={set('experienceLevel')}>{LEVELS.map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <div className="md:col-span-2"><Field label="About you"><textarea rows={3} maxLength={1000} className="input" value={p.about} onChange={set('about')} /></Field></div>
      </div>
      <div className="card"><h2 className="mb-3 font-semibold">Skills</h2><TagInput value={p.skills} onChange={(skills) => setP({ ...p, skills })} /></div>
      <div className="card space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Education</h2><button type="button" className="btn-outline btn-sm" onClick={() => setP({ ...p, education: [...p.education, { ...blankEdu }] })}><Plus className="h-4 w-4" /> Add</button></div>
        {!p.education.length && <p className="muted text-sm">No education added yet.</p>}
        {p.education.map((r, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 md:grid-cols-5">
            {[['institution', 'Institution'], ['degree', 'Degree'], ['field', 'Field'], ['year', 'Year'], ['grade', 'Grade']].map(([k, l]) => <input key={k} className="input" placeholder={l} aria-label={l} value={r[k] || ''} onChange={(e) => setRow('education', i, k, e.target.value)} />)}
            <button type="button" className="btn-outline btn-sm w-fit text-red-600" onClick={() => setP({ ...p, education: p.education.filter((_, n) => n !== i) })}><Trash2 className="h-4 w-4" /> Remove</button>
          </div>))}
      </div>
      <div className="card space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Experience</h2><button type="button" className="btn-outline btn-sm" onClick={() => setP({ ...p, experience: [...p.experience, { ...blankExp }] })}><Plus className="h-4 w-4" /> Add</button></div>
        {!p.experience.length && <p className="muted text-sm">No experience added. Internships and projects count too.</p>}
        {p.experience.map((r, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 md:grid-cols-3">
            {[['company', 'Company'], ['role', 'Role'], ['duration', 'Duration']].map(([k, l]) => <input key={k} className="input" placeholder={l} aria-label={l} value={r[k] || ''} onChange={(e) => setRow('experience', i, k, e.target.value)} />)}
            <textarea className="input md:col-span-3" rows={2} placeholder="What did you do?" value={r.description || ''} onChange={(e) => setRow('experience', i, 'description', e.target.value)} />
            <button type="button" className="btn-outline btn-sm w-fit text-red-600" onClick={() => setP({ ...p, experience: p.experience.filter((_, n) => n !== i) })}><Trash2 className="h-4 w-4" /> Remove</button>
          </div>))}
      </div>
    </form>
  );
}
