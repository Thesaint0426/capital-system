import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // id of item being processed
  const [noteModal, setNoteModal] = useState(null); // { id, action }
  const [note, setNote] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/api/admin/withdrawals');
      setWithdrawals(res.data);
    } catch (err) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (id, action) => {
    setNoteModal({ id, action });
    setNote('');
  };

  const handleAction = async () => {
    if (!noteModal) return;
    setProcessing(noteModal.id);
    try {
      const endpoint = `/api/admin/withdrawal/${noteModal.id}/${noteModal.action}`;
      await api.post(endpoint, { admin_note: note || undefined });
      toast.success(`Withdrawal ${noteModal.action === 'approve' ? 'approved' : 'rejected'}`);
      setNoteModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const pending = withdrawals.filter(w => w.status === 'pending');
  const processed = withdrawals.filter(w => w.status !== 'pending');

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
        <div className="page-header">
          <h1 className="page-title">Withdrawals</h1>
          <p className="page-subtitle">
            {pending.length} pending · {processed.length} processed
          </p>
        </div>

        {/* Pending */}
        <div className="section">
          <div className="section-title">Pending Approval ({pending.length})</div>

          {pending.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              No pending withdrawal requests
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pending.map(w => (
                <div key={w.id} className="card" style={{ borderColor: 'rgba(255,213,79,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span className="badge badge-pending">Pending</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{w.user_name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.user_email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Requested</div>
                          <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(w.amount)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Fee (0.5%)</div>
                          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>−{formatCurrency(w.fee)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Net Payout</div>
                          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(w.net_amount)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                        Requested {formatDate(w.requested_at)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openModal(w.id, 'reject')}
                        disabled={processing === w.id}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openModal(w.id, 'approve')}
                        disabled={processing === w.id}
                      >
                        {processing === w.id
                          ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="section">
          <div className="section-title">History</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Net Payout</th>
                  <th>Requested</th>
                  <th>Processed</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {processed.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{w.user_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.user_email}</div>
                    </td>
                    <td><span className={`badge badge-${w.status}`}>{w.status}</span></td>
                    <td className="mono">{formatCurrency(w.amount)}</td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>{formatCurrency(w.fee)}</td>
                    <td className="mono">{formatCurrency(w.net_amount)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(w.requested_at)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(w.processed_at)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160 }}>{w.admin_note || '—'}</td>
                  </tr>
                ))}
                {processed.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No history</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note Modal */}
        {noteModal && (
          <div className="modal-overlay" onClick={() => setNoteModal(null)}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">
                {noteModal.action === 'approve' ? '✓ Approve Withdrawal' : '✕ Reject Withdrawal'}
              </div>

              <div className="input-group" style={{ marginBottom: 24 }}>
                <label>Admin Note (optional)</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Leave a note for the investor..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  autoFocus
                />
              </div>

              {noteModal.action === 'approve' && (
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  This will deduct the requested amount from the investor's balance.
                </div>
              )}

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setNoteModal(null)}>Cancel</button>
                <button
                  className={`btn ${noteModal.action === 'approve' ? 'btn-primary' : 'btn-danger'}`}
                  onClick={handleAction}
                >
                  Confirm {noteModal.action === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(AdminWithdrawalsPage, { adminOnly: true });
