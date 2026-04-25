import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { formatCurrency, formatDate, daysRemaining, cycleProgress } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminCyclesPage() {
  const [cycles, setCycles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Start cycle modal
  const [showStart, setShowStart] = useState(false);
  const [startForm, setStartForm] = useState({ user_id: '', amount: '', notes: '' });
  const [startSubmitting, setStartSubmitting] = useState(false);

  // Close cycle modal
  const [showClose, setShowClose] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [resultAmount, setResultAmount] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  const load = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        api.get('/api/admin/cycles'),
        api.get('/api/admin/users'),
      ]);
      setCycles(cRes.data);
      setUsers(uRes.data.filter(u => u.current_balance !== null));
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStartCycle = async (e) => {
    e.preventDefault();
    if (!startForm.user_id || !startForm.amount) { toast.error('Fill all required fields'); return; }
    setStartSubmitting(true);
    try {
      await api.post('/api/admin/cycle', {
        user_id: parseInt(startForm.user_id),
        amount: parseFloat(startForm.amount),
        notes: startForm.notes || undefined,
      });
      toast.success('Cycle started successfully');
      setShowStart(false);
      setStartForm({ user_id: '', amount: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start cycle');
    } finally {
      setStartSubmitting(false);
    }
  };

  const openCloseCycle = (cycle) => {
    setSelectedCycle(cycle);
    setResultAmount('');
    setCloseNotes('');
    setShowClose(true);
  };

  const handleCloseCycle = async (e) => {
    e.preventDefault();
    if (!resultAmount || parseFloat(resultAmount) <= 0) { toast.error('Enter a valid result amount'); return; }
    setCloseSubmitting(true);
    try {
      await api.post('/api/admin/close-cycle', {
        cycle_id: selectedCycle.id,
        result_amount: parseFloat(resultAmount),
        notes: closeNotes || undefined,
      });
      toast.success('Cycle closed and result recorded');
      setShowClose(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close cycle');
    } finally {
      setCloseSubmitting(false);
    }
  };

  const activeCycles = cycles.filter(c => c.status === 'active');
  const completedCycles = cycles.filter(c => c.status === 'completed');

  const selectedUserBalance = users.find(u => u.id === parseInt(startForm.user_id))?.current_balance;

  if (loading) return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </main>
    </div>
  );

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Investment Cycles</h1>
            <p className="page-subtitle">{activeCycles.length} active · {completedCycles.length} completed</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowStart(true)}>
            + Start New Cycle
          </button>
        </div>

        {/* Active Cycles */}
        {activeCycles.length > 0 && (
          <div className="section">
            <div className="section-title">Active Cycles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeCycles.map(c => (
                <div key={c.id} className="card" style={{ borderColor: 'rgba(0,255,136,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span className="badge badge-active">● Active</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.user_name} · {c.user_email}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700 }}>
                        {formatCurrency(c.amount)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
                        <div>{daysRemaining(c.end_date)} days left</div>
                        <div style={{ fontSize: 12 }}>{formatDate(c.start_date)} → {formatDate(c.end_date)}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => openCloseCycle(c)}>
                        Close Cycle
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${cycleProgress(c.start_date, c.end_date)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Cycles Table */}
        <div className="section">
          <div className="section-title">All Cycles</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Result</th>
                  <th>P/L</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map(c => {
                  const pl = parseFloat(c.profit_loss);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.user_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.user_email}</div>
                      </td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td className="mono">{formatCurrency(c.amount)}</td>
                      <td className="mono">{c.result_amount ? formatCurrency(c.result_amount) : '—'}</td>
                      <td className={`mono ${c.profit_loss !== null ? (pl >= 0 ? 'positive' : 'negative') : ''}`}>
                        {c.profit_loss !== null ? `${pl >= 0 ? '+' : ''}${formatCurrency(pl)}` : '—'}
                      </td>
                      <td style={{ fontSize: 13 }}>{formatDate(c.start_date)}</td>
                      <td style={{ fontSize: 13 }}>{formatDate(c.end_date)}</td>
                      <td>
                        {c.status === 'active' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openCloseCycle(c)}>Close</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {cycles.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No cycles yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Start Cycle Modal */}
        {showStart && (
          <div className="modal-overlay" onClick={() => setShowStart(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Start Investment Cycle</div>
              <form onSubmit={handleStartCycle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Investor *</label>
                  <select
                    className="input"
                    value={startForm.user_id}
                    onChange={e => setStartForm({ ...startForm, user_id: e.target.value })}
                    required
                  >
                    <option value="">Select investor...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — Balance: {formatCurrency(u.current_balance)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUserBalance && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8 }}>
                    Available: {formatCurrency(selectedUserBalance)}
                  </div>
                )}

                <div className="input-group">
                  <label>Cycle Amount (USD) *</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Amount to invest"
                    value={startForm.amount}
                    onChange={e => setStartForm({ ...startForm, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Notes (optional)</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. Q1 2025 cycle"
                    value={startForm.notes}
                    onChange={e => setStartForm({ ...startForm, notes: e.target.value })}
                  />
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  Cycle will run for 30 days from today
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStart(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={startSubmitting}>
                    {startSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Start Cycle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Close Cycle Modal */}
        {showClose && selectedCycle && (
          <div className="modal-overlay" onClick={() => setShowClose(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Close Investment Cycle</div>

              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '14px 16px', marginBottom: 20, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Investor</span>
                  <span style={{ fontWeight: 600 }}>{selectedCycle.user_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount Invested</span>
                  <span className="mono" style={{ fontWeight: 700 }}>{formatCurrency(selectedCycle.amount)}</span>
                </div>
              </div>

              <form onSubmit={handleCloseCycle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Result Amount (USD) *</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Final value after cycle"
                    value={resultAmount}
                    onChange={e => setResultAmount(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {resultAmount && parseFloat(resultAmount) > 0 && (
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 16px', fontSize: 14, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Profit / Loss</span>
                      <span className={`mono ${parseFloat(resultAmount) - parseFloat(selectedCycle.amount) >= 0 ? 'positive' : 'negative'}`} style={{ fontWeight: 700 }}>
                        {parseFloat(resultAmount) - parseFloat(selectedCycle.amount) >= 0 ? '+' : ''}
                        {formatCurrency(parseFloat(resultAmount) - parseFloat(selectedCycle.amount))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label>Admin Notes (optional)</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Notes for investor..."
                    value={closeNotes}
                    onChange={e => setCloseNotes(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowClose(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={closeSubmitting}>
                    {closeSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Close & Record Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(AdminCyclesPage, { adminOnly: true });
