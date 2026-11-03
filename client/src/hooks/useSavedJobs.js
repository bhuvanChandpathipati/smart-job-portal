import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function useSavedJobs() {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);
  useEffect(() => { if (user?.role === 'student') api.get('/saved-jobs').then((r) => setIds(r.data.ids)).catch(() => {}); }, [user]);
  const toggle = useCallback(async (id) => {
    try {
      if (ids.includes(id)) { await api.delete(`/saved-jobs/${id}`); setIds((p) => p.filter((x) => x !== id)); toast.success('Removed from saved jobs'); }
      else { await api.post(`/saved-jobs/${id}`); setIds((p) => [...p, id]); toast.success('Job saved'); }
    } catch (e) { toast.error(errMsg(e)); }
  }, [ids]);
  return { ids, toggle, enabled: user?.role === 'student' };
}
