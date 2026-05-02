import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deposit, setDeposit] = useState('10000');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/api/admin/users')
      .then(r => setMembers(r.data))
      .catch(() => toast.error('Failed to load members'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!deposit || parseFloat(deposit) <= 0) { toast.error('Enter a valid deposit amount'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/admin/account', { user_id: selectedUser.id, initial_deposit: parseFloat(deposit) });
      toast.success(`Account activated for ${selectedUser.name}`);
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#c8a96e', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head><title>Members — Capital Invest Admin</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'Manrope,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, padding: '40px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Member Accounts</h1>
            <div style={{ fontSize: 13, color: '#524f4b' }}>{members.length} registered member{members.length !== 1 ? 's' : ''}</div>
          </div>

          <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                  {['Member', 'Initial Allocation', 'Balance', 'Performance', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #141414', transition: 'background 0.12s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#0a0a0a'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#3a3734', marginTop: 1 }}>{m.email}</div>
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>
                      {m.initial_deposit !== null ? fmt(m.initial_deposit) : <span style={{ color: '#3a3734' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>
                      {m.current_balance !== null ? fmt(m.current_balance) : <span style={{ color: '#3a3734' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13, color: parseFloat(m.total_profit || 0) >= 0 ? '#3ecf8e' : '#f87171' }}>
                      {m.total_profit !== null ? `${parseFloat(m.total_profit) >= 0 ? '+' : ''}${fmt(m.total_profit)}` : '—'}
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: 12, color: '#524f4b' }}>{fmtDate(m.created_at)}</td>
                    <td style={{ padding: '13px 14px' }}>
                      {m.current_balance !== null
                        ? <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(62,207,142,0.08)', color: '#3ecf8e', border: '1px solid rgba(62,207,142,0.12)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Active</span>
                        : <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(200,169,110,0.06)', color: '#c8a96e', border: '1px solid rgba(200,169,110,0.1)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pending Setup</span>}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      {m.current_balance === null ? (
                        <button onClick={() => { setSelectedUser(m); setDeposit('10000'); setShowModal(true); }}
                          style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #252525', borderRadius: 5, color: '#f5f3ef', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope,sans-serif', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.target.style.borderColor = '#c8a96e'; e.target.style.color = '#c8a96e'; }}
                          onMouseOut={e => { e.target.style.borderColor = '#252525'; e.target.style.color = '#f5f3ef'; }}>
                          Activate Account
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#3ecf8e' }}>✓ Activated</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!members.length && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>No members registered yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440 }}>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>Activate Account</div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 24 }}>Setting up account for <strong style={{ color: '#f5f3ef' }}>{selectedUser?.name}</strong></div>
            <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Initial Allocation (USD)</label>
                <input
                  style={{ background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'Space Mono,monospace', fontSize: 15, width: '100%', outline: 'none', transition: 'border-color 0.15s' }}
                  type="number" step="0.01" min="1" value={deposit}
                  onChange={e => setDeposit(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#c8a96e'}
                  onBlur={e => e.target.style.borderColor = '#252525'}
                  autoFocus required />
                <div style={{ fontSize: 11, color: '#3a3734', marginTop: 6 }}>Standard allocation is $10,000. Adjust only if agreed otherwise.</div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'Manrope,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding: '10px 20px', background: submitting ? '#3a3734' : '#c8a96e', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'Manrope,sans-serif', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Activating...' : 'Activate Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(AdminMembers, { adminOnly: true });
