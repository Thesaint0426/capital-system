import Head from 'next/head';

export default function RiskPage() {
  return (
    <>
      <Head><title>Risk Disclosure — Capital Invest</title></Head>
      <LegalPage
        eyebrow="Legal"
        title="Risk Disclosure"
        lastUpdated="May 2025"
        sections={[
          {
            heading: 'Participation in Capital Invest involves financial risk.',
            body: 'By accessing or using this platform, you acknowledge and agree to the following disclosures in full.',
          },
          {
            heading: 'No Guarantee of Returns',
            body: 'All performance figures are indicative and based on historical outcomes. While our model has historically delivered consistent positive results — commonly in the range of 20% per month — there is no guarantee of profit or capital preservation. Historical performance does not guarantee future results.',
          },
          {
            heading: 'Capital at Risk',
            body: 'You understand that your capital is exposed to potential loss, either partially or entirely, depending on market conditions and operational outcomes. You should never participate with funds you cannot afford to lose.',
          },
          {
            heading: 'No Financial Advice',
            body: 'Capital Invest does not provide financial, legal, or tax advice. All participation decisions are made solely at your own discretion. We strongly recommend consulting an independent financial adviser before participating.',
          },
          {
            heading: 'Performance Variability',
            body: 'Our model has historically achieved a high rate of positive cycle outcomes. However, past performance does not guarantee future results. Cycle outcomes may differ significantly based on external conditions.',
          },
          {
            heading: 'User Responsibility',
            body: 'You are solely responsible for: evaluating risks associated with participation, understanding the platform model fully, ensuring compliance with your local laws and regulations, and any decisions made on the basis of platform information.',
          },
          {
            heading: 'Independent Participation',
            body: 'You confirm that you are not relying on any representations outside of official platform communication, and that your participation is entirely voluntary and self-directed.',
          },
        ]}
      />
    </>
  );
}

function LegalPage({ eyebrow, title, lastUpdated, sections }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f5f3ef', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', borderBottom: '1px solid #141414' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: '#f5f3ef', textDecoration: 'none', letterSpacing: '0.05em' }}>
          Capital<span style={{ color: '#00e87a' }}>Invest</span>
        </a>
        <a href="/" style={{ fontSize: 12, color: '#524f4b', textDecoration: 'none' }}>← Back to Home</a>
      </nav>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00e87a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>{eyebrow}</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 48, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.1 }}>{title}</h1>
        {lastUpdated && <div style={{ fontSize: 12, color: '#3a3734', marginBottom: 48 }}>Last updated: {lastUpdated}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ borderLeft: '2px solid #1e1e1e', paddingLeft: 24 }}>
              {s.heading && <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 500, marginBottom: 10, color: '#f5f3ef' }}>{s.heading}</h2>}
              <p style={{ fontSize: 14, color: '#8b8680', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
              {s.list && (
                <ul style={{ margin: '10px 0 0', padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.list.map((item, j) => (
                    <li key={j} style={{ fontSize: 14, color: '#8b8680', lineHeight: 1.7 }}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}

function LegalFooter() {
  return (
    <div style={{ borderTop: '1px solid #141414', padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ fontSize: 12, color: '#3a3734' }}>© 2025 Capital Invest. All rights reserved.</div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[['FAQ', '/faq'], ['Risk Disclosure', '/risk'], ['Withdrawal Policy', '/withdrawal-policy'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Compliance', '/compliance']].map(([label, href]) => (
          <a key={href} href={href} style={{ fontSize: 12, color: '#3a3734', textDecoration: 'none' }}
            onMouseOver={e => e.target.style.color = '#8b8680'} onMouseOut={e => e.target.style.color = '#3a3734'}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
