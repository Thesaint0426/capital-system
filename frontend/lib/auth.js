import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('capital_user');
    const token = localStorage.getItem('capital_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('capital_token', token);
    localStorage.setItem('capital_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    const { token, user } = res.data;
    localStorage.setItem('capital_token', token);
    localStorage.setItem('capital_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('capital_token');
    localStorage.removeItem('capital_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function withAuth(Component, { adminOnly = false } = {}) {
  return function ProtectedPage(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else if (adminOnly && user.role !== 'admin') {
          router.push('/investor/dashboard');
        } else if (!adminOnly && user.role === 'admin' && router.pathname.startsWith('/investor')) {
          router.push('/admin');
        }
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#050505' }}>
          <div className="spinner" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
