import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { formatCurrency, formatDate, daysRemaining, cycleProgress, statusColor } from '../../lib/format';

function CyclesPage() {
  const [data, setData] = useState({ activeCycle: null, allCycles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/investor/cycles')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="page-title">Investment Cycles</h1>
          <p className="page-subtitle">Track your investment rounds</p>
        </div>

        {/* Active Cycle */}
        {data.activeCycle && (
          <div className="section">
            <div className="section-title">Current Active Cycle</div>
            <div className="card" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span className="badge badge-active" style={{ marginBottom: 12 }}>● Active</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>
                    {formatCurrency(data.activeCycle.amount)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Under management</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Start Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{formatDate(data.activeCycle.start_date)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>End Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{formatDate(data.activeCycle.end_date)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Days Left</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{daysRemaining(data.activeCycle.end_date)} days</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Duration</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>30 days</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  <span>Cycle Progress</span>
                  <span>{Math.round(cycleProgress(data.activeCycle.start_date, data.activeCycle.end_date))}% complete</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${cycleProgress(data.activeCycle.start_date, data.activeCycle.end_date)}%` }} />
                </div>
              </div>

              {data.activeCycle.notes && (
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                  📝 {data.activeCycle.notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Cycles Table */}
        <div className="section">
          <div className="section-title">All Cycles ({data.allCycles.length})</div>

          {data.allCycles.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No investment cycles yet. Your admin will start your first cycle.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Result</th>
                    <th>Profit / Loss</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allCycles.map((cycle, i) => {
                    const pl = parseFloat(cycle.profit_loss);
                    return (
                      <tr key={cycle.id}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                          #{data.allCycles.length - i}
                        </td>
                        <td>
                          <span className={`badge badge-${cycle.status}`}>{cycle.status}</span>
                        </td>
                        <td className="mono">{formatCurrency(cycle.amount)}</td>
                        <td className="mono">{cycle.result_amount ? formatCurrency(cycle.result_amount) : <span style={{ color: 'var(--text-dim)' }}>Pending</span>}</td>
                        <td className={`mono ${cycle.profit_loss !== null ? (pl >= 0 ? 'positive' : 'negative') : 'neutral'}`}>
                          {cycle.profit_loss !== null ? `${pl >= 0 ? '+' : ''}${formatCurrency(pl)}` : '—'}
                        </td>
                        <td style={{ fontSize: 13 }}>{formatDate(cycle.start_date)}</td>
                        <td style={{ fontSize: 13 }}>{formatDate(cycle.end_date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(CyclesPage);
