import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Mail, Phone, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { errMsg, downloadFile } from '../../services/api';
import { Spinner, Avatar, MatchBadge } from '../../components/ui';
import { STATUSES, fmtDate, initials } from '../../utils/format';

export default function ApplicantDetails() {
  const { id } = useParams();
  const { data, loading, reload } = useFetch(`/applications/${id}`);
  if (loading) return <Spinner />;
  if (!data) return <p>Applicant not found.</p>;
  const { application: a, profile: p, match } = data;
  const update = async (status) => { try { await api.patch(`/applications/${id}/status`, { status }); toast.success(`Marked as ${status}`); reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <>
      <Link to="/recruiter/applicants" className="muted mb-4 inline-flex items-center gap-1 text-sm hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Applicants</Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="flex items-start gap-4"><Avatar text={initials(a.student.name)} size="h-14 w-14" />
              <div className="flex-1"><h1 className="text-xl font-bold">{a.student.name}</h1><p className="muted text-sm">{p?.headline || 'No headline'}</p>
                <div className="muted mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm"><span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{a.student.email}</span>
                  {p?.phone && <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{p.phone}</span>}{p?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{p.location}</span>}</div></div>
              <MatchBadge value={match.matchPercentage} /></div>
            {p?.about && <p className="mt-4 text-sm">{p.about}</p>}
          </div>
          <div className="card"><h2 className="mb-3 font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">{(p?.skills || []).map((s) => <span key={s} className="rounded-md border border-slate-200 px-2.5 py-1 text-sm dark:border-slate-700">{s}</span>)}{!p?.skills?.length && <p className="muted text-sm">No skills listed.</p>}</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><p className="mb-1 text-xs font-semibold text-emerald-600">Matches this job</p><div className="flex flex-wrap gap-1.5">{match.matchingSkills.map((s) => <span key={s} className="badge bg-emerald-100 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" />{s}</span>)}{!match.matchingSkills.length && <span className="muted text-sm">None</span>}</div></div>
              <div><p className="mb-1 text-xs font-semibold text-rose-600">Missing</p><div className="flex flex-wrap gap-1.5">{match.missingSkills.map((s) => <span key={s} className="badge bg-rose-100 text-rose-700"><XCircle className="mr-1 h-3 w-3" />{s}</span>)}{!match.missingSkills.length && <span className="muted text-sm">None</span>}</div></div></div></div>
          <div className="card"><h2 className="mb-3 font-semibold">Education</h2>
            {(p?.education || []).map((e, i) => <p key={i} className="text-sm"><b>{e.degree}</b> {e.field && `in ${e.field}`}, {e.institution} <span className="muted">({e.year}{e.grade && `, ${e.grade}`})</span></p>)}
            {!p?.education?.length && <p className="muted text-sm">Not provided.</p>}
            <h2 className="mb-3 mt-5 font-semibold">Experience</h2>
            {(p?.experience || []).map((e, i) => <div key={i} className="mb-2 text-sm"><p><b>{e.role}</b> at {e.company} <span className="muted">({e.duration})</span></p><p className="muted">{e.description}</p></div>)}
            {!p?.experience?.length && <p className="muted text-sm">Not provided.</p>}</div>
          {a.coverNote && <div className="card"><h2 className="mb-2 font-semibold">Cover note</h2><p className="whitespace-pre-line text-sm">{a.coverNote}</p></div>}
        </div>
        <div className="space-y-6">
          <div className="card space-y-3"><h2 className="font-semibold">Application</h2>
            <p className="text-sm"><span className="muted">Job:</span> {a.job.title}</p><p className="text-sm"><span className="muted">Applied:</span> {fmtDate(a.createdAt)}</p>
            <div><label className="label" htmlFor="st">Status</label><select id="st" className="input" value={a.status} onChange={(e) => update(e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="flex gap-2"><button className="btn-primary btn-sm flex-1" onClick={() => update('Shortlisted')}>Shortlist</button><button className="btn-danger btn-sm flex-1" onClick={() => update('Rejected')}>Reject</button></div>
            <button className="btn-outline w-full" disabled={!p?.resume?.filename} onClick={() => downloadFile(`/resumes/student/${a.student._id}`, p.resume.originalName).catch((e) => toast.error(errMsg(e)))}><Download className="h-4 w-4" /> {p?.resume?.filename ? 'Download resume' : 'No resume uploaded'}</button></div>
          <div className="card"><h2 className="mb-3 font-semibold">History</h2><ul className="space-y-2 text-sm">{a.statusHistory.map((h, i) => <li key={i} className="flex justify-between"><span>{h.status}</span><span className="muted">{fmtDate(h.date)}</span></li>)}</ul></div>
        </div>
      </div>
    </>
  );
}
