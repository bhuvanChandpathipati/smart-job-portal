import { Link } from 'react-router-dom';
import { MapPin, Clock, Bookmark, BookmarkCheck, IndianRupee } from 'lucide-react';
import { Avatar, MatchBadge } from './ui';
import { fmtDate, fmtSalary, initials } from '../utils/format';

export default function JobCard({ job, base = '/jobs', match, saved, onToggleSave }) {
  return (
    <div className="card flex flex-col gap-3 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar text={initials(job.company?.name)} />
        <div className="min-w-0 flex-1">
          <Link to={`${base}/${job._id}`} className="block truncate font-semibold hover:text-indigo-600">{job.title}</Link>
          <p className="muted truncate text-sm">{job.company?.name}</p>
        </div>
        {onToggleSave && (
          <button onClick={() => onToggleSave(job._id)} aria-label={saved ? 'Remove from saved jobs' : 'Save job'} className="text-slate-400 hover:text-indigo-600">
            {saved ? <BookmarkCheck className="h-5 w-5 text-indigo-600" /> : <Bookmark className="h-5 w-5" />}
          </button>
        )}
      </div>
      <div className="muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
        <span className="inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{fmtSalary(job).replace('₹', '')}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Apply by {fmtDate(job.deadline)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="badge bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">{job.jobType}</span>
        <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{job.experienceLevel}</span>
        {match && <MatchBadge value={match.matchPercentage} />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((s) => {
          const has = match?.matchingSkills?.includes(s);
          return <span key={s} className={`rounded-md border px-2 py-0.5 text-xs ${has ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700'}`}>{s}</span>;
        })}
        {job.skills.length > 4 && <span className="muted text-xs">+{job.skills.length - 4}</span>}
      </div>
    </div>
  );
}
