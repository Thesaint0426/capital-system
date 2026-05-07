import { useState } from 'react';
import Head from 'next/head';
import { withAuth, useAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import toast from 'react-hot-toast';

function InvestorProfile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success('Password updated successfully');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: '#080808', border: '1px solid #252525', borderRadius: 7,
    padding: '11px 14px', color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif',
    fontSize: 13, width: '100%', outline: 'none', transition: 'border-color 0.15s',
  };
  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b',
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6,
  };

  return (
    <>
      <Head><title>Profile — Capital Invest</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 'var(--sidebar-offset, 220px)', flex: 1, padding: '40px', maxWidth: 700 }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>
              Account Settings
            </h1>
            <div style={{ fontSize: 13, color: '#524f4b' }}>Manage your profile and security</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid #1e1e1e', paddingBottom: 0 }}>
            {[['profile', 'Profile'], ['security', 'Security']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: '9px 18px', background: 'none', border: 'none',
                borderBottom: tab === key ? '2px solid #00e87a' : '2px solid transparent',
                color: tab === key ? '#00e87a' : '#524f4b',
                fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', marginBottom: -1, transition: 'color 0.15s',
              }}>{label}</button>
            ))}
          </div>

          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Profile Info Card */}
              <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 28 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Account Information
                </div>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Space Mono,monospace', fontSize: 20, fontWeight: 700, color: '#00e87a',
                  }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: '#3a3734', marginTop: 3 }}>{user?.email}</div>
                    <div style={{ display: 'inline-flex', marginTop: 6, padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(0,232,122,0.06)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.12)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Member
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Full Name', value: user?.name },
                    { label: 'Email Address', value: user?.email },
                    { label: 'Account Role', value: 'Investor' },
                    { label: 'Member ID', value: `#${String(user?.id).padStart(4, '0')}` },
                  ].map((f, i) => (
                    <div key={i}>
                      <div style={labelStyle}>{f.label}</div>
                      <div style={{ ...inputStyle, color: '#8b8680', cursor: 'default' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '10px 14px', background: '#080808', border: '1px solid #141414', borderRadius: 7, fontSize: 11, color: '#3a3734' }}>
                  To update your name or email, please contact your account manager.
                </div>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div>
              <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 28 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Change Password
                </div>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <input
                      type="password"
                      style={inputStyle}
                      value={pwForm.current_password}
                      onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#00e87a'}
                      onBlur={e => e.target.style.borderColor = '#252525'}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input
                      type="password"
                      style={inputStyle}
                      value={pwForm.new_password}
                      onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#00e87a'}
                      onBlur={e => e.target.style.borderColor = '#252525'}
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input
                      type="password"
                      style={inputStyle}
                      value={pwForm.confirm_password}
                      onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#00e87a'}
                      onBlur={e => e.target.style.borderColor = '#252525'}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  {pwForm.new_password && pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                    <div style={{ fontSize: 12, color: '#f87171' }}>Passwords do not match</div>
                  )}
                  <div style={{ padding: '10px 14px', background: '#080808', border: '1px solid #141414', borderRadius: 7, fontSize: 11, color: '#3a3734' }}>
                    Password must be at least 6 characters. Choose a strong, unique password.
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || (pwForm.new_password !== pwForm.confirm_password && pwForm.confirm_password !== '')}
                    style={{
                      padding: '11px 20px', background: submitting ? '#3a3734' : '#00e87a',
                      border: 'none', borderRadius: 7, color: '#000',
                      fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer', alignSelf: 'flex-start',
                    }}
                  >
                    {submitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export default withAuth(InvestorProfile);
