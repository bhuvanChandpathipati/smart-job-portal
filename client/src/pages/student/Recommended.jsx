import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useSavedJobs from '../../hooks/useSavedJobs';
import { Spinner, PageHeader, Empty } from '../../components/ui';
import JobCard from '../../components/JobCard';

export default function Recommended() {
  const { data, loading } = useFetch('/jobs/recommended');
  const saved = useSavedJobs();
  if (loading) return <Spinner />;
  return (
    <>
      <PageHeader title="Recommended jobs" subtitle="Ranked by skill overlap (70%), experience level (20%) and education (10%)." />
      {!data.hasSkills && <div className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">Your profile has no skills yet. <Link className="font-medium underline" to="/student/profile">Add skills</Link> to see accurate matches.</div>}
      {!data.recommendations.length ? <Empty icon={Sparkles} title="No matching jobs found" text="Add more skills to your profile or check back when new jobs are posted." />
        : <div className="space-y-4">{data.recommendations.map(({ job, match, applied }) => (
          <div key={job._id} className="space-y-2">
            <JobCard job={job} match={match} base="/student/jobs" saved={saved.ids.includes(job._id)} onToggleSave={saved.toggle} />
            <div className="card !py-3 text-sm"><p className="muted">{match.explanation}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{match.missingSkills.map((s) => <span key={s} className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">Missing: {s}</span>)}{applied && <span className="badge bg-emerald-100 text-emerald-700">Applied</span>}</div></div>
          </div>))}</div>}
    </>
  );
}
