import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('sjp_token'));

  useEffect(() => {
    if (!localStorage.getItem('sjp_token')) return;
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('sjp_token')).finally(() => setLoading(false));
  }, []);

  const finish = (data) => { localStorage.setItem('sjp_token', data.token); setUser(data.user); return data.user; };
  const login = async (email, password) => finish((await api.post('/auth/login', { email, password })).data);
  const register = async (payload) => finish((await api.post('/auth/register', payload)).data);
  const logout = useCallback(() => { localStorage.removeItem('sjp_token'); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
