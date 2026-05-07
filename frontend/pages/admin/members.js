import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate } from '../../lib/format';
import toast from 'react-hot-toast';

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deposit, setDeposit] = useState('10000');
  const [submitting, setSubmitting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [search, setSearch] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', admin_note: '' });

  const load = () => {
    api.get('/api/admin/users')
      .then(r => setMembers(r.data))
      .catch(() => toast.error('Failed to load members'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleActivateAccount = async (e) => {
    e.preventDefault();
    if (!deposit || parseFloat(deposit) <= 0) { toast.error('Enter a valid deposit amount'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/admin/account', { user_id: selectedUser.id, initial_deposit: parseFloat(deposit) });
      toast.success(`Account activated for ${selectedUser.name}`);
      setShowActivateModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to activate account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/admin/users', createForm);
      toast.success(`Member ${createForm.name} created`);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', admin_note: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/api/admin/users/${selectedUser.id}`, { admin_note: noteText });
      toast.success('Note saved');
      setShowNoteModal(false);
      load();
    } catch (err) {
      toast.error('Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member) => {
    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/api/admin/users/${member.id}`, { status: newStatus });
      toast.success(`Member ${newStatus}`);
      load();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = members.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = { background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif', fontSize: 13, width: '100%', outline: 'none', transition: 'border-color 0.15s' };
  const labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head><title>Members — Capital Invest Admin</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 'var(--sidebar-offset, 220px)', flex: 1, padding: '40px' }}>
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Member Accounts</h1>
              <div style={{ fontSize: 13, color: '#524f4b' }}>{members.length} registered member{members.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                placeholder="Search members..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, width: 220, padding: '8px 14px' }}
                onFocus={e => e.target.style.borderColor = '#00e87a'}
                onBlur={e => e.target.style.borderColor = '#252525'}
              />
              <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 20px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Add Member
              </button>
            </div>
          </div>

          <div style={{ border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
                  {['Member', 'Initial Allocation', 'Balance', 'Performance', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #141414', transition: 'background 0.12s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#0a0a0a'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#3a3734', marginTop: 1 }}>{m.email}</div>
                      {m.admin_note && (
                        <div style={{ fontSize: 10, color: '#524f4b', marginTop: 3, fontStyle: 'italic', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📝 {m.admin_note}</div>
                      )}
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>
                      {m.initial_deposit !== null ? fmt(m.initial_deposit) : <span style={{ color: '#3a3734' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13 }}>
                      {m.current_balance !== null ? fmt(m.current_balance) : <span style={{ color: '#3a3734' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 14px', fontFamily: 'Space Mono,monospace', fontSize: 13, color: parseFloat(m.total_profit || 0) >= 0 ? '#3ecf8e' : '#f87171' }}>
                      {m.total_profit !== null ? `${parseFloat(m.total_profit) >= 0 ? '+' : ''}${fmt(m.total_profit)}` : '—'}
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: 12, color: '#524f4b' }}>{fmtDate(m.created_at)}</td>
                    <td style={{ padding: '13px 14px' }}>
                      {m.status === 'suspended'
                        ? <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.15)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Suspended</span>
                        : m.current_balance !== null
                          ? <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(62,207,142,0.08)', color: '#3ecf8e', border: '1px solid rgba(62,207,142,0.12)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Active</span>
                          : <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: 'rgba(0,232,122,0.06)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.1)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pending Setup</span>
                      }
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {m.current_balance === null && (
                          <button onClick={() => { setSelectedUser(m); setDeposit('10000'); setShowActivateModal(true); }}
                            style={{ padding: '5px 10px', background: '#00e87a', border: 'none', borderRadius: 5, color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', whiteSpace: 'nowrap' }}>
                            Activate
                          </button>
                        )}
                        <button onClick={() => { setSelectedUser(m); setNoteText(m.admin_note || ''); setShowNoteModal(true); }}
                          style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #252525', borderRadius: 5, color: '#524f4b', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                          Note
                        </button>
                        <button onClick={() => handleToggleStatus(m)}
                          style={{ padding: '5px 10px', background: 'transparent', border: `1px solid ${m.status === 'suspended' ? 'rgba(62,207,142,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 5, color: m.status === 'suspended' ? '#3ecf8e' : '#f87171', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                          {m.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>{search ? 'No members match your search' : 'No members registered yet'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Activate Account Modal */}
      {showActivateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Activate Account</div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 24 }}>Setting up account for <strong style={{ color: '#f5f3ef' }}>{selectedUser?.name}</strong></div>
            <form onSubmit={handleActivateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Initial Allocation (USD)</label>
                <input style={{ ...inputStyle, fontFamily: 'Space Mono,monospace', fontSize: 15 }} type="number" step="0.01" min="1" value={deposit}
                  onChange={e => setDeposit(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'}
                  autoFocus required />
                <div style={{ fontSize: 11, color: '#3a3734', marginTop: 6 }}>Standard allocation is $10,000.</div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowActivateModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#3a3734' : '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Activating...' : 'Activate Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Member Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Add New Member</div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 24 }}>Create a member account directly without an application</div>
            <form onSubmit={handleCreateMember} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'}
                  autoFocus required />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'}
                  required />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input style={inputStyle} type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'}
                  required minLength={6} />
                <div style={{ fontSize: 11, color: '#3a3734', marginTop: 4 }}>Share this password securely with the member.</div>
              </div>
              <div>
                <label style={labelStyle}>Admin Note (internal)</label>
                <input style={inputStyle} type="text" placeholder="e.g. Referred by John" value={createForm.admin_note}
                  onChange={e => setCreateForm(f => ({ ...f, admin_note: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#00e87a'} onBlur={e => e.target.style.borderColor = '#252525'} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: submitting ? '#3a3734' : '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#0c0c0c', border: '1px solid #252525', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Admin Note</div>
            <div style={{ fontSize: 13, color: '#524f4b', marginBottom: 20 }}>Internal note for <strong style={{ color: '#f5f3ef' }}>{selectedUser?.name}</strong></div>
            <textarea
              style={{ ...inputStyle, height: 100, resize: 'vertical' }}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#00e87a'}
              onBlur={e => e.target.style.borderColor = '#252525'}
              placeholder="e.g. Referred by John, priority member..."
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowNoteModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #252525', borderRadius: 7, color: '#8b8680', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveNote} disabled={submitting} style={{ padding: '10px 20px', background: '#00e87a', border: 'none', borderRadius: 7, color: '#000', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export default withAuth(AdminMembers, { adminOnly: true });
