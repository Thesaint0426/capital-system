import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { formatCurrency, formatDate, daysRemaining, cycleProgress } from '../../lib/format';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function Dashboard() {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [cycles, setCycles] = useState({ activeCycle: null, lastCycle: null, completedCycles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [accRes, cycRes] = await Promise.all([
          api.get('/api/investor/account'),
          api.get('/api/investor/cycles'),
        ]);
        setAccount(accRes.data);
        setCycles(cycRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load account');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Build chart data from completed cycles
  const chartData = (() => {
    const completed = [...(cycles.completedCycles || [])].reverse();
    if (completed.length === 0) return null;
    const labels = completed.map((c, i) => `Cycle ${i + 1}`);
    const data = completed.map(c => parseFloat(c.result_amount) - parseFloat(c.amount));
    return {
      labels,
      datasets: [{
        data,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0,255,136,0.05)',
        borderWidth: 2,
        pointBackgroundColor: data.map(v => v >= 0 ? '#00ff88' : '#ff4d4d'),
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      }],
    };
  })();

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: '#111',
      borderColor: '#2a2a2a',
      borderWidth: 1,
      titleColor: '#666',
      bodyColor: '#f0f0f0',
      callbacks: {
        label: (ctx) => ` ${ctx.raw >= 0 ? '+' : ''}${formatCurrency(ctx.raw)}`,
      },
    }},
    scales: {
      x: { grid: { color: '#1a1a1a' }, ticks: { color: '#555', font: { size: 11 } } },
      y: { grid: { color: '#1a1a1a' }, ticks: { color: '#555', font: { size: 11 }, callback: v => formatCurrency(v) } },
    },
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
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!account && !error && (
          <div className="alert alert-info">
            Your investment account has not been activated yet. Please contact your administrator.
          </div>
        )}

        {account && (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Current Balance</div>
                <div className="stat-value mono">{formatCurrency(account.current_balance)}</div>
                <div className="stat-sub">Available funds</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Initial Deposit</div>
                <div className="stat-value mono" style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(account.initial_deposit)}
                </div>
                <div className="stat-sub">Starting capital</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total Profit / Loss</div>
                <div className={`stat-value mono ${parseFloat(account.total_profit) >= 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(account.total_profit) >= 0 ? '+' : ''}{formatCurrency(account.total_profit)}
                </div>
                <div className="stat-sub">
                  {account.initial_deposit > 0
                    ? `${((parseFloat(account.total_profit) / parseFloat(account.initial_deposit)) * 100).toFixed(2)}% return`
                    : '—'}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Completed Cycles</div>
                <div className="stat-value mono">{cycles.completedCycles?.length || 0}</div>
                <div className="stat-sub">Investment rounds</div>
              </div>
            </div>

            {/* Active Cycle */}
            <div className="section">
              <div className="section-title">Active Cycle</div>
              {cycles.activeCycle ? (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span className="badge badge-active">Active</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {daysRemaining(cycles.activeCycle.end_date)} days remaining
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700 }}>
                        {formatCurrency(cycles.activeCycle.amount)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        Invested amount
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
                      <div>{formatDate(cycles.activeCycle.start_date)}</div>
                      <div style={{ fontSize: 11, marginTop: 2 }}>→ {formatDate(cycles.activeCycle.end_date)}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Progress</span>
                      <span>{Math.round(cycleProgress(cycles.activeCycle.start_date, cycles.activeCycle.end_date))}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${cycleProgress(cycles.activeCycle.start_date, cycles.activeCycle.end_date)}%` }} />
                    </div>
                  </div>

                  {cycles.activeCycle.notes && (
                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {cycles.activeCycle.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No active investment cycle. Your admin will start the next cycle.
                </div>
              )}
            </div>

            {/* Last Cycle Result */}
            {cycles.lastCycle && (
              <div className="section">
                <div className="section-title">Last Cycle Result</div>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="badge badge-completed" style={{ marginBottom: 10, display: 'inline-flex' }}>Completed</span>
                      <div style={{ display: 'flex', gap: 32, marginTop: 8 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Invested</div>
                          <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(cycles.lastCycle.amount)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Result</div>
                          <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(cycles.lastCycle.result_amount)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>P/L</div>
                          <div className={`mono ${parseFloat(cycles.lastCycle.profit_loss) >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: 18, fontWeight: 700 }}>
                            {parseFloat(cycles.lastCycle.profit_loss) >= 0 ? '+' : ''}{formatCurrency(cycles.lastCycle.profit_loss)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Closed {formatDate(cycles.lastCycle.closed_at)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Chart */}
            {chartData && (
              <div className="section">
                <div className="section-title">Cycle Performance</div>
                <div className="card">
                  <Line data={chartData} options={chartOptions} height={80} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
