import Head from 'next/head';
import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: '', email: '', country: '', contact: '',
    source_of_funds: '', understands_risk: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.understands_risk) { toast.error('Please confirm you understand the risks'); return; }
    setLoading(true);
    try {
      await api.post('/api/apply', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Apply for Membership — Capital Invest</title></Head>

      <style>{`
        .apply-page { min-height:100vh; background:#080808; color:#f5f3ef; font-family:'Manrope',sans-serif; display:flex; flex-direction:column; }
        .apply-nav { height:64px; display:flex; align-items:center; justify-content:space-between; padding:0 60px; border-bottom:1px solid #141414; }
        .apply-logo { font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; }
        .apply-logo span { color:#c8a96e; }
        .apply-back { font-size:12px; color:#524f4b; cursor:pointer; transition:color 0.2s; letter-spacing:0.04em; }
        .apply-back:hover { color:#f5f3ef; }
        .apply-body { flex:1; display:flex; align-items:center; justify-content:center; padding:60px 24px; }
        .apply-wrap { width:100%; max-width:560px; }
        .apply-eyebrow { font-size:10px; font-weight:700; color:#c8a96e; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px; }
        .apply-title { font-family:'Space Grotesk',sans-serif; font-size:28px; font-weight:700; letter-spacing:-0.02em; margin-bottom:8px; }
        .apply-sub { font-size:13px; color:#8b8680; line-height:1.6; margin-bottom:32px; }
        .apply-card { background:#0c0c0c; border:1px solid #1e1e1e; border-radius:16px; padding:32px; }
        .apply-form { display:flex; flex-direction:column; gap:20px; }
        .field { display:flex; flex-direction:column; gap:6px; }
        .field-label { font-size:10px; font-weight:700; color:#524f4b; letter-spacing:0.1em; text-transform:uppercase; }
        .input { background:#080808; border:1px solid #252525; border-radius:7px; padding:11px 14px; color:#f5f3ef; font-family:'Manrope',sans-serif; font-size:13px; outline:none; transition:border-color 0.15s; width:100%; }
        .input:focus { border-color:#c8a96e; }
        .input::placeholder { color:#3a3734; }
        select.input { cursor:pointer; }
        textarea.input { resize:vertical; min-height:80px; line-height:1.5; }
        .checkbox-row { display:flex; gap:12px; align-items:flex-start; cursor:pointer; }
        .checkbox-row input { width:16px; height:16px; margin-top:2px; accent-color:#c8a96e; cursor:pointer; flex-shrink:0; }
        .checkbox-label { font-size:12px; color:#8b8680; line-height:1.6; }
        .checkbox-label a { color:#c8a96e; }
        .btn-submit { width:100%; padding:13px; background:#c8a96e; border:none; border-radius:7px; color:#000; font-family:'Manrope',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; letter-spacing:0.05em; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-submit:hover { background:#e0c07a; box-shadow:0 8px 28px rgba(200,169,110,0.2); }
        .btn-submit:disabled { opacity:0.5; cursor:not-allowed; }
        .apply-note { font-size:11px; color:#3a3734; text-align:center; margin-top:14px; line-height:1.5; }
        .apply-divider { height:1px; background:#141414; }

        /* SUCCESS */
        .success-card { background:#0c0c0c; border:1px solid rgba(200,169,110,0.2); border-radius:16px; padding:48px 32px; text-align:center; }
        .success-icon { font-size:40px; margin-bottom:20px; }
        .success-title { font-family:'Space Grotesk',sans-serif; font-size:24px; font-weight:700; letter-spacing:-0.02em; margin-bottom:10px; }
        .success-text { font-size:14px; color:#8b8680; line-height:1.7; max-width:400px; margin:0 auto 24px; }
        .success-detail { background:#080808; border:1px solid #1e1e1e; border-radius:8px; padding:16px; font-size:12px; color:#524f4b; line-height:1.6; text-align:left; margin-bottom:20px; }
        .btn-back-home { padding:11px 24px; background:transparent; border:1px solid #252525; border-radius:7px; color:#f5f3ef; font-family:'Manrope',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .btn-back-home:hover { border-color:#3a3734; background:#141414; }

        @media(max-width:600px) {
          .apply-nav{padding:0 20px;}
          .apply-card{padding:24px 20px;}
        }
      `}</style>

      <div className="apply-page">
        <nav className="apply-nav">
          <div className="apply-logo" onClick={() => window.location.href='/'}>
            Capital<span>Invest</span>
          </div>
          <div className="apply-back" onClick={() => window.location.href='/'}>← Back to Home</div>
        </nav>

        <div className="apply-body">
          <div className="apply-wrap">
            {!submitted ? (
              <>
                <div className="apply-eyebrow">Membership Application</div>
                <h1 className="apply-title">Apply for Private Access</h1>
                <p className="apply-sub">
                  Complete the form below. Applications are reviewed individually within 48 hours. Membership is selective and approval is not guaranteed.
                </p>

                <div className="apply-card">
                  <form className="apply-form" onSubmit={handleSubmit}>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                      <div className="field">
                        <label className="field-label">Full Name *</label>
                        <input className="input" type="text" placeholder="John Smith" value={form.name} onChange={e => set('name', e.target.value)} required />
                      </div>
                      <div className="field">
                        <label className="field-label">Country of Residence *</label>
                        <input className="input" type="text" placeholder="e.g. France" value={form.country} onChange={e => set('country', e.target.value)} required />
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label">Email Address *</label>
                      <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                    </div>

                    <div className="field">
                      <label className="field-label">WhatsApp or Telegram *</label>
                      <input className="input" type="text" placeholder="+1 234 567 8900 or @username" value={form.contact} onChange={e => set('contact', e.target.value)} required />
                    </div>

                    <div className="apply-divider"></div>

                    <div className="field">
                      <label className="field-label">Source of Funds Confirmation *</label>
                      <select className="input" value={form.source_of_funds} onChange={e => set('source_of_funds', e.target.value)} required>
                        <option value="">Select source of funds...</option>
                        <option value="employment">Employment / Salary</option>
                        <option value="business">Business Income</option>
                        <option value="savings">Personal Savings</option>
                        <option value="investments">Investment Returns</option>
                        <option value="inheritance">Inheritance / Gift</option>
                        <option value="other">Other (specify in notes)</option>
                      </select>
                    </div>

                    <label className="checkbox-row">
                      <input type="checkbox" checked={form.understands_risk} onChange={e => set('understands_risk', e.target.checked)} />
                      <span className="checkbox-label">
                        I understand that participation in capital cycles involves risk, including potential loss of my full $10,000 allocation. Past performance does not guarantee future results. I have read and accept the <a href="#">Risk Disclosure</a> and <a href="#">Terms of Service</a>.
                      </span>
                    </label>

                    <button className="btn-submit" type="submit" disabled={loading}>
                      {loading ? (
                        <><div style={{width:16,height:16,border:'2px solid rgba(0,0,0,0.3)',borderTopColor:'#000',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}></div>Submitting...</>
                      ) : 'Submit Application'}
                    </button>

                    <div className="apply-note">
                      Your information is kept strictly confidential and will only be used for membership review purposes.
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="apply-eyebrow" style={{textAlign:'center'}}>Application Received</div>
                <div className="success-card">
                  <div className="success-icon">◈</div>
                  <div className="success-title">Application Under Review</div>
                  <div className="success-text">
                    Your application has been received and is currently under review. Our team evaluates each application individually.
                  </div>
                  <div className="success-detail">
                    <div style={{marginBottom:'6px',fontWeight:'600',color:'#8b8680'}}>What happens next:</div>
                    <div>• You will receive a response within <strong style={{color:'#f5f3ef'}}>48 hours</strong></div>
                    <div>• If approved, onboarding instructions will be sent to your email</div>
                    <div>• You will then fund your $10,000 allocation and gain dashboard access</div>
                    <div style={{marginTop:'10px',color:'#3a3734'}}>If you have any questions, contact us at contact@capitalinvest.live</div>
                  </div>
                  <button className="btn-back-home" onClick={() => window.location.href='/'}>
                    Return to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
