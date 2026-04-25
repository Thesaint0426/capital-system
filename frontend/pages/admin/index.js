import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/format';

function AdminOverview() {
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [uRes, cRes, wRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/cycles'),
          api.get('/api/admin/withdrawals'),
        ]);
        setUsers(uRes.data);
        setCycles(cRes.data);
        setWithdrawals(wRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAUM = users.reduce((s, u) => s + parseFloat(u.current_balance || 0), 0);
  const totalProfit = users.reduce((s, u) => s + parseFloat(u.total_profit || 0), 0);
  const activeCycles = cycles.filter(c => c.status === 'active').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

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
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">System-wide performance snapshot</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total AUM</div>
            <div className="stat-value mono positive">{formatCurrency(totalAUM)}</div>
            <div className="stat-sub">Assets under management</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Profit Paid</div>
            <div className={`stat-value mono ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
            </div>
            <div className="stat-sub">Across all investors</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Investors</div>
            <div className="stat-value mono">{users.length}</div>
            <div className="stat-sub">Registered accounts</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Cycles</div>
            <div className="stat-value mono" style={{ color: 'var(--accent)' }}>{activeCycles}</div>
            <div className="stat-sub">Running now</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Withdrawals</div>
            <div className="stat-value mono" style={{ color: pendingWithdrawals > 0 ? 'var(--yellow)' : 'var(--text-muted)' }}>
              {pendingWithdrawals}
            </div>
            <div className="stat-sub">Awaiting approval</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Cycles</div>
            <div className="stat-value mono">{cycles.length}</div>
            <div className="stat-sub">All time</div>
          </div>
        </div>

        {/* Recent Activity */}
        {pendingWithdrawals > 0 && (
          <div className="alert" style={{ background: 'rgba(255,213,79,0.08)', border: '1px solid rgba(255,213,79,0.2)', color: 'var(--yellow)' }}>
            ⚠ {pendingWithdrawals} withdrawal request{pendingWithdrawals > 1 ? 's' : ''} pending your review
          </div>
        )}

        {/* Recent Investors */}
        <div className="section">
          <div className="section-title">Recent Investors</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th>Profit/Loss</th>
                  <th>Active Cycle</th>
                  <th>Pending W/D</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                    <td className="mono">{u.current_balance !== null ? formatCurrency(u.current_balance) : <span style={{ color: 'var(--text-dim)' }}>No account</span>}</td>
                    <td className={`mono ${parseFloat(u.total_profit || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {u.total_profit !== null ? `${parseFloat(u.total_profit) >= 0 ? '+' : ''}${formatCurrency(u.total_profit)}` : '—'}
                    </td>
                    <td>
                      {parseInt(u.active_cycles) > 0
                        ? <span className="badge badge-active">Yes</span>
                        : <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>None</span>}
                    </td>
                    <td>
                      {parseInt(u.pending_withdrawals) > 0
                        ? <span className="badge badge-pending">{u.pending_withdrawals}</span>
                        : <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(AdminOverview, { adminOnly: true });
