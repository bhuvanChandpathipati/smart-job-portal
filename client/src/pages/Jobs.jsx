import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import useSavedJobs from '../hooks/useSavedJobs';
import { Spinner, Empty, Pagination, PageHeader } from '../components/ui';
import { JOB_TYPES, LEVELS, CATEGORIES } from '../utils/format';

const EMPTY = { q: '', location: '', skills: '', jobType: '', experienceLevel: '', category: '', minSalary: '', maxSalary: '' };

export default function Jobs({ base = '/jobs' }) {
  const [params] = useSearchParams();
  const [f, setF] = useState({ ...EMPTY, q: params.get('q') || '', category: params.get('category') || '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const saved = useSavedJobs();

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ page, limit: 9, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '')) });
        setData((await api.get(`/jobs?${qs}`)).data);
      } catch { setData({ jobs: [], total: 0, pages: 1 }); } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [f, page]);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const sel = (k, label, opts) => (
    <select className="input" value={f[k]} onChange={set(k)} aria-label={label}><option value="">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>
  );
  const typeChips = ['Full-time', 'Part-time', 'Internship', 'Remote'];
  return (
    <div className={base === '/jobs' ? 'mx-auto max-w-7xl px-4 py-8' : ''}>
      <PageHeader title="Find jobs" subtitle={data ? `${data.total} open position${data.total === 1 ? '' : 's'}` : 'Search open positions'} />
      <div className="card mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input pl-9" placeholder="Search by job title, company or skill" value={f.q} onChange={set('q')} aria-label="Search" /></div>
          <button className="btn-outline" onClick={() => setShow(!show)}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
          <button className="btn-outline" onClick={() => { setF(EMPTY); setPage(1); }} title="Clear all filters"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeChips.map((t) => <button key={t} onClick={() => { setF({ ...f, jobType: f.jobType === t ? '' : t }); setPage(1); }}
            className={`badge cursor-pointer px-3 py-1 ${f.jobType === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{t}</button>)}
          <button onClick={() => { setF({ ...f, experienceLevel: f.experienceLevel === 'Entry Level' ? '' : 'Entry Level' }); setPage(1); }}
            className={`badge cursor-pointer px-3 py-1 ${f.experienceLevel === 'Entry Level' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>Entry level</button>
        </div>
        {show && (
          <div className="grid gap-3 border-t border-slate-200 pt-3 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
            <input className="input" placeholder="Location" value={f.location} onChange={set('location')} />
            <input className="input" placeholder="Skills (comma separated)" value={f.skills} onChange={set('skills')} />
            {sel('jobType', 'Any job type', JOB_TYPES)}{sel('experienceLevel', 'Any experience', LEVELS)}{sel('category', 'Any category', CATEGORIES)}
            <input className="input" type="number" min="0" placeholder="Min salary (LPA)" value={f.minSalary} onChange={set('minSalary')} />
            <input className="input" type="number" min="0" placeholder="Max salary (LPA)" value={f.maxSalary} onChange={set('maxSalary')} />
          </div>)}
      </div>
      {loading ? <Spinner /> : !data?.jobs.length ? <Empty title="No jobs match your search" text="Try removing a filter or searching with a different keyword." /> : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.jobs.map((j) => <JobCard key={j._id} job={j} base={base} saved={saved.ids.includes(j._id)} onToggleSave={saved.enabled ? saved.toggle : undefined} />)}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>)}
    </div>
  );
}
