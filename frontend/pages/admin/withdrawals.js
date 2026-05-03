import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('pending');

  const load = () => {
    api.get('/api/admin/withdrawals')
      .then(r => setWithdrawals(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(actionModal.id);
    try {
      await api.post(`/api/admin/withdrawal/${actionModal.id}/${actionModal.action}`, { admin_note: note || undefined });
      toast.success(`Withdrawal ${actionModal.action === 'approve' ? 'approved' : 'rejected'}`);
      setActionModal(null);
      setNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const pending = withdrawals.filter(w => w.status === 'pending');
  const filtered = withdrawals.filter(w => filter === 'all' ? true : w.status === filter);

  const statusStyle = (s) => ({
    pending: { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.15)' },
    approved: { bg: 'rgba(62,207,142,0.08)', color: '#3ecf8e', border: 'rgba(62,207,142,0.15)' },
    rejected: { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.15)' },
    paid: { bg: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: 'rgba(96,165,250,0.15)' },
  })[s] || { bg: 'rgba(82,79,75,0.1)', color: '#524f4b', border: 'rgba(82,79,75,0.1)' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head><title>Withdrawals — Capital Invest Admin</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, padding: '40px' }}>

          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Withdrawal Requests</h1>
              <div style={{ fontSize: 13, color: '#524f4b' }}>{pending.length} pending · {withdrawals.length} total</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['pending', 'approved', 'rejected', 'all'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '7px 14px', border: '1px solid', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.15s',
                  background: filter === f ? '#00e87a' : 'transparent',
                  color: filter === f ? '#000' : '#524f4b',
                  borderColor: filter === f ? '#00e87a' : '#1e1e1e',
                }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Pending Highlight Cards */}
          {filter === 'pending' && pending.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Awaiting Approval ({pending.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(w => (
                  <div key={w.id} style={{ background: '#0c0c0c', border: '1px solid rgba(0,232,122,0.15)', borderRadius: 12, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(0,232,122,0.08)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.12)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pending</span>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{w.user_name}</span>
                          <span style={{ fontSize: 12, color: '#3a3734' }}>{w.user_email}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                          {[
                            { label: 'Requested', value: fmt(w.amount), color: '#f5f3ef' },
                            { label: 'Fee (0.5%)', value: `−${fmt(w.fee)}`, color: '#f87171' },
                            { label: 'Net Payout', value: fmt(w.net_amount), color: '#3ecf8e' },
                          ].map((m, i) => (
                            <div key={i}>
                              <div style={{ fontSize: 10, color: '#3a3734', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{m.label}</div>
                              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                        {w.network && (
                          <div style={{ marginTop: 10, fontSize: 11, color: '#524f4b' }}>Network: {w.network}</div>
                        )}
                        {w.wallet_address && (
                          <div style={{ marginTop: 4, fontSize: 11, color: '#3a3734', fontFamily: 'Space Mono,monospace', wordBreak: 'break-all' }}>
                            {w.wallet_address}
                          </div>
                        )}
                        <div style={{ marginTop: 8, fontSize: 11, color: '#3a3734' }}>Requested {fmtDate(w.requested_at)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <button onClick={() => { setActionModal({ id: w.id, action: 'reject', name: w.user_name }); setNote(''); }}
                          disabled={processing === w.id}
                          style={{ padding: '9px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 7, color: '#f87171', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Reject
                        </button>
                        <button onClick={() => { setActionModal({ id: w.id, action: 'approve', name: w.user_name, amount: w.net_amount }); setNote(''); }}
                          disabled={processing === w.id}
                          style={{ padding: '9px 16px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {processing === w.id ? 'Processing...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Table */}
          {(filter !== 'pending' || pending.length === 0) && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                {filter === 'pending' ? 'No Pending Requests' : `${filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Requests (${filtered.length})`}
              </div>
              {filtered.length === 0 ? (
                <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 40, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>
                  No {filter} withdrawal requests
                </div>
              ) : (
                <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                        {['Member', 'Status', 'Amount', 'Fee', 'Net Payout', 'Network', 'Requested', 'Note'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(w => {
                        const ss = statusStyle(w.status);
                        return (
                          <tr key={w.id} style={{ borderBottom: '1px solid #141414', transition: 'background 0.12s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#0a0a0a'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '13px 14px' }}>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{w.user_name}</div>
                              <div style={{ fontSize: 11, color: '#3a3734' }}>{w.user_email}</div>
                            </td>
                            <td style={{ padding: '13px 14px' }}>
                              <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{w.status}</span>
                            </td>
                            <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>{fmt(w.amount)}</td>
                            <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 12, color: '#524f4b' }}>{fmt(w.fee)}</td>
                            <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13, color: '#3ecf8e' }}>{fmt(w.net_amount)}</td>
                            <td style={{ padding: '13px 14px', fontSize: 11, color: '#524f4b' }}>{w.network || '—'}</td>
                            <td style={{ padding: '13px 14px', fontSize: 11, color: '#524f4b' }}>{fmtDate(w.requested_at)}</td>
                            <td style={{ padding: '13px 14px', fontSize: 11, color: '#3a3734', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.admin_note || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              {actionModal.action === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
            </div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 20 }}>
              {actionModal.action === 'approve'
                ? `Confirm approval for ${actionModal.name}. Net payout: ${fmt(actionModal.amount)}`
                : `Reject withdrawal request from ${actionModal.name}`}
            </div>
            {actionModal.action === 'approve' && (
              <div style={{ padding: '11px 14px', background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.12)', borderRadius: 7, fontSize: 12, color: '#00e87a', marginBottom: 16 }}>
                ⚠ This will deduct the gross amount from the member's balance. Ensure you pay the net amount manually.
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Admin Note (optional)
              </label>
              <input
                style={{ background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif', fontSize: 13, width: '100%', outline: 'none' }}
                type="text"
                placeholder={actionModal.action === 'approve' ? 'e.g. Paid via USDT TRC20' : 'e.g. Cycle still active'}
                value={note}
                onChange={e => setNote(e.target.value)}
                autoFocus
                onFocus={e => e.target.style.borderColor = '#00e87a'}
                onBlur={e => e.target.style.borderColor = '#252525'}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setActionModal(null); setNote(''); }}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleAction}
                style={{
                  padding: '10px 20px', border: 'none', borderRadius: 7, fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: actionModal.action === 'approve' ? '#00e87a' : 'rgba(248,113,113,0.1)',
                  color: actionModal.action === 'approve' ? '#000' : '#f87171',
                  border: actionModal.action === 'approve' ? 'none' : '1px solid rgba(248,113,113,0.2)',
                }}>
                Confirm {actionModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export default withAuth(AdminWithdrawals, { adminOnly: true });
