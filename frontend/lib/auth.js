import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('ci_user');
    const token = localStorage.getItem('ci_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('ci_token', token);
    localStorage.setItem('ci_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('ci_token');
    localStorage.removeItem('ci_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
        if (!user) router.push('/login');
        else if (adminOnly && user.role !== 'admin') router.push('/investor/dashboard');
        else if (!adminOnly && user.role === 'admin') router.push('/admin');
      }
    }, [user, loading]);

    if (loading || !user) {
      return (
        <div className="page-loader">
          <div className="page-loader-logo">Capital<span style={{color:'#c8a96e'}}>Invest</span></div>
          <div className="spinner spinner-lg" />
        </div>
      );
    }
    return <Component {...props} />;
  };
}
