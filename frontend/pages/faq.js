import Head from 'next/head';
import { useState } from 'react';

const faqs = [
  {
    q: 'What is Capital Invest?',
    a: 'Capital Invest is a private membership-based capital participation platform. Approved members gain access to structured investment cycles and a secure Investor Interface to monitor performance and activity.',
  },
  {
    q: 'Who can join?',
    a: 'Access is restricted to approved applicants only. Each application is reviewed to ensure alignment with platform requirements and participation standards.',
  },
  {
    q: 'What is the minimum investment?',
    a: 'The platform operates on a fixed initial allocation of $10,000 USD. This requirement is strictly enforced to maintain consistency and structure across all participant accounts.',
  },
  {
    q: 'Are returns guaranteed?',
    a: 'Capital participation involves risk, and returns are not guaranteed. While historical cycles have consistently delivered positive outcomes, results may vary depending on conditions and cycle execution. All participation is subject to our Risk Disclosure.',
  },
  {
    q: 'What ROI can I expect?',
    a: 'Based on historical cycle performance, members have experienced returns in the range of 20% per month. This is based on historical data only and does not constitute a guarantee of future results. Capital is at risk.',
  },
  {
    q: 'How do investment cycles work?',
    a: 'Members participate in structured capital cycles over a 30-day period. At the end of each cycle, results are calculated and reflected in the member Investor Interface.',
  },
  {
    q: 'How are profits generated?',
    a: 'Capital is deployed through proprietary strategies and structured operations. Specific methodologies are not publicly disclosed as part of the platform\'s private model.',
  },
  {
    q: 'Can I withdraw at any time?',
    a: 'Liquidity requests can be submitted through the Investor Interface. Processing depends on cycle status and internal review. If a cycle is running, liquidity requests are not available until the cycle completes.',
  },
  {
    q: 'How long do withdrawals take?',
    a: 'We typically process liquidity requests within a 24–72 hour timeframe after approval. Processing times may vary depending on operational and security checks.',
  },
  {
    q: 'Are there any fees?',
    a: 'A small processing fee applies to liquidity requests. All applicable fees are clearly displayed before submission. No hidden charges.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We implement secure systems and protocols to protect user data and account access. All communications are encrypted and access is strictly controlled.',
  },
  {
    q: 'Why is the platform private?',
    a: 'Capital Invest operates as a selective, private participation system to maintain quality, control, and operational integrity. Membership is by application only.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #141414' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '20px 0', background: 'none', border: 'none',
        textAlign: 'left', fontFamily: "'DM Sans',sans-serif", fontSize: 15,
        fontWeight: 600, color: '#f5f3ef', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
      }}>
        {q}
        <span style={{ fontSize: 20, color: open ? '#00e87a' : '#524f4b', transition: 'transform 0.2s, color 0.2s', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20, fontSize: 14, color: '#8b8680', lineHeight: 1.75, maxWidth: 680 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Head><title>FAQ — Capital Invest</title></Head>
      <style>{`
        body { background:#080808; color:#f5f3ef; font-family:'DM Sans',sans-serif; margin:0; }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      `}</style>
      <div style={{ minHeight: '100vh', background: '#080808' }}>
        {/* Nav */}
        <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', borderBottom: '1px solid #141414', background: 'rgba(8,8,8,0.95)' }}>
          <a href="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: '#f5f3ef', textDecoration: 'none', letterSpacing: '0.05em' }}>
            Capital<span style={{ color: '#00e87a' }}>Invest</span>
          </a>
          <a href="/" style={{ fontSize: 12, color: '#524f4b', textDecoration: 'none', transition: 'color 0.2s' }}>← Back to Home</a>
        </nav>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#00e87a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Support</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 48, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.1 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 15, color: '#8b8680', marginBottom: 56, lineHeight: 1.7 }}>
            Everything you need to know about Capital Invest. Can't find your answer? Contact us at contact@capitalinvest.live
          </p>
          <div>
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
          <div style={{ marginTop: 64, padding: '24px', background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 12, fontSize: 13, color: '#3a3734', lineHeight: 1.6 }}>
            ⚠ Capital Invest is a private participation platform. All participation involves financial risk. Historical performance does not guarantee future results. Capital at risk.
          </div>
        </div>

        {/* Footer */}
        <LegalFooter />
      </div>
    </>
  );
}

function LegalFooter() {
  return (
    <div style={{ borderTop: '1px solid #141414', padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ fontSize: 12, color: '#3a3734' }}>© 2025 Capital Invest. All rights reserved.</div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[['FAQ', '/faq'], ['Risk Disclosure', '/risk'], ['Withdrawal Policy', '/withdrawal-policy'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Compliance', '/compliance']].map(([label, href]) => (
          <a key={href} href={href} style={{ fontSize: 12, color: '#3a3734', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseOver={e => e.target.style.color = '#8b8680'} onMouseOut={e => e.target.style.color = '#3a3734'}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
