import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deposit, setDeposit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreateAccount = (user) => {
    setSelectedUser(user);
    setDeposit('');
    setShowModal(true);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!deposit || parseFloat(deposit) <= 0) { toast.error('Enter a valid deposit'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/admin/account', {
        user_id: selectedUser.id,
        initial_deposit: parseFloat(deposit),
      });
      toast.success(`Account created for ${selectedUser.name}`);
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="page-title">Investors</h1>
          <p className="page-subtitle">{users.length} registered investor{users.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Initial Deposit</th>
                <th>Balance</th>
                <th>P/L</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                  <td className="mono">{u.initial_deposit !== null ? formatCurrency(u.initial_deposit) : '—'}</td>
                  <td className="mono">{u.current_balance !== null ? formatCurrency(u.current_balance) : '—'}</td>
                  <td className={`mono ${parseFloat(u.total_profit || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {u.total_profit !== null ? `${parseFloat(u.total_profit) >= 0 ? '+' : ''}${formatCurrency(u.total_profit)}` : '—'}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(u.created_at)}</td>
                  <td>
                    {u.current_balance === null ? (
                      <button className="btn btn-secondary btn-sm" onClick={() => openCreateAccount(u)}>
                        Create Account
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--accent)' }}>✓ Active</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No investors registered</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create Account Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Create Investment Account</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
                Setting up account for <strong>{selectedUser?.name}</strong>
              </p>

              <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Initial Deposit (USD)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 10000.00"
                    value={deposit}
                    onChange={e => setDeposit(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Create Account'}
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

export default withAuth(AdminUsersPage, { adminOnly: true });
