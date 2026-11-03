import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Field, TagInput } from '../../components/ui';
import { JOB_TYPES, LEVELS, CATEGORIES, toInputDate } from '../../utils/format';

const blank = { title: '', description: '', skills: [], location: '', salaryMin: 0, salaryMax: 0, jobType: 'Full-time', experienceLevel: 'Entry Level', category: CATEGORIES[0], vacancies: 1, deadline: '', isActive: true };

export default function JobForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(id ? null : blank);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (id) api.get(`/jobs/${id}`).then((r) => setF({ ...r.data.job, deadline: toInputDate(r.data.job.deadline) })).catch((e) => { toast.error(errMsg(e)); nav('/recruiter/jobs'); }); }, [id]); // eslint-disable-line
  if (!f) return <Spinner />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { ...f, salaryMin: +f.salaryMin || 0, salaryMax: +f.salaryMax || 0, vacancies: +f.vacancies || 1 };
    try {
      if (id) await api.put(`/jobs/${id}`, body); else await api.post('/jobs', body);
      toast.success(id ? 'Job updated' : 'Job posted'); nav('/recruiter/jobs');
    } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  const sel = (k, opts) => <select className="input" value={f[k]} onChange={set(k)}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? 'Edit job' : 'Post a new job'} subtitle="Clear titles and accurate skills lead to better applicants." />
      <div className="card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><Field label="Job title"><input required className="input" value={f.title} onChange={set('title')} /></Field></div>
        <div className="md:col-span-2"><Field label="Description" hint="At least 20 characters"><textarea required rows={6} className="input" value={f.description} onChange={set('description')} /></Field></div>
        <div className="md:col-span-2"><Field label="Required skills"><TagInput value={f.skills} onChange={(skills) => setF({ ...f, skills })} /></Field></div>
        <Field label="Location"><input required className="input" placeholder="City, State or Remote" value={f.location} onChange={set('location')} /></Field>
        <Field label="Category">{sel('category', CATEGORIES)}</Field>
        <Field label="Job type">{sel('jobType', JOB_TYPES)}</Field>
        <Field label="Experience level">{sel('experienceLevel', LEVELS)}</Field>
        <Field label="Minimum salary (LPA)"><input type="number" min="0" step="0.1" className="input" value={f.salaryMin} onChange={set('salaryMin')} /></Field>
        <Field label="Maximum salary (LPA)"><input type="number" min="0" step="0.1" className="input" value={f.salaryMax} onChange={set('salaryMax')} /></Field>
        <Field label="Vacancies"><input type="number" min="1" className="input" value={f.vacancies} onChange={set('vacancies')} /></Field>
        <Field label="Application deadline"><input required type="date" className="input" value={f.deadline} onChange={set('deadline')} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} /> Accepting applications</label>
      </div>
      <div className="mt-4 flex gap-3"><button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} {id ? 'Save changes' : 'Post job'}</button>
        <button type="button" className="btn-outline" onClick={() => nav('/recruiter/jobs')}>Cancel</button></div>
    </form>
  );
}
