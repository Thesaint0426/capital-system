import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';
import { fmt, fmtDate } from '../../lib/format';
import toast from 'react-hot-toast';

function WithdrawPage() {
  const [account, setAccount] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('USDT_TRC20');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const FEE = 0.005;

  useEffect(() => {
    Promise.all([
      api.get('/api/investor/account').catch(() => ({ data: null })),
      api.get('/api/investor/cycles'),
      api.get('/api/investor/withdrawals'),
    ]).then(([a, c, w]) => {
      setAccount(a.data);
      setActiveCycle(c.data.activeCycle);
      setWithdrawals(w.data);
    }).finally(() => setLoading(false));
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount > 0 ? parseFloat((parsedAmount * FEE).toFixed(2)) : 0;
  const net = parsedAmount > 0 ? parseFloat((parsedAmount - fee).toFixed(2)) : 0;
  const balance = parseFloat(account?.current_balance || 0);
  const hasPending = withdrawals.some(w => w.status === 'pending');
  const canWithdraw = account && !activeCycle && !hasPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parsedAmount || parsedAmount <= 0) { toast.error('Enter a valid amount'); return; }
    if (parsedAmount > balance) { toast.error('Amount exceeds available balance'); return; }
    if (!walletAddress.trim()) { toast.error('Please enter your wallet address'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/investor/withdraw', { amount: parsedAmount, wallet_address: walletAddress, network });
      toast.success('Withdrawal request submitted');
      setAmount(''); setWalletAddress('');
      const w = await api.get('/api/investor/withdrawals');
      setWithdrawals(w.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (s) => ({
    active: { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.12)' },
    pending: { bg: 'rgba(0,232,122,0.08)', color: '#00e87a', border: 'rgba(0,232,122,0.12)' },
    approved: { bg: 'rgba(62,207,142,0.08)', color: '#3ecf8e', border: 'rgba(62,207,142,0.12)' },
    rejected: { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.12)' },
    paid: { bg: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: 'rgba(96,165,250,0.12)' },
  })[s] || { bg: 'rgba(82,79,75,0.15)', color: '#524f4b', border: 'rgba(82,79,75,0.15)' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #1e1e1e', borderTopColor: '#00e87a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head><title>Withdraw — Capital Invest</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans,sans-serif', color: '#f5f3ef' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, padding: '40px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Withdrawal Request</h1>
            <div style={{ fontSize: 13, color: '#524f4b' }}>Submit a withdrawal from your available balance</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 840 }}>
            {/* Form */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>New Request</div>
              <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 22 }}>

                {/* Alerts */}
                {!account && <div style={{ padding: '11px 14px', background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.12)', borderRadius: 7, fontSize: 12, color: '#00e87a', marginBottom: 16 }}>Account not yet activated.</div>}
                {activeCycle && <div style={{ padding: '11px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 7, fontSize: 12, color: '#f87171', marginBottom: 16 }}>Withdrawals are not available during an active cycle. Please wait for your current cycle to complete.</div>}
                {hasPending && <div style={{ padding: '11px 14px', background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.12)', borderRadius: 7, fontSize: 12, color: '#00e87a', marginBottom: 16 }}>You have a pending withdrawal request. Wait for admin processing before submitting a new one.</div>}

                {/* Balance display */}
                {account && (
                  <div style={{ background: '#080808', border: '1px solid #141414', borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
                    <div style={{ fontSize: 10, color: '#3a3734', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Available Balance</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 24, fontWeight: 700, color: '#00e87a' }}>{fmt(balance)}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Amount (USD)</label>
                    <input
                      style={{ background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif', fontSize: 14, width: '100%', outline: 'none', transition: 'border-color 0.15s' }}
                      type="number" step="0.01" min="1" max={balance}
                      placeholder="0.00" value={amount}
                      onChange={e => setAmount(e.target.value)}
                      disabled={!canWithdraw}
                      onFocus={e => e.target.style.borderColor = '#00e87a'}
                      onBlur={e => e.target.style.borderColor = '#252525'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Network</label>
                    <select
                      style={{ background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'DM Sans,sans-serif', fontSize: 13, width: '100%', outline: 'none', cursor: 'pointer' }}
                      value={network} onChange={e => setNetwork(e.target.value)} disabled={!canWithdraw}>
                      <option value="USDT_TRC20">USDT — TRC20 (Tron)</option>
                      <option value="USDT_ERC20">USDT — ERC20 (Ethereum)</option>
                      <option value="USDT_BEP20">USDT — BEP20 (BSC)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#524f4b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Wallet Address / Bank Details</label>
                    <input
                      style={{ background: '#080808', border: '1px solid #252525', borderRadius: 7, padding: '11px 14px', color: '#f5f3ef', fontFamily: 'Space Mono,monospace', fontSize: 12, width: '100%', outline: 'none', transition: 'border-color 0.15s' }}
                      type="text" placeholder="Enter your wallet address..."
                      value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                      disabled={!canWithdraw}
                      onFocus={e => e.target.style.borderColor = '#00e87a'}
                      onBlur={e => e.target.style.borderColor = '#252525'}
                    />
                  </div>

                  {/* Fee breakdown */}
                  {parsedAmount > 0 && (
                    <div style={{ background: '#080808', border: '1px solid #141414', borderRadius: 8, padding: '14px 16px' }}>
                      {[
                        { label: 'Gross Amount', value: fmt(parsedAmount), color: '#8b8680' },
                        { label: 'Processing Fee (0.5%)', value: `−${fmt(fee)}`, color: '#f87171' },
                      ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', color: r.color }}>
                          <span>{r.label}</span>
                          <span style={{ fontFamily: 'Space Mono,monospace' }}>{r.value}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, padding: '10px 0 0', borderTop: '1px solid #1e1e1e', marginTop: 8 }}>
                        <span>You Receive</span>
                        <span style={{ fontFamily: 'Space Mono,monospace', color: '#3ecf8e' }}>{fmt(net)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canWithdraw || submitting || parsedAmount <= 0 || !walletAddress.trim()}
                    style={{ padding: '12px', background: canWithdraw && parsedAmount > 0 && walletAddress ? '#00e87a' : '#1e1e1e', border: 'none', borderRadius: 7, color: canWithdraw && parsedAmount > 0 && walletAddress ? '#000' : '#3a3734', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, cursor: canWithdraw ? 'pointer' : 'not-allowed', transition: 'all 0.2s', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {submitting ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>Processing...</> : 'Submit Request'}
                  </button>
                </form>
              </div>

              <div style={{ marginTop: 12, padding: '11px 14px', background: '#080808', border: '1px solid #141414', borderRadius: 7, fontSize: 11, color: '#3a3734', lineHeight: 1.6 }}>
                ⚠ Withdrawal requests are reviewed and processed within 24–48 hours. Ensure your wallet address is correct before submitting. We are not liable for funds sent to incorrect addresses.
              </div>
            </div>

            {/* History */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3734', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Request History</div>
              {withdrawals.length === 0 ? (
                <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, padding: 32, textAlign: 'center', color: '#3a3734', fontSize: 13 }}>No withdrawal history</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {withdrawals.map(w => {
                    const ss = statusStyle(w.status);
                    return (
                      <div key={w.id} style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px 18px', transition: 'border-color 0.15s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 18, fontWeight: 700 }}>{fmt(w.amount)}</div>
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                            {w.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#3a3734' }}>
                          <span>Net: {fmt(w.net_amount)}</span>
                          <span>Fee: {fmt(w.fee)}</span>
                        </div>
                        {w.network && <div style={{ fontSize: 10, color: '#3a3734', marginTop: 4 }}>{w.network}</div>}
                        <div style={{ fontSize: 11, color: '#3a3734', marginTop: 6 }}>{fmtDate(w.requested_at)}</div>
                        {w.admin_note && <div style={{ fontSize: 11, color: '#524f4b', marginTop: 6, fontStyle: 'italic' }}>{w.admin_note}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export default withAuth(WithdrawPage);
