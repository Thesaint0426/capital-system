import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmtDate } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionModal, setActionModal] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState(null); // shows created password

  const load = () => {
    api.get('/api/admin/applications')
      .then(r => setApplications(r.data))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/api/admin/application/${actionModal.id}/approve`, {
        temp_password: tempPassword || undefined,
      });
      toast.success('Application approved');
      setActionModal(null);
      if (res.data.temp_password) {
        setResultModal({ name: actionModal.name, email: actionModal.email, password: res.data.temp_password });
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/admin/application/${actionModal.id}/reject`);
      toast.success('Application rejected');
      setActionModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    } finally {
      setSubmitting(false);
    }
  };

  const pending = applications.filter(a => a.status === 'pending');
  const filtered = applications.filter(a => filter === 'all' ? true : a.status === filter);

  const statusStyle = (s) => ({
    pending: { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.15)' },
    approved: { bg: 'rgba(62,207,142,0.08)', color: '#3ecf8e', border: 'rgba(62,207,142,0.15)' },
    rejected: { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.15)' },
  })[s] || {};

  const inputStyle = { background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif', fontSize: 13, width: '100%', outline: 'none', transition: 'border-color 0.15s' };

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
              <div style={{ fontSize: 13, color: '#524f4b' }}>{pending.length} pending · {applications.length} total</div>
            </div>
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

          {/* Pending Cards */}
          {filter === 'pending' && pending.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                Awaiting Review ({pending.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(app => (
                  <div key={app.id} style={{ background: '#0c0c0c', border: '1px solid rgba(0,232,122,0.15)', borderRadius: 12, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(0,232,122,0.08)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.12)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pending</span>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{app.name}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                          {[
                            { label: 'Email', value: app.email },
                            { label: 'Country', value: app.country || '—' },
                            { label: 'Contact', value: app.contact || '—' },
                            { label: 'Source of Funds', value: app.source_of_funds || '—' },
                          ].map((f, i) => (
                            <div key={i}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{f.label}</div>
                              <div style={{ fontSize: 12, color: '#8b8680' }}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <div style={{ fontSize: 11, color: '#3a3734' }}>
                            Submitted {fmtDate(app.submitted_at)}
                          </div>
                          <div style={{ fontSize: 11, color: app.understands_risk ? '#3ecf8e' : '#f87171' }}>
                            {app.understands_risk ? '✓ Acknowledged risk' : '✗ Risk not acknowledged'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => { setActionModal({ id: app.id, action: 'reject', name: app.name, email: app.email }); setRejectNote(''); }}
                          style={{ padding: '9px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 7, color: '#f87171', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Reject
                        </button>
                        <button
                          onClick={() => { setActionModal({ id: app.id, action: 'approve', name: app.name, email: app.email }); setTempPassword(''); }}
                          style={{ padding: '9px 16px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          {(filter !== 'pending' || pending.length === 0) && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Applications ({filtered.length})
              </div>
              {filtered.length === 0 ? (
                <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 40, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>
                  No {filter} applications
                </div>
              ) : (
                <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                        {['Applicant', 'Country', 'Contact', 'Source of Funds', 'Risk', 'Status', 'Submitted', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(app => {
                        const ss = statusStyle(app.status);
                        return (
                          <tr key={app.id} style={{ borderBottom: '1px solid #141414', transition: 'background 0.12s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#0a0a0a'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '13px 14px' }}>
                              <div style={{ fontWeight: 600 }}>{app.name}</div>
                              <div style={{ fontSize: 11, color: '#3a3734' }}>{app.email}</div>
                            </td>
                            <td style={{ padding: '13px 14px', fontSize: 12, color: '#8b8680' }}>{app.country || '—'}</td>
                            <td style={{ padding: '13px 14px', fontSize: 12, color: '#8b8680' }}>{app.contact || '—'}</td>
                            <td style={{ padding: '13px 14px', fontSize: 12, color: '#8b8680', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.source_of_funds || '—'}</td>
                            <td style={{ padding: '13px 14px', fontSize: 11, color: app.understands_risk ? '#3ecf8e' : '#f87171' }}>{app.understands_risk ? '✓' : '✗'}</td>
                            <td style={{ padding: '13px 14px' }}>
                              <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{app.status}</span>
                            </td>
                            <td style={{ padding: '13px 14px', fontSize: 11, color: '#524f4b' }}>{fmtDate(app.submitted_at)}</td>
                            <td style={{ padding: '13px 14px' }}>
                              {app.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => { setActionModal({ id: app.id, action: 'reject', name: app.name, email: app.email }); }}
                                    style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 5, color: '#f87171', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Reject</button>
                                  <button onClick={() => { setActionModal({ id: app.id, action: 'approve', name: app.name, email: app.email }); setTempPassword(''); }}
                                    style={{ padding: '4px 10px', background: '#00e87a', border: 'none', borderRadius: 5, color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Approve</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460 }}>
            {actionModal.action === 'approve' ? (
              <>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Approve Application</div>
                <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 20 }}>
                  Approving <strong style={{ color: '#f5f3ef' }}>{actionModal.name}</strong> ({actionModal.email}). A member account will be created.
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Temporary Password (optional)
                  </label>
                  <input style={inputStyle} type="text" placeholder="Leave blank to auto-generate"
                    value={tempPassword} onChange={e => setTempPassword(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'}
                    autoFocus />
                  <div style={{ fontSize: 11, color: '#3a3734', marginTop: 5 }}>
                    If blank, a secure password will be generated — you'll see it after approval.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setActionModal(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleApprove} disabled={submitting} style={{ padding: '10px 20px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {submitting ? 'Approving...' : 'Confirm Approval'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Reject Application</div>
                <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 20 }}>
                  Reject application from <strong style={{ color: '#f5f3ef' }}>{actionModal.name}</strong>. This cannot be undone.
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setActionModal(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleReject} disabled={submitting} style={{ padding: '10px 20px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 7, color: '#f87171', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Result Modal — shows generated password */}
      {resultModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6, color: '#00e87a' }}>✓ Account Created</div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 20 }}>
              Member account for <strong style={{ color: '#f5f3ef' }}>{resultModal.name}</strong> has been created. Share these credentials securely.
            </div>
            <div style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, color: '#f5f3ef' }}>{resultModal.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Temporary Password</div>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 15, fontWeight: 700, color: '#00e87a' }}>{resultModal.password}</div>
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 7, fontSize: 11, color: '#f87171', marginBottom: 20 }}>
              ⚠ This password will not be shown again. Copy and share it with the member securely. Advise them to change it after first login.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { navigator.clipboard.writeText(resultModal.password); toast.success('Password copied'); }}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Copy Password
              </button>
              <button onClick={() => setResultModal(null)} style={{ padding: '10px 20px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export default withAuth(AdminApplications, { adminOnly: true });
