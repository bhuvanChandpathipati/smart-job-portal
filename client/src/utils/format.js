export const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'];
export const LEVELS = ['Entry Level', 'Junior', 'Mid Level', 'Senior'];
export const EDU_LEVELS = ['Diploma', 'Bachelor', 'Master', 'PhD'];
export const CATEGORIES = ['Software Development', 'Data & Analytics', 'DevOps & Cloud', 'Testing & QA', 'Design', 'Other'];
export const STATUS_COLORS = { Applied: '#6366f1', 'Under Review': '#f59e0b', Shortlisted: '#10b981', 'Interview Scheduled': '#0ea5e9', Selected: '#16a34a', Rejected: '#ef4444' };
export const statusClass = (s) => ({
  Applied: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Shortlisted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Interview Scheduled': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Selected: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
}[s] || 'bg-slate-100 text-slate-700');
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const fmtSalary = (j) => (j.salaryMax ? `₹${j.salaryMin}–${j.salaryMax} LPA` : 'Not disclosed');
export const initials = (n = '') => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
export const homeFor = (role) => ({ student: '/student', recruiter: '/recruiter', admin: '/admin' }[role] || '/');
