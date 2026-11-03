import { useState } from 'react';
import { Loader2, Inbox, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { statusClass } from '../utils/format';

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-slate-500" role="status">
    <Loader2 className="h-5 w-5 animate-spin" /> <span className="text-sm">{label}</span>
  </div>
);

export const Empty = ({ title = 'Nothing here yet', text, action, icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
    <Icon className="mb-3 h-10 w-10 text-slate-400" />
    <h3 className="font-semibold">{title}</h3>
    {text && <p className="muted mt-1 max-w-sm text-sm">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, tone = 'indigo' }) => {
  const tones = { indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300', green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300', rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300' };
  return (
    <div className="card flex items-center gap-4">
      <div className={`rounded-lg p-3 ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-2xl font-bold leading-none">{value}</p><p className="muted mt-1 text-sm">{label}</p></div>
    </div>
  );
};

export const StatusBadge = ({ status }) => <span className={`badge ${statusClass(status)}`}>{status}</span>;

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="muted mt-1 text-sm">{subtitle}</p>}</div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export const Pagination = ({ page, pages, onChange }) => pages > 1 && (
  <div className="mt-6 flex items-center justify-center gap-3">
    <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-4 w-4" /> Previous</button>
    <span className="text-sm">Page {page} of {pages}</span>
    <button className="btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next <ChevronRight className="h-4 w-4" /></button>
  </div>
);

export const Field = ({ label, children, hint }) => (
  <div><label className="label">{label}</label>{children}{hint && <p className="muted mt-1 text-xs">{hint}</p>}</div>
);

export function TagInput({ value = [], onChange, placeholder = 'Type a skill and press Enter' }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setText('');
  };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((t) => (
          <span key={t} className="badge gap-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
            {t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input" value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} />
        <button type="button" className="btn-outline" onClick={add}>Add</button>
      </div>
    </div>
  );
}

export const MatchBadge = ({ value }) => {
  const c = value >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : value >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return <span className={`badge ${c}`}>{value}% match</span>;
};

export const Avatar = ({ text, size = 'h-11 w-11' }) => (
  <div className={`${size} flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white`}>{text}</div>
);
