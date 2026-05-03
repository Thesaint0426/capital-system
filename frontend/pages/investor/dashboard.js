import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth, useAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate, daysLeft, cyclePct, sign } from '../../lib/format';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function Dashboard() {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [cycles, setCycles] = useState({ activeCycle: null, lastCycle: null, completedCycles: [], allCycles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/investor/account'),
      api.get('/api/investor/cycles'),
    ]).then(([a, c]) => {
      setAccount(a.data);
      setCycles(c.data);
    }).catch(err => {
      setError(err.response?.data?.error || 'Failed to load account data');
    }).finally(() => setLoading(false));
  }, []);

  const chartData = (() => {
    const done = [...(cycles.completedCycles || [])].reverse();
    if (!done.length) return null;
    return {
      labels: done.map((_, i) => `Cycle ${i + 1}`),
      datasets: [{
        data: done.map(c => parseFloat(c.profit_loss || 0)),
        borderColor: '#00e87a',
        backgroundColor: 'rgba(0,232,122,0.06)',
        borderWidth: 1.5,
        pointBackgroundColor: done.map(c => parseFloat(c.profit_loss) >= 0 ? '#3ecf8e' : '#f87171'),
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      }],
    };
  })();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c0c0c',
        borderColor: '#252525',
        borderWidth: 1,
        titleColor: '#524f4b',
        bodyColor: '#f5f3ef',
        padding: 10,
        callbacks: { label: ctx => ` ${ctx.raw >= 0 ? '+' : ''}${fmt(ctx.raw)}` },
      },
    },
    scales: {
      x: { grid: { color: '#141414' }, ticks: { color: '#3a3734', font: { size: 10, family: 'Space Mono' } } },
      y: { grid: { color: '#141414' }, ticks: { color: '#3a3734', font: { size: 10 }, callback: v => fmt(v) } },
    },
  };

  const totalProfit = parseFloat(account?.total_profit || 0);
  const balance = parseFloat(account?.current_balance || 0);
  const initial = parseFloat(account?.initial_deposit || 0);
  const returnPct = initial > 0 ? ((totalProfit / initial) * 100).toFixed(2) : '0.00';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: '#3a3734', textTransform: 'uppercase' }}>Capital<span style={{ color: '#00e87a' }}>Invest</span></div>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head><title>Dashboard — Capital Invest</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'Manrope, sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, padding: '40px', minHeight: '100vh' }}>

          {/* Header */}
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>
                Member Dashboard
              </h1>
              <div style={{ fontSize: 13, color: '#524f4b' }}>Welcome back, {user?.name}</div>
            </div>
            {cycles.activeCycle && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(62,207,142,0.06)', border: '1px solid rgba(62,207,142,0.12)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#3ecf8e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <div style={{ width: 5, height: 5, background: '#3ecf8e', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                Active Cycle
              </div>
            )}
          </div>

          {error && <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, fontSize: 13, color: '#f87171', marginBottom: 24 }}>{error}</div>}

          {!account && !error && (
            <div style={{ padding: '16px 20px', background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.15)', borderRadius: 8, fontSize: 13, color: '#00e87a', marginBottom: 24 }}>
              Your account is pending activation. Our team will notify you once your allocation has been configured.
            </div>
          )}

          {account && (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                  { label: 'Current Balance', value: fmt(balance), sub: 'Available allocation', color: '#f5f3ef' },
                  { label: 'Initial Allocation', value: fmt(initial), sub: 'Fixed entry amount', color: '#8b8680' },
                  { label: 'Total Performance', value: `${sign(totalProfit)}${fmt(totalProfit)}`, sub: `${returnPct}% return`, color: totalProfit >= 0 ? '#3ecf8e' : '#f87171' },
                  { label: 'Completed Cycles', value: cycles.completedCycles?.length || 0, sub: 'Historical rounds', color: '#00e87a' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px', transition: 'border-color 0.15s' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{s.label}</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#3a3734', marginTop: 6 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Active Cycle + Last Result */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                {/* Active Cycle */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Active Cycle</div>
                  {cycles.activeCycle ? (
                    <div style={{ background: '#0c0c0c', border: '1px solid rgba(0,232,122,0.15)', borderRadius: 12, padding: 22 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.12)', borderRadius: 20, fontSize: 9, fontWeight: 700, color: '#00e87a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                            ● Active
                          </div>
                          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 26, fontWeight: 700, color: '#00e87a' }}>{fmt(cycles.activeCycle.amount)}</div>
                          <div style={{ fontSize: 11, color: '#3a3734', marginTop: 4 }}>Under management</div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 12, color: '#524f4b' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#f5f3ef', fontFamily: 'Space Mono,monospace' }}>{daysLeft(cycles.activeCycle.end_date)}</div>
                          <div style={{ fontSize: 10, color: '#3a3734', marginTop: 1, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Days Left</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#3a3734' }}>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cycle Progress</span>
                        <span>{Math.round(cyclePct(cycles.activeCycle.start_date, cycles.activeCycle.end_date))}%</span>
                      </div>
                      <div style={{ height: 3, background: '#1e1e1e', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cyclePct(cycles.activeCycle.start_date, cycles.activeCycle.end_date)}%`, background: 'linear-gradient(90deg,#00e87a,#3ecf8e)', borderRadius: 2, transition: 'width 0.6s ease' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#3a3734', marginTop: 8 }}>
                        <span>{fmtDate(cycles.activeCycle.start_date)}</span>
                        <span>{fmtDate(cycles.activeCycle.end_date)}</span>
                      </div>
                      {cycles.activeCycle.notes && (
                        <div style={{ marginTop: 14, padding: '10px 12px', background: '#080808', borderRadius: 7, fontSize: 12, color: '#524f4b', fontStyle: 'italic' }}>
                          {cycles.activeCycle.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 32, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>
                      No active cycle. Your next cycle will be initiated by our team.
                    </div>
                  )}
                </div>

                {/* Last Result */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Last Cycle Result</div>
                  {cycles.lastCycle ? (
                    <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 22 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.12)', borderRadius: 20, fontSize: 9, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                        Completed
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        {[
                          { label: 'Allocated', value: fmt(cycles.lastCycle.amount), color: '#8b8680' },
                          { label: 'Result', value: fmt(cycles.lastCycle.result_amount), color: '#f5f3ef' },
                          { label: 'Performance', value: `${sign(cycles.lastCycle.profit_loss)}${fmt(cycles.lastCycle.profit_loss)}`, color: parseFloat(cycles.lastCycle.profit_loss) >= 0 ? '#3ecf8e' : '#f87171' },
                        ].map((m, i) => (
                          <div key={i}>
                            <div style={{ fontSize: 10, color: '#3a3734', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{m.label}</div>
                            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 15, fontWeight: 700, color: m.color }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, fontSize: 11, color: '#3a3734' }}>Closed {fmtDate(cycles.lastCycle.closed_at)}</div>
                      {cycles.lastCycle.notes && (
                        <div style={{ marginTop: 10, padding: '10px 12px', background: '#080808', borderRadius: 7, fontSize: 12, color: '#524f4b', fontStyle: 'italic' }}>{cycles.lastCycle.notes}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 32, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>
                      No completed cycles yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Chart */}
              {chartData && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Performance History</div>
                  <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 22 }}>
                    <Line data={chartData} options={chartOptions} height={70} />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </>
  );
}

export default withAuth(Dashboard);
