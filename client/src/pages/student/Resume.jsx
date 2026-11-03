import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Upload, Download, Trash2, Loader2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api, { errMsg, downloadFile } from '../../services/api';
import { Spinner, PageHeader } from '../../components/ui';
import { fmtDate } from '../../utils/format';

export default function Resume() {
  const { data, loading, reload } = useFetch('/students/profile');
  const [busy, setBusy] = useState(false);
  const input = useRef();
  if (loading) return <Spinner />;
  const resume = data.profile.resume?.filename ? data.profile.resume : null;

  const upload = async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Only PDF files are allowed');
    if (file.size > 2 * 1024 * 1024) return toast.error('Resume must be 2 MB or smaller');
    const fd = new FormData(); fd.append('resume', file);
    setBusy(true);
    try { await api.post('/resumes/upload', fd); toast.success(resume ? 'Resume replaced' : 'Resume uploaded'); reload(); } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm('Remove your resume?')) return;
    try { await api.delete('/resumes/me'); toast.success('Resume removed'); reload(); } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <>
      <PageHeader title="Resume" subtitle="Upload a PDF up to 2 MB. Recruiters can download it when you apply." />
      <div className="card max-w-2xl">
        {resume ? (
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-lg bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/40"><FileText className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{resume.originalName}</p><p className="muted text-sm">{(resume.size / 1024).toFixed(0)} KB • uploaded {fmtDate(resume.uploadedAt)}</p></div>
            <div className="flex gap-2">
              <button className="btn-outline btn-sm" onClick={() => downloadFile('/resumes/me', resume.originalName).catch((e) => toast.error(errMsg(e)))}><Download className="h-4 w-4" /> Download</button>
              <button className="btn-outline btn-sm text-red-600" onClick={remove}><Trash2 className="h-4 w-4" /> Remove</button>
            </div>
          </div>
        ) : <p className="muted text-sm">You have not uploaded a resume yet.</p>}
        <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={upload} />
        <button className="btn-primary mt-5" disabled={busy} onClick={() => input.current.click()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {resume ? 'Replace resume' : 'Upload resume'}</button>
      </div>
    </>
  );
}
