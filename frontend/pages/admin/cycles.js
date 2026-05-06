import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate, daysLeft, cyclePct, sign } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminCycles() {
  const [cycles, setCycles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [startForm, setStartForm] = useState({ user_id: '', amount: '10000', notes: '' });
  const [closeForm, setCloseForm] = useState({ result_amount: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [c, m] = await Promise.all([api.get('/api/admin/cycles'), api.get('/api/admin/users')]);
    setCycles(c.data);
    setMembers(m.data.filter(u => u.current_balance !== null));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStartCycle = async (e) => {
    e.preventDefault();
    if (!startForm.user_id || !startForm.amount) { toast.error('Fill all required fields'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/admin/cycle', { user_id: parseInt(startForm.user_id), amount: parseFloat(startForm.amount), notes: startForm.notes || undefined });
      toast.success('Cycle started');
      setShowStart(false);
      setStartForm({ user_id: '', amount: '10000', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCycle = async (e) => {
    e.preventDefault();
    if (!closeForm.result_amount || parseFloat(closeForm.result_amount) <= 0) { toast.error('Enter a valid result amount'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/admin/close-cycle', { cycle_id: selectedCycle.id, result_amount: parseFloat(closeForm.result_amount), notes: closeForm.notes || undefined });
      toast.success('Cycle closed and result recorded');
      setShowClose(false);
      setSelectedCycle(null);
      setCloseForm({ result_amount: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const active = cycles.filter(c => c.status === 'active');
  const completed = cycles.filter(c => c.status === 'completed');
  const selectedMember = members.find(m => m.id === parseInt(startForm.user_id));
  const plPreview = closeForm.result_amount && selectedCycle
    ? parseFloat(closeForm.result_amount) - parseFloat(selectedCycle.amount) : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const inputStyle = { background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif', fontSize: 13, width: '100%', outline: 'none', transition: 'border-color 0.15s' };
  const labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <>
      <Head><title>Cycles — Capital Invest Admin</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 'var(--sidebar-offset, 220px)', flex: 1, padding: '40px' }}>
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Investment Cycles</h1>
              <div style={{ fontSize: 13, color: '#524f4b' }}>{active.length} active · {completed.length} completed</div>
            </div>
            <button onClick={() => setShowStart(true)} style={{ padding: '10px 20px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}>
              + Start New Cycle
            </button>
          </div>

          {/* Active Cycles */}
          {active.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Active Cycles ({active.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map(c => (
                  <div key={c.id} style={{ background: '#0c0c0c', border: '1px solid rgba(0,232,122,0.15)', borderRadius: 12, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(0,232,122,0.08)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.12)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>● Active</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{c.user_name}</span>
                          <span style={{ fontSize: 11, color: '#3a3734' }}>{c.user_email}</span>
                        </div>
                        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 24, fontWeight: 700, color: '#00e87a' }}>{fmt(c.amount)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right', fontSize: 12, color: '#524f4b' }}>
                          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 20, fontWeight: 700, color: '#f5f3ef' }}>{daysLeft(c.end_date)}</div>
                          <div style={{ fontSize: 10, color: '#3a3734', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Days Left</div>
                          <div style={{ fontSize: 11, marginTop: 4 }}>{fmtDate(c.start_date)} → {fmtDate(c.end_date)}</div>
                        </div>
                        <button onClick={() => { setSelectedCycle(c); setCloseForm({ result_amount: '', notes: '' }); setShowClose(true); }}
                          style={{ padding: '9px 16px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Close Cycle
                        </button>
                      </div>
                    </div>
                    <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#3a3734' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progress</span>
                      <span>{Math.round(cyclePct(c.start_date, c.end_date))}%</span>
                    </div>
                    <div style={{ height: 3, background: '#1e1e1e', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${cyclePct(c.start_date, c.end_date)}%`, background: 'linear-gradient(90deg,#00e87a,#3ecf8e)', borderRadius: 2 }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Cycles Table */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>All Cycles ({cycles.length})</div>
            <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                    {['Member', 'Status', 'Allocation', 'Result', 'Performance', 'Start', 'End', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cycles.map(c => {
                    const pl = parseFloat(c.profit_loss || 0);
                    const sc = c.status === 'active' ? { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.12)' } : { bg: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: 'rgba(96,165,250,0.12)' };
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #141414', transition: 'background 0.12s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#0a0a0a'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '13px 14px' }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{c.user_name}</div>
                          <div style={{ fontSize: 11, color: '#3a3734' }}>{c.user_email}</div>
                        </td>
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{c.status}</span>
                        </td>
                        <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>{fmt(c.amount)}</td>
                        <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>{c.result_amount ? fmt(c.result_amount) : <span style={{ color: '#3a3734' }}>—</span>}</td>
                        <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13, color: c.profit_loss !== null ? (pl >= 0 ? '#3ecf8e' : '#f87171') : '#3a3734' }}>
                          {c.profit_loss !== null ? `${sign(pl)}${fmt(pl)}` : '—'}
                        </td>
                        <td style={{ padding: '13px 14px', fontSize: 12, color: '#524f4b' }}>{fmtDate(c.start_date)}</td>
                        <td style={{ padding: '13px 14px', fontSize: 12, color: '#524f4b' }}>{fmtDate(c.end_date)}</td>
                        <td style={{ padding: '13px 14px' }}>
                          {c.status === 'active' && (
                            <button onClick={() => { setSelectedCycle(c); setCloseForm({ result_amount: '', notes: '' }); setShowClose(true); }}
                              style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #252525', borderRadius: 5, color: '#f5f3ef', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Close</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!cycles.length && <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>No cycles yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Start Cycle Modal */}
      {showStart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>Start Investment Cycle</div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 24 }}>Initiate a new 30-day cycle for a member</div>
            <form onSubmit={handleStartCycle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Member *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={startForm.user_id} onChange={e => setStartForm(f => ({ ...f, user_id: e.target.value }))} required
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'}>
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} — {fmt(m.current_balance)} balance</option>)}
                </select>
                {selectedMember && <div style={{ fontSize: 11, color: '#3a3734', marginTop: 5 }}>Available: {fmt(selectedMember.current_balance)}</div>}
              </div>
              <div>
                <label style={labelStyle}>Cycle Amount (USD) *</label>
                <input style={{ ...inputStyle, fontFamily: 'Space Mono,monospace', fontSize: 15 }} type="number" step="0.01" min="1"
                  value={startForm.amount} onChange={e => setStartForm(f => ({ ...f, amount: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'} required />
              </div>
              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <input style={inputStyle} type="text" placeholder="e.g. Q2 2025 cycle" value={startForm.notes}
                  onChange={e => setStartForm(f => ({ ...f, notes: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'} />
              </div>
              <div style={{ padding: '10px 12px', background: '#080808', border: '1px solid #141414', borderRadius: 7, fontSize: 11, color: '#3a3734' }}>
                Cycle will run for 30 days starting today
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setShowStart(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {submitting ? 'Starting...' : 'Start Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Cycle Modal */}
      {showClose && selectedCycle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Close Cycle & Record Result</div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 20 }}>Enter the final result for this cycle</div>
            <div style={{ background: '#080808', border: '1px solid #141414', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: '#524f4b' }}>Member</span>
                <span style={{ fontWeight: 600 }}>{selectedCycle.user_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#524f4b' }}>Allocated</span>
                <span style={{ fontFamily: 'Space Mono,monospace', fontWeight: 700, color: '#00e87a' }}>{fmt(selectedCycle.amount)}</span>
              </div>
            </div>
            <form onSubmit={handleCloseCycle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Result Amount (USD) *</label>
                <input style={{ ...inputStyle, fontFamily: 'Space Mono,monospace', fontSize: 15 }} type="number" step="0.01" min="0.01"
                  placeholder="Final value after cycle" value={closeForm.result_amount}
                  onChange={e => setCloseForm(f => ({ ...f, result_amount: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'}
                  autoFocus required />
              </div>
              {plPreview !== null && (
                <div style={{ background: '#080808', border: `1px solid ${plPreview >= 0 ? 'rgba(62,207,142,0.15)' : 'rgba(248,113,113,0.15)'}`, borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#524f4b' }}>Performance</span>
                  <span style={{ fontFamily: 'Space Mono,monospace', fontWeight: 700, color: plPreview >= 0 ? '#3ecf8e' : '#f87171' }}>
                    {plPreview >= 0 ? '+' : ''}{fmt(plPreview)}
                  </span>
                </div>
              )}
              <div>
                <label style={labelStyle}>Admin Notes (optional)</label>
                <input style={inputStyle} type="text" placeholder="Note for member dashboard..." value={closeForm.notes}
                  onChange={e => setCloseForm(f => ({ ...f, notes: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => { setShowClose(false); setSelectedCycle(null); }} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {submitting ? 'Closing...' : 'Close & Record Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export default withAuth(AdminCycles, { adminOnly: true });
