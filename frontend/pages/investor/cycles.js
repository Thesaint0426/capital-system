import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate, daysLeft, cyclePct, sign } from '../../lib/format';

function CyclesPage() {
  const [data, setData] = useState({ activeCycle: null, allCycles: [], completedCycles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/investor/cycles')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const S = { // inline styles shorthand
    card: { background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 22 },
    label: { fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 },
    mono: { fontFamily: 'Space Mono,monospace' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head><title>My Cycles — Capital Invest</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'Manrope, sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, padding: '40px' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Investment Cycles</h1>
            <div style={{ fontSize: 13, color: '#524f4b' }}>{data.completedCycles?.length || 0} completed cycles · {data.activeCycle ? '1 active' : 'No active cycle'}</div>
          </div>

          {/* Active Cycle */}
          {data.activeCycle && (
            <div style={{ marginBottom: 28 }}>
              <div style={S.label}>Active Cycle</div>
              <div style={{ ...S.card, border: '1px solid rgba(0,232,122,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.15)', borderRadius: 20, fontSize: 9, fontWeight: 700, color: '#00e87a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                      ● Active
                    </div>
                    <div style={{ ...S.mono, fontSize: 32, fontWeight: 700, color: '#00e87a' }}>{fmt(data.activeCycle.amount)}</div>
                    <div style={{ fontSize: 12, color: '#3a3734', marginTop: 4 }}>Current allocation — 30-day cycle</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 28px' }}>
                    {[
                      { label: 'Start Date', value: fmtDate(data.activeCycle.start_date) },
                      { label: 'End Date', value: fmtDate(data.activeCycle.end_date) },
                      { label: 'Days Remaining', value: `${daysLeft(data.activeCycle.end_date)} days`, color: '#00e87a' },
                      { label: 'Progress', value: `${Math.round(cyclePct(data.activeCycle.start_date, data.activeCycle.end_date))}%`, color: '#3ecf8e' },
                    ].map((m, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 10, color: '#3a3734', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{m.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: m.color || '#f5f3ef' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#3a3734' }}>
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cycle Progress</span>
                  <span>{Math.round(cyclePct(data.activeCycle.start_date, data.activeCycle.end_date))}% complete</span>
                </div>
                <div style={{ height: 4, background: '#1e1e1e', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cyclePct(data.activeCycle.start_date, data.activeCycle.end_date)}%`, background: 'linear-gradient(90deg,#00e87a,#3ecf8e)', borderRadius: 2 }}></div>
                </div>
                {data.activeCycle.notes && (
                  <div style={{ marginTop: 14, padding: '10px 12px', background: '#080808', borderRadius: 7, fontSize: 12, color: '#524f4b', fontStyle: 'italic' }}>📎 {data.activeCycle.notes}</div>
                )}
              </div>
            </div>
          )}

          {/* History Table */}
          <div>
            <div style={{ ...S.label, marginBottom: 14 }}>Cycle History ({data.allCycles.length})</div>
            {data.allCycles.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: 48, color: '#3a3734', fontSize: 13 }}>
                No cycles on record yet. Your first cycle will appear here once initiated.
              </div>
            ) : (
              <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                      {['#', 'Status', 'Allocation', 'Result', 'Performance', 'Start', 'End'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.allCycles.map((c, i) => {
                      const pl = parseFloat(c.profit_loss || 0);
                      const statusColors = {
                        active: { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.15)' },
                        completed: { bg: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: 'rgba(96,165,250,0.15)' },
                      };
                      const sc = statusColors[c.status] || statusColors.completed;
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid #141414', transition: 'background 0.12s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#0a0a0a'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '13px 14px', ...S.mono, fontSize: 11, color: '#3a3734' }}>#{data.allCycles.length - i}</td>
                          <td style={{ padding: '13px 14px' }}>
                            <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '13px 14px', ...S.mono }}>{fmt(c.amount)}</td>
                          <td style={{ padding: '13px 14px', ...S.mono }}>{c.result_amount ? fmt(c.result_amount) : <span style={{ color: '#3a3734' }}>Pending</span>}</td>
                          <td style={{ padding: '13px 14px', ...S.mono, color: c.profit_loss !== null ? (pl >= 0 ? '#3ecf8e' : '#f87171') : '#3a3734' }}>
                            {c.profit_loss !== null ? `${sign(pl)}${fmt(pl)}` : '—'}
                          </td>
                          <td style={{ padding: '13px 14px', fontSize: 12, color: '#524f4b' }}>{fmtDate(c.start_date)}</td>
                          <td style={{ padding: '13px 14px', fontSize: 12, color: '#524f4b' }}>{fmtDate(c.end_date)}</td>
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
    </>
  );
}

export default withAuth(CyclesPage);
