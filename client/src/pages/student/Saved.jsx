import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import api, { errMsg } from '../../services/api';
import { Spinner, PageHeader, Empty } from '../../components/ui';
import JobCard from '../../components/JobCard';

export default function Saved() {
  const { data, loading, reload } = useFetch('/saved-jobs');
  if (loading) return <Spinner />;
  const remove = async (id) => { try { await api.delete(`/saved-jobs/${id}`); toast.success('Removed from saved jobs'); reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <>
      <PageHeader title="Saved jobs" subtitle={`${data.saved.length} job${data.saved.length === 1 ? '' : 's'} saved`} />
      {!data.saved.length ? <Empty icon={Bookmark} title="No saved jobs" text="Tap the bookmark on any job to keep it here." action={<Link to="/student/jobs" className="btn-primary">Browse jobs</Link>} />
        : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.saved.map((s) => <JobCard key={s._id} job={s.job} base="/student/jobs" saved onToggleSave={remove} />)}</div>}
    </>
  );
}
