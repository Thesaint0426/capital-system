import { useState, useEffect } from 'react';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import toast from 'react-hot-toast';

function WithdrawPage() {
  const [account, setAccount] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const FEE_RATE = 0.005;

  useEffect(() => {
    async function load() {
      try {
        const [accRes, cycRes, wRes] = await Promise.all([
          api.get('/api/investor/account'),
          api.get('/api/investor/cycles'),
          api.get('/api/investor/withdrawals'),
        ]);
        setAccount(accRes.data);
        setActiveCycle(cycRes.data.activeCycle);
        setWithdrawals(wRes.data);
      } catch (err) {
        // Account may not exist
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount > 0 ? parseFloat((parsedAmount * FEE_RATE).toFixed(2)) : 0;
  const netAmount = parsedAmount > 0 ? parseFloat((parsedAmount - fee).toFixed(2)) : 0;
  const balance = parseFloat(account?.current_balance || 0);
  const hasPending = withdrawals.some(w => w.status === 'pending');

  const canWithdraw = account && !activeCycle && !hasPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parsedAmount <= 0) { toast.error('Enter a valid amount'); return; }
    if (parsedAmount > balance) { toast.error('Amount exceeds balance'); return; }

    setSubmitting(true);
    try {
      await api.post('/api/investor/withdraw', { amount: parsedAmount });
      toast.success('Withdrawal request submitted');
      setAmount('');
      const wRes = await api.get('/api/investor/withdrawals');
      setWithdrawals(wRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
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
          <h1 className="page-title">Withdraw Funds</h1>
          <p className="page-subtitle">Submit a withdrawal request</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>
          {/* Form */}
          <div>
            <div className="section-title">New Request</div>
            <div className="card">
              {!account && (
                <div className="alert alert-info">Account not activated yet.</div>
              )}
              {activeCycle && (
                <div className="alert alert-error">Cannot withdraw while a cycle is active. Wait for the current cycle to complete.</div>
              )}
              {hasPending && (
                <div className="alert" style={{ background: 'rgba(255,213,79,0.08)', border: '1px solid rgba(255,213,79,0.2)', color: 'var(--yellow)' }}>
                  You have a pending withdrawal. Wait for admin to process it.
                </div>
              )}

              {account && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Available Balance</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
                    {formatCurrency(account.current_balance)}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Withdrawal Amount (USD)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balance}
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    disabled={!canWithdraw}
                  />
                </div>

                {parsedAmount > 0 && (
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)', fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)' }}>
                      <span>Gross Amount</span>
                      <span className="mono">{formatCurrency(parsedAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: 'var(--red)' }}>
                      <span>Fee (0.5%)</span>
                      <span className="mono">−{formatCurrency(fee)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      <span>You Receive</span>
                      <span className="mono positive">{formatCurrency(netAmount)}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={!canWithdraw || submitting || parsedAmount <= 0}
                  style={{ height: 44 }}
                >
                  {submitting
                    ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          {/* History */}
          <div>
            <div className="section-title">Withdrawal History</div>
            {withdrawals.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                No withdrawal history yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {withdrawals.map(w => (
                  <div key={w.id} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(w.amount)}</div>
                      <span className={`badge badge-${w.status}`}>{w.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
                      <span>Net: {formatCurrency(w.net_amount)}</span>
                      <span>Fee: {formatCurrency(w.fee)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
                      {formatDate(w.requested_at)}
                    </div>
                    {w.admin_note && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                        {w.admin_note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(WithdrawPage);
