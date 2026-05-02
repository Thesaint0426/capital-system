import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const heroRef = useRef(null);

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/admin' : '/investor/dashboard');
    }
  }, [user, loading]);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    setTimeout(() => {
      document.querySelectorAll('.hero-reveal').forEach(el => el.classList.add('in'));
    }, 80);

    const handleScroll = () => {
      const nav = document.querySelector('.lp-nav');
      if (nav) nav.style.borderBottomColor = window.scrollY > 60 ? '#1e1e1e' : 'transparent';
    };
    window.addEventListener('scroll', handleScroll);
    return () => { obs.disconnect(); window.removeEventListener('scroll', handleScroll); };
  }, []);

  if (loading || user) return null;

  return (
    <>
      <Head>
        <title>Capital Invest — Private Capital Platform</title>
        <meta name="description" content="A selective private capital platform designed for disciplined participation through managed performance cycles." />
      </Head>

      <style>{`
        .lp { background:#080808; color:#f5f3ef; font-family:'Manrope',sans-serif; overflow-x:hidden; }
        .lp *, .lp *::before, .lp *::after { box-sizing:border-box; margin:0; padding:0; }

        /* NAV */
        .lp-nav { position:fixed; top:0; left:0; right:0; z-index:100; height:68px; display:flex; align-items:center; justify-content:space-between; padding:0 60px; background:rgba(8,8,8,0.9); backdrop-filter:blur(24px); border-bottom:1px solid transparent; transition:border-color 0.3s; }
        .lp-logo { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .lp-logo svg { width:28px; height:28px; }
        .lp-logo-text { font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
        .lp-logo-text span { color:#c8a96e; }
        .lp-nav-links { display:flex; align-items:center; gap:32px; list-style:none; }
        .lp-nav-links a { font-size:12px; font-weight:500; color:#524f4b; letter-spacing:0.08em; text-transform:uppercase; transition:color 0.2s; cursor:pointer; }
        .lp-nav-links a:hover { color:#f5f3ef; }
        .lp-nav-actions { display:flex; gap:10px; align-items:center; }
        .btn-nav-login { padding:8px 18px; background:transparent; border:1px solid #252525; border-radius:6px; color:#8b8680; font-family:'Manrope',sans-serif; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; letter-spacing:0.04em; }
        .btn-nav-login:hover { border-color:#c8a96e; color:#c8a96e; }
        .btn-nav-apply { padding:8px 20px; background:#c8a96e; border:none; border-radius:6px; color:#000; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; letter-spacing:0.04em; }
        .btn-nav-apply:hover { background:#e0c07a; box-shadow:0 0 24px rgba(200,169,110,0.2); }

        /* HERO */
        .lp-hero { min-height:100vh; display:flex; align-items:center; position:relative; overflow:hidden; padding-top:68px; }
        .hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse 70% 60% at 65% 45%, rgba(200,169,110,0.04) 0%, transparent 55%), radial-gradient(ellipse 50% 70% at 20% 80%, rgba(62,207,142,0.02) 0%, transparent 50%); }
        .hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px); background-size:72px 72px; }
        .hero-inner { position:relative; z-index:2; max-width:1140px; margin:0 auto; padding:80px 60px; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; width:100%; }
        .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; padding:5px 12px; background:rgba(200,169,110,0.07); border:1px solid rgba(200,169,110,0.15); border-radius:40px; font-size:10px; font-weight:700; color:#c8a96e; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:24px; }
        .hero-eyebrow-dot { width:5px; height:5px; background:#c8a96e; border-radius:50%; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hero-h1 { font-family:'Space Grotesk',sans-serif; font-size:clamp(40px,5vw,62px); font-weight:700; line-height:1.08; letter-spacing:-0.025em; color:#f5f3ef; margin-bottom:20px; }
        .hero-h1 .gold { color:#c8a96e; }
        .hero-sub { font-size:16px; font-weight:400; color:#8b8680; line-height:1.7; max-width:460px; margin-bottom:36px; }
        .hero-actions { display:flex; gap:12px; margin-bottom:48px; flex-wrap:wrap; }
        .btn-hero-primary { padding:13px 28px; background:#c8a96e; border:none; border-radius:7px; color:#000; font-family:'Manrope',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.25s; letter-spacing:0.05em; text-transform:uppercase; }
        .btn-hero-primary:hover { background:#e0c07a; box-shadow:0 8px 32px rgba(200,169,110,0.2); transform:translateY(-1px); }
        .btn-hero-secondary { padding:13px 28px; background:transparent; border:1px solid #252525; border-radius:7px; color:#f5f3ef; font-family:'Manrope',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.25s; letter-spacing:0.04em; }
        .btn-hero-secondary:hover { border-color:#3a3734; background:rgba(255,255,255,0.02); }
        .hero-metrics { display:flex; gap:32px; }
        .hero-metric-value { font-family:'Space Mono',monospace; font-size:20px; font-weight:700; color:#f5f3ef; }
        .hero-metric-value .g { color:#c8a96e; }
        .hero-metric-label { font-size:10px; color:#524f4b; letter-spacing:0.1em; text-transform:uppercase; margin-top:2px; }
        .hero-metric-divider { width:1px; height:32px; background:#1e1e1e; align-self:center; }

        /* HERO VISUAL */
        .hero-visual { position:relative; }
        .hero-card-float { position:absolute; top:-20px; right:-20px; background:#141414; border:1px solid #252525; border-radius:12px; padding:14px 18px; z-index:10; box-shadow:0 24px 48px rgba(0,0,0,0.5); }
        .hero-card-float-val { font-family:'Space Mono',monospace; font-size:18px; font-weight:700; color:#3ecf8e; }
        .hero-card-float-lbl { font-size:9px; color:#524f4b; text-transform:uppercase; letter-spacing:0.1em; margin-top:1px; }
        .hero-dashboard { background:#0c0c0c; border:1px solid #1e1e1e; border-radius:16px; overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,0.6); transform:perspective(900px) rotateY(-6deg) rotateX(2deg); transition:transform 0.5s ease; }
        .hero-dashboard:hover { transform:perspective(900px) rotateY(-2deg) rotateX(1deg); }
        .hd-bar { background:#080808; border-bottom:1px solid #141414; padding:11px 14px; display:flex; align-items:center; gap:7px; }
        .hd-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
        .hd-url { flex:1; background:#141414; border-radius:3px; padding:3px 10px; font-family:'Space Mono',monospace; font-size:10px; color:#3a3734; margin:0 6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .hd-body { padding:18px; display:flex; flex-direction:column; gap:12px; }
        .hd-label { font-family:'Space Mono',monospace; font-size:9px; color:#3a3734; text-transform:uppercase; letter-spacing:0.1em; }
        .hd-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .hd-stat { background:#080808; border:1px solid #141414; border-radius:7px; padding:10px; }
        .hd-stat-lbl { font-size:8px; color:#3a3734; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px; }
        .hd-stat-val { font-family:'Space Mono',monospace; font-size:14px; font-weight:700; }
        .hd-chart { background:#080808; border:1px solid #141414; border-radius:7px; padding:12px; height:88px; }
        .hd-cycle { background:#080808; border:1px solid rgba(200,169,110,0.15); border-radius:7px; padding:11px 13px; display:flex; justify-content:space-between; align-items:center; }
        .hd-cycle-badge { font-size:8px; font-weight:700; padding:2px 7px; background:rgba(200,169,110,0.1); color:#c8a96e; border-radius:20px; text-transform:uppercase; letter-spacing:0.07em; }
        .hd-progress { height:2px; background:#1e1e1e; border-radius:1px; overflow:hidden; margin-top:6px; }
        .hd-progress-fill { height:100%; background:linear-gradient(90deg,#c8a96e,#3ecf8e); border-radius:1px; }

        /* TRUST STRIP */
        .trust-strip { border-top:1px solid #141414; border-bottom:1px solid #141414; background:#0c0c0c; padding:20px 60px; }
        .trust-strip-inner { max-width:1140px; margin:0 auto; display:flex; align-items:center; justify-content:center; gap:48px; flex-wrap:wrap; }
        .trust-item { display:flex; align-items:center; gap:8px; font-size:11px; font-weight:600; color:#524f4b; letter-spacing:0.08em; text-transform:uppercase; }
        .trust-item-dot { width:4px; height:4px; background:#c8a96e; border-radius:50%; opacity:0.6; }

        /* SECTIONS */
        .lp-section { padding:100px 60px; max-width:1140px; margin:0 auto; }
        .lp-section-full { padding:100px 60px; background:#0c0c0c; border-top:1px solid #141414; border-bottom:1px solid #141414; }
        .lp-section-full-inner { max-width:1140px; margin:0 auto; }
        .eyebrow { font-size:10px; font-weight:700; color:#c8a96e; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:14px; }
        .section-h2 { font-family:'Space Grotesk',sans-serif; font-size:clamp(30px,4vw,46px); font-weight:700; line-height:1.12; letter-spacing:-0.02em; margin-bottom:14px; }
        .section-h2 .gold { color:#c8a96e; }
        .section-lead { font-size:15px; color:#8b8680; line-height:1.7; max-width:520px; font-weight:400; }

        /* HOW IT WORKS */
        .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:#141414; border:1px solid #141414; border-radius:16px; overflow:hidden; margin-top:56px; }
        .step { background:#0c0c0c; padding:36px 32px; transition:background 0.2s; }
        .step:hover { background:#101010; }
        .step-num { font-family:'Space Mono',monospace; font-size:11px; font-weight:700; color:#c8a96e; letter-spacing:0.1em; margin-bottom:16px; opacity:0.7; }
        .step-title { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; margin-bottom:10px; letter-spacing:-0.01em; }
        .step-text { font-size:13px; color:#8b8680; line-height:1.7; }

        /* PERFORMANCE */
        .perf-grid { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:start; margin-top:56px; }
        .perf-chart-box { background:#0c0c0c; border:1px solid #1e1e1e; border-radius:12px; padding:24px; }
        .perf-chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .perf-chart-title { font-size:11px; font-weight:700; color:#524f4b; letter-spacing:0.1em; text-transform:uppercase; }
        .perf-chart-tag { font-size:9px; font-weight:700; padding:3px 8px; background:rgba(200,169,110,0.08); color:#c8a96e; border-radius:20px; border:1px solid rgba(200,169,110,0.12); text-transform:uppercase; letter-spacing:0.07em; }
        .perf-outcomes { display:flex; flex-direction:column; gap:12px; }
        .perf-outcome-row { background:#0c0c0c; border:1px solid #1e1e1e; border-radius:10px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; }
        .perf-outcome-label { font-size:12px; color:#8b8680; }
        .perf-outcome-value { font-family:'Space Mono',monospace; font-size:16px; font-weight:700; color:#3ecf8e; }
        .perf-disclaimer { font-size:11px; color:#3a3734; line-height:1.6; margin-top:16px; padding:12px 14px; background:#080808; border:1px solid #141414; border-radius:7px; }

        /* EXCLUSIVITY */
        .excl-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:56px; }
        .excl-card { background:#0c0c0c; border:1px solid #1e1e1e; border-radius:12px; padding:28px; transition:border-color 0.2s; }
        .excl-card:hover { border-color:#252525; }
        .excl-icon { font-size:20px; margin-bottom:14px; }
        .excl-title { font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; margin-bottom:8px; letter-spacing:-0.01em; }
        .excl-text { font-size:13px; color:#8b8680; line-height:1.7; }

        /* FAQ */
        .faq-list { display:flex; flex-direction:column; gap:1px; border:1px solid #141414; border-radius:12px; overflow:hidden; margin-top:56px; }
        .faq-item { background:#0c0c0c; border-bottom:1px solid #141414; }
        .faq-item:last-child { border-bottom:none; }
        .faq-q { width:100%; padding:20px 24px; background:none; border:none; text-align:left; font-family:'Manrope',sans-serif; font-size:14px; font-weight:600; color:#f5f3ef; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; transition:background 0.15s; }
        .faq-q:hover { background:#101010; }
        .faq-q-icon { font-size:18px; color:#524f4b; flex-shrink:0; transition:transform 0.2s; }
        .faq-q.open .faq-q-icon { transform:rotate(45deg); color:#c8a96e; }
        .faq-a { padding:0 24px 20px; font-size:13px; color:#8b8680; line-height:1.7; max-width:640px; }

        /* CTA */
        .cta-section { padding:120px 60px; text-align:center; position:relative; overflow:hidden; }
        .cta-glow { position:absolute; inset:0; background:radial-gradient(ellipse 50% 70% at 50% 50%, rgba(200,169,110,0.05) 0%, transparent 60%); }
        .cta-inner { position:relative; z-index:1; max-width:600px; margin:0 auto; }
        .cta-h2 { font-family:'Space Grotesk',sans-serif; font-size:clamp(36px,5vw,56px); font-weight:700; line-height:1.1; letter-spacing:-0.025em; margin-bottom:16px; }
        .cta-h2 .gold { color:#c8a96e; }
        .cta-sub { font-size:16px; color:#8b8680; line-height:1.7; margin-bottom:36px; }
        .cta-note { font-size:11px; color:#3a3734; margin-top:16px; letter-spacing:0.04em; }

        /* FOOTER */
        .lp-footer { border-top:1px solid #141414; padding:48px 60px 36px; background:#080808; }
        .footer-inner { max-width:1140px; margin:0 auto; }
        .footer-top { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; padding-bottom:36px; border-bottom:1px solid #141414; margin-bottom:28px; }
        .footer-brand { font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:10px; }
        .footer-brand span { color:#c8a96e; }
        .footer-tagline { font-size:12px; color:#3a3734; line-height:1.7; max-width:220px; margin-bottom:16px; }
        .footer-contact { font-size:11px; color:#3a3734; }
        .footer-col-title { font-size:10px; font-weight:700; color:#524f4b; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:14px; }
        .footer-links { list-style:none; display:flex; flex-direction:column; gap:9px; }
        .footer-links a { font-size:12px; color:#3a3734; transition:color 0.15s; cursor:pointer; }
        .footer-links a:hover { color:#8b8680; }
        .footer-bottom { display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#3a3734; flex-wrap:wrap; gap:12px; }
        .footer-legal { display:flex; gap:20px; }
        .footer-legal a { color:#3a3734; transition:color 0.15s; font-size:11px; cursor:pointer; }
        .footer-legal a:hover { color:#524f4b; }
        .footer-disclaimer { font-size:10px; color:#3a3734; line-height:1.6; margin-top:20px; padding-top:20px; border-top:1px solid #141414; opacity:0.7; max-width:800px; }

        /* REVEAL ANIMATIONS */
        .reveal { opacity:0; transform:translateY(24px); transition:opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1); }
        .reveal.in { opacity:1; transform:translateY(0); }
        .hero-reveal { opacity:0; transform:translateY(20px); transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .hero-reveal.in { opacity:1; transform:translateY(0); }
        .d1 { transition-delay:0.05s; }
        .d2 { transition-delay:0.12s; }
        .d3 { transition-delay:0.2s; }
        .d4 { transition-delay:0.28s; }
        .d5 { transition-delay:0.36s; }

        /* RESPONSIVE */
        @media(max-width:900px){
          .lp-nav{padding:0 24px;} .lp-nav-links{display:none;}
          .hero-inner{grid-template-columns:1fr;padding:40px 24px 60px;gap:40px;}
          .hero-visual{display:none;}
          .trust-strip{padding:16px 24px;}
          .trust-strip-inner{gap:24px;}
          .lp-section,.lp-section-full{padding:60px 24px;}
          .steps{grid-template-columns:1fr;}
          .perf-grid{grid-template-columns:1fr;}
          .excl-grid{grid-template-columns:1fr;}
          .cta-section{padding:80px 24px;}
          .lp-footer{padding:36px 24px;}
          .footer-top{grid-template-columns:1fr 1fr;gap:28px;}
        }
      `}</style>

      <div className="lp">

        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-logo">
            <svg viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" fill="none" stroke="#c8a96e" strokeWidth="1.2"/>
              <polygon points="14,2 24,8 14,14 4,8" fill="#c8a96e" opacity="0.85"/>
              <polygon points="4,8 14,14 4,20" fill="#a8894e" opacity="0.6"/>
              <polygon points="24,8 14,14 24,20" fill="#a8894e" opacity="0.6"/>
              <polygon points="14,14 4,20 14,26 24,20" fill="#c8a96e" opacity="0.4"/>
            </svg>
            <span className="lp-logo-text">Capital<span>Invest</span></span>
          </div>
          <ul className="lp-nav-links">
            <li><a onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})}>How It Works</a></li>
            <li><a onClick={() => document.getElementById('performance').scrollIntoView({behavior:'smooth'})}>Performance</a></li>
            <li><a onClick={() => document.getElementById('faq').scrollIntoView({behavior:'smooth'})}>FAQ</a></li>
          </ul>
          <div className="lp-nav-actions">
            <button className="btn-nav-login" onClick={() => window.location.href='/login'}>Member Login</button>
            <button className="btn-nav-apply" onClick={() => window.location.href='/apply'}>Apply for Access</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="hero-bg"></div>
          <div className="hero-grid"></div>
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow hero-reveal">
                <span className="hero-eyebrow-dot"></span>
                Private Membership — By Application Only
              </div>
              <h1 className="hero-h1 hero-reveal d1">
                Private Capital Growth.<br/><span className="gold">Structured Simplicity.</span>
              </h1>
              <p className="hero-sub hero-reveal d2">
                Join a selective private capital platform designed for disciplined participation through managed performance cycles. Transparent. Structured. Serious.
              </p>
              <div className="hero-actions hero-reveal d3">
                <button className="btn-hero-primary" onClick={() => window.location.href='/apply'}>Apply for Access</button>
                <button className="btn-hero-secondary" onClick={() => window.location.href='/login'}>Member Login</button>
              </div>
              <div className="hero-metrics hero-reveal d4">
                <div>
                  <div className="hero-metric-value">$10<span className="g">K</span></div>
                  <div className="hero-metric-label">Entry Allocation</div>
                </div>
                <div className="hero-metric-divider"></div>
                <div>
                  <div className="hero-metric-value">30<span className="g">d</span></div>
                  <div className="hero-metric-label">Cycle Duration</div>
                </div>
                <div className="hero-metric-divider"></div>
                <div>
                  <div className="hero-metric-value">0.5<span className="g">%</span></div>
                  <div className="hero-metric-label">Withdrawal Fee</div>
                </div>
              </div>
            </div>

            <div className="hero-visual hero-reveal d2">
              <div className="hero-card-float">
                <div className="hero-card-float-val">+$2,150</div>
                <div className="hero-card-float-lbl">Last Cycle Result</div>
              </div>
              <div className="hero-dashboard">
                <div className="hd-bar">
                  <div className="hd-dot" style={{background:'#ff5f57'}}></div>
                  <div className="hd-dot" style={{background:'#ffbd2e'}}></div>
                  <div className="hd-dot" style={{background:'#28c840'}}></div>
                  <div className="hd-url">capitalinvest.live/member/dashboard</div>
                </div>
                <div className="hd-body">
                  <div className="hd-label">Member Dashboard</div>
                  <div className="hd-stats">
                    <div className="hd-stat"><div className="hd-stat-lbl">Allocation</div><div className="hd-stat-val" style={{color:'#f5f3ef'}}>$10,000</div></div>
                    <div className="hd-stat"><div className="hd-stat-lbl">Performance</div><div className="hd-stat-val" style={{color:'#3ecf8e'}}>+$2,150</div></div>
                    <div className="hd-stat"><div className="hd-stat-lbl">Balance</div><div className="hd-stat-val" style={{color:'#c8a96e'}}>$12,150</div></div>
                  </div>
                  <div className="hd-chart">
                    <svg viewBox="0 0 280 64" preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
                      <defs>
                        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c8a96e" stopOpacity="0.15"/>
                          <stop offset="100%" stopColor="#c8a96e" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M 0,55 L 56,44 L 112,36 L 168,40 L 224,22 L 280,12 L 280,64 L 0,64 Z" fill="url(#hg)"/>
                      <path d="M 0,55 L 56,44 L 112,36 L 168,40 L 224,22 L 280,12" fill="none" stroke="#c8a96e" strokeWidth="1.5"/>
                      <circle cx="280" cy="12" r="3" fill="#c8a96e"/>
                    </svg>
                  </div>
                  <div className="hd-cycle">
                    <div>
                      <div style={{fontSize:'9px',color:'#3a3734',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'3px'}}>Active Cycle</div>
                      <div style={{fontFamily:'Space Mono,monospace',fontSize:'14px',fontWeight:'700',color:'#c8a96e'}}>$10,000.00</div>
                      <div className="hd-progress" style={{width:'160px',marginTop:'6px'}}><div className="hd-progress-fill" style={{width:'68%'}}></div></div>
                    </div>
                    <div className="hd-cycle-badge">● Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="trust-strip">
          <div className="trust-strip-inner">
            {['Private Membership Model','Secure Wallet Transfers','Transparent Cycle Tracking','Dedicated Member Dashboard','Selective Onboarding'].map((t, i) => (
              <div key={i} className="trust-item reveal">
                <div className="trust-item-dot"></div>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section id="how">
          <div className="lp-section">
            <div className="eyebrow reveal">The Process</div>
            <h2 className="section-h2 reveal d1">Three steps to <span className="gold">private membership</span></h2>
            <p className="section-lead reveal d2">A structured onboarding process designed to ensure quality participation and mutual alignment.</p>
            <div className="steps">
              {[
                { n:'01', title:'Apply & Qualify', text:'Submit your application for review. Our team evaluates each applicant individually. Membership is selective and not guaranteed.' },
                { n:'02', title:'Fund Your Allocation', text:'Upon approval, fund your fixed $10,000 allocation. This standardised entry ensures a disciplined, equal-footing participation model for all members.' },
                { n:'03', title:'Track Your Cycle', text:'Access your private dashboard to monitor your active cycle, view performance data, request withdrawals, and track your history in real time.' },
              ].map((s, i) => (
                <div key={i} className={`step reveal d${i+1}`}>
                  <div className="step-num">STEP {s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERFORMANCE */}
        <section id="performance" className="lp-section-full">
          <div className="lp-section-full-inner">
            <div className="eyebrow reveal">Historical Performance</div>
            <h2 className="section-h2 reveal d1">Cycle outcomes, <span className="gold">transparently presented</span></h2>
            <p className="section-lead reveal d2">Historical cycle results are shared with full disclosure. Past performance does not guarantee future results. Capital is at risk.</p>
            <div className="perf-grid">
              <div>
                <div className="perf-chart-box reveal d1">
                  <div className="perf-chart-header">
                    <div className="perf-chart-title">Cycle Performance Chart</div>
                    <div className="perf-chart-tag">Historical Data</div>
                  </div>
                  <svg viewBox="0 0 440 160" style={{width:'100%'}}>
                    <defs>
                      <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3ecf8e" stopOpacity="0.12"/>
                        <stop offset="100%" stopColor="#3ecf8e" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="80" x2="440" y2="80" stroke="#141414" strokeWidth="1"/>
                    <line x1="0" y1="40" x2="440" y2="40" stroke="#141414" strokeWidth="1" strokeDasharray="3,3"/>
                    <line x1="0" y1="120" x2="440" y2="120" stroke="#141414" strokeWidth="1" strokeDasharray="3,3"/>
                    <path d="M 40,110 L 110,88 L 180,75 L 250,82 L 320,60 L 390,45 L 390,160 L 40,160 Z" fill="url(#pg)"/>
                    <path d="M 40,110 L 110,88 L 180,75 L 250,82 L 320,60 L 390,45" fill="none" stroke="#3ecf8e" strokeWidth="2"/>
                    {[40,110,180,250,320,390].map((x,i) => (
                      <circle key={i} cx={x} cy={[110,88,75,82,60,45][i]} r="4" fill="#3ecf8e"/>
                    ))}
                    {['C1','C2','C3','C4','C5','C6'].map((l,i) => (
                      <text key={i} x={[40,110,180,250,320,390][i]} y="155" textAnchor="middle" fill="#3a3734" fontSize="10" fontFamily="Space Mono">{l}</text>
                    ))}
                    <text x="8" y="83" fill="#3a3734" fontSize="9" fontFamily="Space Mono">$0</text>
                    <text x="8" y="43" fill="#3a3734" fontSize="9" fontFamily="Space Mono">+$2K</text>
                  </svg>
                </div>
              </div>
              <div>
                <div className="perf-outcomes reveal d2">
                  <div style={{fontSize:'10px',fontWeight:'700',color:'#524f4b',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'12px'}}>Common Historical Outcomes</div>
                  {[
                    { label:'Conservative Historical Range', value:'+$2,000' },
                    { label:'Typical Historical Range', value:'+$2,150' },
                    { label:'Higher Historical Range', value:'+$2,300' },
                  ].map((r, i) => (
                    <div key={i} className="perf-outcome-row">
                      <div className="perf-outcome-label">{r.label}</div>
                      <div className="perf-outcome-value">{r.value}</div>
                    </div>
                  ))}
                  <div className="perf-disclaimer">
                    ⚠ Historical performance figures are illustrative only. Results vary per cycle and are not guaranteed. All capital is at risk. Past outcomes do not predict future performance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXCLUSIVITY */}
        <section>
          <div className="lp-section">
            <div className="eyebrow reveal">Membership Model</div>
            <h2 className="section-h2 reveal d1">Designed for <span className="gold">serious participants</span></h2>
            <p className="section-lead reveal d2">Every design decision — from the fixed allocation to the manual review process — is intentional. Quality over quantity.</p>
            <div className="excl-grid">
              {[
                { icon:'◈', title:'Fixed $10,000 Allocation', text:'One standardised entry point for all members. No tiers, no confusion. Equal footing and consistent cycle management.' },
                { icon:'◉', title:'Application-Only Access', text:'No open registration. Every applicant is reviewed manually before access is granted. This ensures the integrity of the membership circle.' },
                { icon:'⬡', title:'Private Dashboard', text:'Each approved member receives a secure, personal dashboard with full visibility into their allocation, cycle status, and history.' },
                { icon:'✦', title:'Structured Cycles', text:'All capital participates in clearly defined 30-day cycles with transparent start and end dates. No ambiguity on timing or process.' },
                { icon:'⟳', title:'Transparent Results', text:'Every cycle outcome is recorded and immediately visible in your dashboard. Real numbers, real performance — nothing hidden.' },
                { icon:'↗', title:'Flexible Exit', text:'Submit withdrawal requests at cycle completion. A minimal 0.5% processing fee applies. Your capital remains accessible.' },
              ].map((c, i) => (
                <div key={i} className={`excl-card reveal d${(i%3)+1}`}>
                  <div className="excl-icon">{c.icon}</div>
                  <div className="excl-title">{c.title}</div>
                  <div className="excl-text">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="lp-section-full">
          <div className="lp-section-full-inner">
            <div className="eyebrow reveal">Common Questions</div>
            <h2 className="section-h2 reveal d1">Frequently asked</h2>
            <FaqList />
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-glow"></div>
          <div className="cta-inner">
            <div className="eyebrow reveal" style={{textAlign:'center'}}>Limited Membership</div>
            <h2 className="cta-h2 reveal d1">Ready to apply for <span className="gold">private access?</span></h2>
            <p className="cta-sub reveal d2">Applications are reviewed individually. Membership is selective. If you meet our criteria, you will be contacted within 48 hours.</p>
            <div className="reveal d3">
              <button className="btn-hero-primary" style={{padding:'14px 36px',fontSize:'13px'}} onClick={() => window.location.href='/apply'}>Submit Your Application</button>
              <div className="cta-note">By applying, you confirm you have read and understood our Risk Disclosure.</div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="footer-inner">
            <div className="footer-top">
              <div>
                <div className="footer-brand">Capital<span>Invest</span></div>
                <div className="footer-tagline">A private capital platform for disciplined participation in managed performance cycles.</div>
                <div className="footer-contact">contact@capitalinvest.live</div>
              </div>
              <div>
                <div className="footer-col-title">Platform</div>
                <ul className="footer-links">
                  <li><a onClick={() => window.location.href='/login'}>Member Login</a></li>
                  <li><a onClick={() => window.location.href='/apply'}>Apply for Access</a></li>
                  <li><a onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})}>How It Works</a></li>
                  <li><a onClick={() => document.getElementById('performance').scrollIntoView({behavior:'smooth'})}>Performance</a></li>
                </ul>
              </div>
              <div>
                <div className="footer-col-title">Membership</div>
                <ul className="footer-links">
                  <li><a onClick={() => document.getElementById('faq').scrollIntoView({behavior:'smooth'})}>FAQ</a></li>
                  <li><a href="#">Risk Disclosure</a></li>
                  <li><a href="#">Withdrawal Policy</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
              <div>
                <div className="footer-col-title">Legal</div>
                <ul className="footer-links">
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Risk Disclosure</a></li>
                  <li><a href="#">Compliance</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <div>© 2025 Capital Invest. All rights reserved.</div>
              <div className="footer-legal">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Risk</a>
              </div>
            </div>
            <div className="footer-disclaimer">
              Capital Invest is a private capital participation platform. Membership is by application only. Participation in capital cycles involves risk, including the potential loss of the full allocation. Historical performance figures are illustrative and do not constitute a guarantee of future results. Capital Invest does not provide financial advice. All figures shown are for informational purposes only. Results may vary. Capital at risk.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

function FaqList() {
  const faqs = [
    { q: 'Is performance guaranteed?', a: 'No. Performance is never guaranteed. Historical cycles have commonly produced positive outcomes, but all participation carries risk. Results vary per cycle and your capital may decrease. Please read our Risk Disclosure before applying.' },
    { q: 'How are cycles managed?', a: 'Each 30-day cycle is managed by our private capital desk. You are notified when a cycle begins and ends. Results are recorded in your dashboard upon cycle completion. You can view full history at any time.' },
    { q: 'How do withdrawals work?', a: 'After a cycle completes, you may submit a withdrawal request via your member dashboard. A 0.5% processing fee applies. Requests are reviewed and processed within 24–48 hours. You cannot withdraw during an active cycle.' },
    { q: 'Why is the entry fixed at $10,000?', a: 'A fixed allocation creates consistency in cycle management and ensures all members participate on equal terms. It also establishes a level of commitment that aligns with the seriousness of the platform.' },
    { q: 'How does onboarding work?', a: 'Submit your application via our Apply page. Applications are reviewed individually within 48 hours. If approved, you will receive onboarding instructions by email. You will then fund your $10,000 allocation and your dashboard will be activated.' },
    { q: 'Who can apply?', a: 'Any individual who understands investment risk, can commit the required $10,000 allocation, and meets our internal eligibility criteria. Membership is selective and not guaranteed to all applicants.' },
  ];

  return (
    <div className="faq-list reveal d2">
      {faqs.map((f, i) => (
        <FaqItem key={i} q={f.q} a={f.a} />
      ))}
    </div>
  );
}

function FaqItem({ q, a }) {
  const { useState } = require('react');
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className={`faq-q ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {q}
        <span className="faq-q-icon">+</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}
