import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmtDate } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    api.get('/api/admin/applications')
      .then(r => setApps(r.data))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      await api.post(`/api/admin/application/${id}/${action}`);
      toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'}`);
      load();
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = apps.filter(a => filter === 'all' ? true : a.status === filter);

  const statusStyle = (s) => ({
    pending: { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.15)' },
    approved: { bg: 'rgba(62,207,142,0.08)', color: '#3ecf8e', border: 'rgba(62,207,142,0.15)' },
    rejected: { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.15)' },
  })[s] || { bg: 'rgba(82,79,75,0.1)', color: '#524f4b', border: 'rgba(82,79,75,0.1)' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head><title>Applications — Capital Invest Admin</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 'var(--sidebar-offset, 220px)', flex: 1, padding: '40px' }}>
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Membership Applications</h1>
              <div style={{ fontSize: 13, color: '#524f4b' }}>{apps.filter(a => a.status === 'pending').length} pending review</div>
            </div>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['pending', 'approved', 'rejected', 'all'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '7px 14px', border: '1px solid', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.15s',
                  background: filter === f ? '#00e87a' : 'transparent',
                  color: filter === f ? '#000' : '#524f4b',
                  borderColor: filter === f ? '#00e87a' : '#1e1e1e',
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
            {/* List */}
            <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                    {['Applicant', 'Country', 'Contact', 'Status', 'Applied', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const ss = statusStyle(a.status);
                    return (
                      <tr key={a.id}
                        onClick={() => setSelected(selected?.id === a.id ? null : a)}
                        style={{ borderBottom: '1px solid #141414', cursor: 'pointer', transition: 'background 0.12s', background: selected?.id === a.id ? '#0d0d0d' : 'transparent' }}
                        onMouseOver={e => { if (selected?.id !== a.id) e.currentTarget.style.background = '#0a0a0a'; }}
                        onMouseOut={e => { if (selected?.id !== a.id) e.currentTarget.style.background = 'transparent'; }}>
                        <td style={{ padding: '13px 14px' }}>
                          <div style={{ fontWeight: 600 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: '#3a3734', marginTop: 1 }}>{a.email}</div>
                        </td>
                        <td style={{ padding: '13px 14px', fontSize: 12, color: '#8b8680' }}>{a.country || '—'}</td>
                        <td style={{ padding: '13px 14px', fontSize: 11, color: '#524f4b', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.contact || '—'}</td>
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{a.status}</span>
                        </td>
                        <td style={{ padding: '13px 14px', fontSize: 11, color: '#524f4b' }}>{fmtDate(a.submitted_at)}</td>
                        <td style={{ padding: '13px 14px' }}>
                          {a.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleAction(a.id, 'approve')} disabled={processing === a.id} style={{ padding: '5px 12px', background: '#00e87a', border: 'none', borderRadius: 5, color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                                {processing === a.id ? '...' : 'Approve'}
                              </button>
                              <button onClick={() => handleAction(a.id, 'reject')} disabled={processing === a.id} style={{ padding: '5px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 5, color: '#f87171', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!filtered.length && (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>No {filter} applications</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Detail Panel */}
            {selected && (
              <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24, height: 'fit-content', position: 'sticky', top: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Application Detail</div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#524f4b', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
                </div>
                {[
                  { label: 'Full Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Country', value: selected.country || '—' },
                  { label: 'WhatsApp / Telegram', value: selected.contact || '—' },
                  { label: 'Source of Funds', value: selected.source_of_funds || '—' },
                  { label: 'Applied', value: fmtDate(selected.submitted_at) },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #141414' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: '#f5f3ef', wordBreak: 'break-all' }}>{r.value}</div>
                  </div>
                ))}
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #141414' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Risk Acknowledged</div>
                  <div style={{ fontSize: 13, color: selected.understands_risk ? '#3ecf8e' : '#f87171' }}>{selected.understands_risk ? '✓ Yes' : '✗ No'}</div>
                </div>
                {selected.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleAction(selected.id, 'approve')} style={{ flex: 1, padding: '10px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                      Approve & Register
                    </button>
                    <button onClick={() => handleAction(selected.id, 'reject')} style={{ flex: 1, padding: '10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 7, color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default withAuth(AdminApplications, { adminOnly: true });
