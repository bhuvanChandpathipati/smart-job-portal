import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((c) => { const t = localStorage.getItem('sjp_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
export const errMsg = (e) => e?.response?.data?.message || (e?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running on port 5000?' : e?.message) || 'Something went wrong';

// Authenticated file download (resumes need the JWT, so a plain link will not work)
export async function downloadFile(url, fallbackName = 'resume.pdf') {
  const res = await api.get(url, { responseType: 'blob' });
  const cd = res.headers['content-disposition'] || '';
  const name = decodeURIComponent((cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i) || [])[1] || fallbackName);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(res.data); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export default api;
