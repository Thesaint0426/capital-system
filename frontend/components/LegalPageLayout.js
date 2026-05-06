// Shared legal page component used by withdrawal-policy, terms, privacy, compliance

export function LegalPageLayout({ eyebrow, title, lastUpdated, sections }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f5f3ef', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      {/* Nav */}
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', borderBottom: '1px solid #141414', background: 'rgba(8,8,8,0.95)', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: '#f5f3ef', letterSpacing: '0.05em' }}>
          Capital<span style={{ color: '#00e87a' }}>Invest</span>
        </a>
        <a href="/" style={{ fontSize: 12, color: '#524f4b', transition: 'color 0.2s' }}
          onMouseOver={e => e.target.style.color = '#f5f3ef'} onMouseOut={e => e.target.style.color = '#524f4b'}>
          ← Back to Home
        </a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00e87a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>{eyebrow}</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 48, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.1 }}>
          {title}
        </h1>
        {lastUpdated && (
          <div style={{ fontSize: 12, color: '#3a3734', marginBottom: 52 }}>Last updated: {lastUpdated}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ borderLeft: '2px solid #1e1e1e', paddingLeft: 24 }}>
              {s.heading && (
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 500, marginBottom: 10, color: '#f5f3ef', lineHeight: 1.3 }}>
                  {s.heading}
                </h2>
              )}
              {s.body && (
                <p style={{ fontSize: 14, color: '#8b8680', lineHeight: 1.8, marginBottom: s.list ? 12 : 0 }}>
                  {s.body}
                </p>
              )}
              {s.list && (
                <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.list.map((item, j) => (
                    <li key={j} style={{ fontSize: 14, color: '#8b8680', lineHeight: 1.75 }}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer box */}
        <div style={{ marginTop: 64, padding: '20px 24px', background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 10, fontSize: 12, color: '#3a3734', lineHeight: 1.7 }}>
          ⚠ This document is part of Capital Invest's legal framework. By using the platform, you confirm you have read and accepted all applicable policies. For questions: contact@capitalinvest.live
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #141414', padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginTop: 40 }}>
        <div style={{ fontSize: 12, color: '#3a3734' }}>© 2025 Capital Invest. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[['FAQ', '/faq'], ['Risk Disclosure', '/risk'], ['Withdrawal Policy', '/withdrawal-policy'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Compliance', '/compliance']].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: 12, color: '#3a3734', transition: 'color 0.15s' }}
              onMouseOver={e => e.target.style.color = '#8b8680'} onMouseOut={e => e.target.style.color = '#3a3734'}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
