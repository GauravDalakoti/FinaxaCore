import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/me', profileData);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isAnalyst: user?.role === 'analyst',
    isViewer: user?.role === 'viewer',
    canManageRecords: user?.role === 'admin',
    canViewAnalytics: ['analyst', 'admin'].includes(user?.role),
    canManageUsers: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};