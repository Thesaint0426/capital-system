import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate } from '../../lib/format';

function AdminOverview() {
  const [members, setMembers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/cycles'),
      api.get('/api/admin/withdrawals'),
      api.get('/api/admin/applications').catch(() => ({ data: [] })),
    ]).then(([m, c, w, a]) => {
      setMembers(m.data);
      setCycles(c.data);
      setWithdrawals(w.data);
      setApplications(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalAUM = members.reduce((s, u) => s + parseFloat(u.current_balance || 0), 0);
  const totalProfit = members.reduce((s, u) => s + parseFloat(u.total_profit || 0), 0);
  const activeCycles = cycles.filter(c => c.status === 'active').length;
  const pendingW = withdrawals.filter(w => w.status === 'pending').length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const KPIs = [
    { label: 'Total AUM', value: fmt(totalAUM), sub: 'Assets under management', color: '#00e87a' },
    { label: 'Total Performance', value: `${totalProfit >= 0 ? '+' : ''}${fmt(totalProfit)}`, sub: 'Across all members', color: totalProfit >= 0 ? '#3ecf8e' : '#f87171' },
    { label: 'Active Members', value: members.length, sub: 'Activated accounts', color: '#f5f3ef' },
    { label: 'Active Cycles', value: activeCycles, sub: 'Running now', color: '#00e87a' },
    { label: 'Pending Withdrawals', value: pendingW, sub: 'Awaiting approval', color: pendingW > 0 ? '#f87171' : '#3a3734' },
    { label: 'Pending Applications', value: pendingApps, sub: 'Under review', color: pendingApps > 0 ? '#00e87a' : '#3a3734' },
  ];

  return (
    <>
      <Head><title>Admin Overview — Capital Invest</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, padding: '40px' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Admin Overview</h1>
            <div style={{ fontSize: 13, color: '#524f4b' }}>Platform performance snapshot</div>
          </div>

          {/* Alerts */}
          {pendingW > 0 && (
            <div style={{ padding: '11px 16px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, fontSize: 12, color: '#f87171', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠ {pendingW} withdrawal request{pendingW > 1 ? 's' : ''} pending your review
            </div>
          )}
          {pendingApps > 0 && (
            <div style={{ padding: '11px 16px', background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.15)', borderRadius: 8, fontSize: 12, color: '#00e87a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ◈ {pendingApps} membership application{pendingApps > 1 ? 's' : ''} awaiting review
            </div>
          )}

          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
            {KPIs.map((k, i) => (
              <div key={i} style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{k.label}</div>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: '#3a3734', marginTop: 6 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Members Table */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Member Accounts ({members.length})</div>
            <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                    {['Member', 'Balance', 'Performance', 'Active Cycle', 'Pending W/D'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #141414', transition: 'background 0.12s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#0a0a0a'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#3a3734', marginTop: 1 }}>{m.email}</div>
                      </td>
                      <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>
                        {m.current_balance !== null ? fmt(m.current_balance) : <span style={{ color: '#3a3734' }}>No account</span>}
                      </td>
                      <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13, color: parseFloat(m.total_profit || 0) >= 0 ? '#3ecf8e' : '#f87171' }}>
                        {m.total_profit !== null ? `${parseFloat(m.total_profit) >= 0 ? '+' : ''}${fmt(m.total_profit)}` : '—'}
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        {parseInt(m.active_cycles) > 0
                          ? <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(0,232,122,0.08)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.12)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>● Active</span>
                          : <span style={{ color: '#3a3734', fontSize: 12 }}>None</span>}
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        {parseInt(m.pending_withdrawals) > 0
                          ? <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.12)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.pending_withdrawals} pending</span>
                          : <span style={{ color: '#3a3734', fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                  {!members.length && (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>No members yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Recent Cycles */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Recent Cycles</div>
              <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                      {['Member', 'Amount', 'Status', 'P/L'].map(h => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cycles.slice(0, 6).map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #141414' }}>
                        <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 500 }}>{c.user_name}</td>
                        <td style={{ padding: '11px 12px', fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{fmt(c.amount)}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <span style={{
                            display: 'inline-flex', padding: '1px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                            background: c.status === 'active' ? 'rgba(0,232,122,0.08)' : 'rgba(96,165,250,0.08)',
                            color: c.status === 'active' ? '#00e87a' : '#60a5fa',
                            border: `1px solid ${c.status === 'active' ? 'rgba(0,232,122,0.12)' : 'rgba(96,165,250,0.12)'}`,
                          }}>{c.status}</span>
                        </td>
                        <td style={{ padding: '11px 12px', fontFamily: 'Space Mono,monospace', fontSize: 11, color: c.profit_loss !== null ? (parseFloat(c.profit_loss) >= 0 ? '#3ecf8e' : '#f87171') : '#3a3734' }}>
                          {c.profit_loss !== null ? `${parseFloat(c.profit_loss) >= 0 ? '+' : ''}${fmt(c.profit_loss)}` : '—'}
                        </td>
                      </tr>
                    ))}
                    {!cycles.length && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#3a3734', fontSize: 12 }}>No cycles</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Withdrawals */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Recent Withdrawals</div>
              <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                      {['Member', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.slice(0, 6).map(w => {
                      const sc = {
                        pending: { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.12)' },
                        approved: { bg: 'rgba(62,207,142,0.08)', color: '#3ecf8e', border: 'rgba(62,207,142,0.12)' },
                        rejected: { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.12)' },
                      }[w.status] || { bg: 'rgba(82,79,75,0.1)', color: '#524f4b', border: 'rgba(82,79,75,0.1)' };
                      return (
                        <tr key={w.id} style={{ borderBottom: '1px solid #141414' }}>
                          <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 500 }}>{w.user_name}</td>
                          <td style={{ padding: '11px 12px', fontFamily: 'Space Mono,monospace', fontSize: 11 }}>{fmt(w.amount)}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{ display: 'inline-flex', padding: '1px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{w.status}</span>
                          </td>
                          <td style={{ padding: '11px 12px', fontSize: 11, color: '#3a3734' }}>{fmtDate(w.requested_at)}</td>
                        </tr>
                      );
                    })}
                    {!withdrawals.length && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#3a3734', fontSize: 12 }}>No withdrawals</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default withAuth(AdminOverview, { adminOnly: true });
