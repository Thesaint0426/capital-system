import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push(user.role === 'admin' ? '/admin' : '/investor/dashboard');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success('Welcome back');
      router.push(u.role === 'admin' ? '/admin' : '/investor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Member Login — Capital Invest</title></Head>

      <style>{`
        .login-page { min-height:100vh; background:#080808; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; position:relative; overflow:hidden; font-family:'Manrope',sans-serif; color:#f5f3ef; }
        .login-bg { position:fixed; inset:0; background:radial-gradient(ellipse 60% 60% at 50% 40%, rgba(200,169,110,0.04) 0%, transparent 55%); pointer-events:none; }
        .login-grid { position:fixed; inset:0; background-image:linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px); background-size:80px 80px; pointer-events:none; }
        .login-logo-wrap { text-align:center; margin-bottom:36px; }
        .login-logo { display:inline-flex; align-items:center; gap:10px; cursor:pointer; text-decoration:none; }
        .login-logo-text { font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#f5f3ef; }
        .login-logo-text span { color:#c8a96e; }
        .login-logo-tag { font-size:10px; color:#524f4b; letter-spacing:0.15em; text-transform:uppercase; text-align:center; margin-top:4px; }
        .login-card { width:100%; max-width:400px; background:#0c0c0c; border:1px solid #1e1e1e; border-radius:16px; padding:36px; position:relative; z-index:1; }
        .login-title { font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:700; letter-spacing:-0.02em; margin-bottom:6px; }
        .login-sub { font-size:13px; color:#8b8680; margin-bottom:28px; line-height:1.5; }
        .login-form { display:flex; flex-direction:column; gap:18px; }
        .field { display:flex; flex-direction:column; gap:6px; }
        .field-label { font-size:10px; font-weight:700; color:#524f4b; letter-spacing:0.1em; text-transform:uppercase; }
        .input { background:#080808; border:1px solid #252525; border-radius:7px; padding:12px 14px; color:#f5f3ef; font-family:'Manrope',sans-serif; font-size:14px; width:100%; outline:none; transition:border-color 0.15s; }
        .input:focus { border-color:#c8a96e; }
        .input::placeholder { color:#3a3734; }
        .btn-login { width:100%; padding:13px; background:#c8a96e; border:none; border-radius:7px; color:#000; font-family:'Manrope',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; letter-spacing:0.05em; text-transform:uppercase; }
        .btn-login:hover:not(:disabled) { background:#e0c07a; box-shadow:0 6px 24px rgba(200,169,110,0.2); }
        .btn-login:disabled { opacity:0.5; cursor:not-allowed; }
        .login-footer { text-align:center; margin-top:20px; font-size:12px; color:#524f4b; }
        .login-footer a { color:#c8a96e; cursor:pointer; }
        .login-footer a:hover { color:#e0c07a; }
        .login-divider { height:1px; background:#141414; margin:20px 0; }
        .login-note { text-align:center; font-size:11px; color:#3a3734; line-height:1.5; }
        .spinner-sm { width:15px; height:15px; border:2px solid rgba(0,0,0,0.2); border-top-color:#000; border-radius:50%; animation:spin 0.6s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="login-page">
        <div className="login-bg"></div>
        <div className="login-grid"></div>

        <div className="login-logo-wrap" style={{position:'relative',zIndex:1}}>
          <a className="login-logo" href="/">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" fill="none" stroke="#c8a96e" strokeWidth="1.2"/>
              <polygon points="14,2 24,8 14,14 4,8" fill="#c8a96e" opacity="0.85"/>
              <polygon points="4,8 14,14 4,20" fill="#a8894e" opacity="0.6"/>
              <polygon points="24,8 14,14 24,20" fill="#a8894e" opacity="0.6"/>
              <polygon points="14,14 4,20 14,26 24,20" fill="#c8a96e" opacity="0.4"/>
            </svg>
            <span className="login-logo-text">Capital<span>Invest</span></span>
          </a>
          <div className="login-logo-tag">Private Capital Platform</div>
        </div>

        <div className="login-card">
          <div className="login-title">Member Login</div>
          <div className="login-sub">Access your private investment dashboard</div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Email Address</label>
              <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input className="input" type="password" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? <><div className="spinner-sm"></div>Authenticating...</> : 'Access Dashboard'}
            </button>
          </form>

          <div className="login-divider"></div>
          <div className="login-note">
            Not yet a member?{' '}
            <span style={{color:'#c8a96e',cursor:'pointer'}} onClick={() => router.push('/apply')}>Apply for Access</span>
          </div>
        </div>

        <div style={{position:'relative',zIndex:1,marginTop:24,fontSize:11,color:'#3a3734',textAlign:'center'}}>
          Secure · Private · Encrypted
        </div>
      </div>
    </>
  );
}
