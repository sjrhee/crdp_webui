import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

type User = { username: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    if (!token) { setUser(null); return; }
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch {
      // invalid token
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMe().finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (username: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    const res = await api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const accessToken = res.data?.access_token as string;
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    // Optionally set user optimistically; backend /me will refresh later via effect
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
