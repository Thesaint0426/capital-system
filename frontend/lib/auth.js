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
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Public pages that don't redirect logged-in users
const PUBLIC_PAGES = ['/login', '/apply', '/', '/faq', '/risk', '/terms', '/privacy', '/compliance', '/withdrawal-policy', '/reset-password'];

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
        } else if (!adminOnly && user.role === 'admin') {
          // Don't force admins away from investor pages if they manually navigate
          // Only redirect if strictly investor-only
        }
      }
    }, [user, loading]);

    if (loading || !user) {
      return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#080808', flexDirection:'column', gap:16 }}>
          <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:700, letterSpacing:'0.08em', color:'#3a3734', textTransform:'uppercase' }}>Capital<span style={{color:'#00e87a'}}>Invest</span></div>
          <div style={{ width:24, height:24, border:'2px solid #1e1e1e', borderTopColor:'#00e87a', borderRadius:'50%', animation:'spin 0.6s linear infinite' }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      );
    }
    return <Component {...props} />;
  };
}
