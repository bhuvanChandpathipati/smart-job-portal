import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Clock, Users, Bookmark, BookmarkCheck, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Avatar, MatchBadge } from '../components/ui';
import { fmtDate, fmtSalary, initials } from '../utils/format';

export default function JobDetails({ base = '/jobs' }) {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const { data, loading, reload } = useFetch(`/jobs/${id}`);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <Spinner />;
  if (!data) return <div className="p-10 text-center">Job not found. <Link className="text-indigo-600" to={base}>Back to jobs</Link></div>;
  const { job, match, applied, saved, expired, hasResume } = data;
  const isStudent = user?.role === 'student';

  const apply = async () => {
    setBusy(true);
    try { await api.post('/applications', { jobId: job._id, coverNote: note }); toast.success('Application submitted'); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const toggleSave = async () => {
    try { if (saved) await api.delete(`/saved-jobs/${job._id}`); else await api.post(`/saved-jobs/${job._id}`); toast.success(saved ? 'Removed from saved jobs' : 'Job saved'); reload(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const info = (I, t) => <span className="inline-flex items-center gap-1.5"><I className="h-4 w-4" />{t}</span>;
  return (
    <div className={base === '/jobs' ? 'mx-auto max-w-5xl px-4 py-8' : ''}>
      <button onClick={() => nav(-1)} className="muted mb-4 inline-flex items-center gap-1 text-sm hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="flex items-start gap-4">
              <Avatar text={initials(job.company?.name)} size="h-14 w-14" />
              <div className="flex-1"><h1 className="text-2xl font-bold">{job.title}</h1><p className="muted">{job.company?.name}</p></div>
              {match && <MatchBadge value={match.matchPercentage} />}
            </div>
            <div className="muted mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {info(MapPin, job.location)}{info(Clock, `Apply by ${fmtDate(job.deadline)}`)}{info(Users, `${job.vacancies} vacanc${job.vacancies === 1 ? 'y' : 'ies'}`)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">{job.jobType}</span>
              <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{job.experienceLevel}</span>
              <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{fmtSalary(job)}</span>
              <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{job.category}</span>
            </div>
          </div>
          <div className="card"><h2 className="mb-2 font-semibold">Job description</h2><p className="whitespace-pre-line text-sm leading-relaxed">{job.description}</p>
            <h2 className="mb-2 mt-5 font-semibold">Required skills</h2>
            <div className="flex flex-wrap gap-2">{job.skills.map((s) => <span key={s} className="rounded-md border border-slate-200 px-2.5 py-1 text-sm dark:border-slate-700">{s}</span>)}</div>
          </div>
          <div className="card"><h2 className="mb-2 font-semibold">About {job.company?.name}</h2>
            <p className="muted text-sm">{job.company?.description || 'No company description provided.'}</p>
            <p className="muted mt-2 text-sm">{[job.company?.industry, job.company?.location].filter(Boolean).join(' • ')}</p></div>
        </div>
        <div className="space-y-6">
          {isStudent && match && (
            <div className="card">
              <h2 className="mb-3 font-semibold">Your skill match</h2>
              <div className="mb-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${match.matchPercentage}%` }} /></div>
              <p className="mb-3 text-3xl font-bold">{match.matchPercentage}%</p>
              <p className="muted mb-3 text-sm">{match.explanation}</p>
              {match.matchingSkills.length > 0 && <div className="mb-2"><p className="mb-1 text-xs font-semibold text-emerald-600">Matching skills</p><div className="flex flex-wrap gap-1.5">{match.matchingSkills.map((s) => <span key={s} className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><CheckCircle2 className="mr-1 h-3 w-3" />{s}</span>)}</div></div>}
              {match.missingSkills.length > 0 && <div><p className="mb-1 text-xs font-semibold text-rose-600">Missing skills</p><div className="flex flex-wrap gap-1.5">{match.missingSkills.map((s) => <span key={s} className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><XCircle className="mr-1 h-3 w-3" />{s}</span>)}</div></div>}
            </div>)}
          <div className="card space-y-3">
            {!user && <><p className="text-sm">Log in as a student to apply for this job.</p><Link className="btn-primary w-full" to="/login" state={{ from: `/student/jobs/${job._id}` }}>Log in to apply</Link></>}
            {user && !isStudent && <p className="muted text-sm">You are signed in as {user.role}. Only students can apply.</p>}
            {isStudent && (applied ? <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="mr-1 inline h-4 w-4" /> You have applied for this job. <Link className="underline" to="/student/applications">Track it</Link></div>
              : expired ? <p className="text-sm text-rose-600">The application deadline has passed.</p> : <>
                {!hasResume && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">You have not uploaded a resume. <Link className="font-medium underline" to="/student/resume">Upload one</Link> so recruiters can review it.</p>}
                <textarea className="input" rows={3} maxLength={1000} placeholder="Cover note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="btn-primary w-full" onClick={apply} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Apply Now</button></>)}
            {isStudent && <button className="btn-outline w-full" onClick={toggleSave}>{saved ? <><BookmarkCheck className="h-4 w-4" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save job</>}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
