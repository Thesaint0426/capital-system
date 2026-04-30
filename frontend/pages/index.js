import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!loading && user) {
      if (user.role === 'admin') router.push('/admin');
      else router.push('/investor/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    setTimeout(() => {
      document.querySelectorAll('.hero .fade-up').forEach(el => el.classList.add('visible'));
    }, 100);

    const handleScroll = () => {
      const nav = document.querySelector('.landing-nav');
      if (nav) nav.style.background = window.scrollY > 50 ? 'rgba(3,3,3,0.97)' : 'rgba(3,3,3,0.85)';
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) return null;
  if (user) return null;

  return (
    <>
      <Head>
        <title>Capital Invest — Private Investment Management</title>
        <meta name="description" content="Private capital management through structured 30-day investment cycles. Transparent, professional, results-driven." />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <style global jsx>{`
        body { background: #030303 !important; }
        .landing-page { background:#030303; color:#f0ede8; font-family:'Outfit',sans-serif; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
        .landing-page *, .landing-page *::before, .landing-page *::after { box-sizing:border-box; }
        .landing-page a { color:inherit; text-decoration:none; }
        .landing-nav { position:fixed; top:0; left:0; right:0; z-index:1000; padding:0 60px; height:72px; display:flex; align-items:center; justify-content:space-between; background:rgba(3,3,3,0.85); backdrop-filter:blur(20px); border-bottom:1px solid #161616; transition:background 0.3s; }
        .nav-logo { display:flex; align-items:center; gap:12px; cursor:pointer; }
        .nav-logo-text { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:500; letter-spacing:0.05em; }
        .nav-logo-text span { color:#00e87a; }
        .nav-links { display:flex; align-items:center; gap:36px; list-style:none; margin:0; padding:0; }
        .nav-links a { font-size:13px; font-weight:500; color:#8a8680; letter-spacing:0.06em; text-transform:uppercase; transition:color 0.2s; cursor:pointer; }
        .nav-links a:hover { color:#f0ede8; }
        .nav-actions { display:flex; align-items:center; gap:12px; }
        .btn-nav-login { padding:8px 20px; background:transparent; border:1px solid #1f1f1f; border-radius:4px; color:#8a8680; font-family:'Outfit',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; }
        .btn-nav-login:hover { border-color:#00e87a; color:#00e87a; }
        .btn-nav-signup { padding:8px 24px; background:#00e87a; border:none; border-radius:4px; color:#000; font-family:'Outfit',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; }
        .btn-nav-signup:hover { background:#00c268; box-shadow:0 0 30px rgba(0,232,122,0.2); }
        .hero { min-height:100vh; padding-top:72px; display:flex; align-items:center; position:relative; overflow:hidden; }
        .hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse 80% 60% at 70% 50%,rgba(0,232,122,0.04) 0%,transparent 60%),linear-gradient(180deg,#030303 0%,#050505 100%); }
        .hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px); background-size:80px 80px; }
        .hero-content { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:80px 60px; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; width:100%; }
        .hero-tag { display:inline-flex; align-items:center; gap:8px; padding:6px 14px; background:rgba(0,232,122,0.06); border:1px solid rgba(0,232,122,0.15); border-radius:40px; font-size:11px; font-weight:600; color:#00e87a; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:28px; }
        .hero-tag::before { content:''; width:6px; height:6px; background:#00e87a; border-radius:50%; animation:pulse 2s infinite; flex-shrink:0; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(42px,5vw,68px); font-weight:300; line-height:1.1; letter-spacing:-0.01em; margin-bottom:24px; }
        .hero-title em { font-style:italic; color:#00e87a; }
        .hero-sub { font-size:17px; font-weight:300; color:#8a8680; line-height:1.7; max-width:480px; margin-bottom:40px; }
        .hero-actions { display:flex; align-items:center; gap:16px; margin-bottom:56px; }
        .btn-hero-primary { padding:14px 32px; background:#00e87a; border:none; border-radius:4px; color:#000; font-family:'Outfit',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.25s; letter-spacing:0.04em; }
        .btn-hero-primary:hover { background:#00c268; box-shadow:0 8px 40px rgba(0,232,122,0.15); transform:translateY(-1px); }
        .btn-hero-secondary { padding:14px 32px; background:transparent; border:1px solid #1f1f1f; border-radius:4px; color:#f0ede8; font-family:'Outfit',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.25s; }
        .btn-hero-secondary:hover { border-color:#4a4743; background:rgba(255,255,255,0.02); }
        .hero-trust { display:flex; align-items:center; gap:32px; }
        .trust-item { display:flex; flex-direction:column; gap:2px; }
        .trust-value { font-family:'Space Mono',monospace; font-size:22px; font-weight:700; color:#f0ede8; }
        .trust-value .accent { color:#00e87a; }
        .trust-label { font-size:11px; color:#4a4743; letter-spacing:0.08em; text-transform:uppercase; }
        .trust-divider { width:1px; height:36px; background:#1f1f1f; flex-shrink:0; }
        .hero-right { position:relative; }
        .float-badge { position:absolute; top:-16px; right:-16px; background:linear-gradient(135deg,#0d0d0d,#111); border:1px solid #1f1f1f; border-radius:12px; padding:14px 18px; box-shadow:0 20px 40px rgba(0,0,0,0.5); z-index:10; }
        .float-badge-value { font-family:'Space Mono',monospace; font-size:20px; font-weight:700; color:#00e87a; }
        .float-badge-label { font-size:10px; color:#4a4743; text-transform:uppercase; letter-spacing:0.1em; }
        .dashboard-mockup { background:#0d0d0d; border:1px solid #1f1f1f; border-radius:16px; overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,0.6); transform:perspective(1000px) rotateY(-5deg) rotateX(2deg); transition:transform 0.5s ease; }
        .dashboard-mockup:hover { transform:perspective(1000px) rotateY(-2deg) rotateX(1deg); }
        .mockup-bar { background:#0a0a0a; border-bottom:1px solid #161616; padding:12px 16px; display:flex; align-items:center; gap:8px; }
        .mockup-url { flex:1; background:#161616; border-radius:4px; padding:4px 12px; font-size:11px; color:#4a4743; margin:0 8px; font-family:'Space Mono',monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .mockup-body { padding:20px; display:flex; flex-direction:column; gap:14px; }
        .mockup-section-header { font-family:'Space Mono',monospace; font-size:11px; color:#4a4743; text-transform:uppercase; letter-spacing:0.1em; }
        .mockup-stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .mockup-stat-card { background:#0a0a0a; border:1px solid #161616; border-radius:8px; padding:12px; }
        .mockup-stat-lbl { font-size:9px; color:#4a4743; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px; }
        .mockup-stat-val { font-family:'Space Mono',monospace; font-size:16px; font-weight:700; }
        .mockup-chart-area { background:#0a0a0a; border:1px solid #161616; border-radius:8px; padding:14px; height:100px; }
        .mockup-active-cycle { background:#0a0a0a; border:1px solid rgba(0,232,122,0.2); border-radius:8px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; }
        .cycle-active-badge { font-size:9px; font-weight:700; padding:3px 8px; background:rgba(0,232,122,0.1); color:#00e87a; border-radius:20px; text-transform:uppercase; letter-spacing:0.08em; }
        .mockup-progress-bar { height:3px; background:#1f1f1f; border-radius:2px; overflow:hidden; margin-top:8px; }
        .mockup-progress-fill { height:100%; width:65%; background:linear-gradient(90deg,#00e87a,#00ccff); border-radius:2px; }
        .stats-bar { border-top:1px solid #161616; border-bottom:1px solid #161616; background:#070707; padding:28px 60px; }
        .stats-bar-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); }
        .stats-bar-item { padding:0 40px; border-right:1px solid #161616; text-align:center; }
        .stats-bar-item:first-child { padding-left:0; }
        .stats-bar-item:last-child { border-right:none; padding-right:0; }
        .stats-bar-value { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:400; letter-spacing:-0.02em; margin-bottom:4px; }
        .stats-bar-value .accent { color:#00e87a; }
        .stats-bar-label { font-size:12px; color:#4a4743; letter-spacing:0.1em; text-transform:uppercase; }
        .lp-section { padding:120px 60px; max-width:1200px; margin:0 auto; }
        .section-tag { font-size:11px; font-weight:600; color:#00e87a; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:16px; }
        .section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,4vw,56px); font-weight:300; line-height:1.15; margin-bottom:16px; }
        .section-title em { font-style:italic; color:#00e87a; }
        .section-sub { font-size:16px; color:#8a8680; max-width:540px; line-height:1.7; font-weight:300; }
        .why-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:#161616; border:1px solid #161616; border-radius:16px; overflow:hidden; margin-top:64px; }
        .why-card { background:#0d0d0d; padding:40px 36px; transition:background 0.2s; }
        .why-card:hover { background:#101010; }
        .why-icon { width:44px; height:44px; background:rgba(0,232,122,0.07); border:1px solid rgba(0,232,122,0.15); border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; font-size:20px; }
        .why-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:500; margin-bottom:10px; line-height:1.3; color:#f0ede8; }
        .why-text { font-size:14px; color:#8a8680; line-height:1.7; font-weight:300; }
        .how-section { padding:120px 60px; background:#070707; border-top:1px solid #161616; border-bottom:1px solid #161616; }
        .how-inner { max-width:1200px; margin:0 auto; }
        .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); margin-top:64px; position:relative; }
        .steps-grid::before { content:''; position:absolute; top:32px; left:calc(16.666% + 16px); right:calc(16.666% + 16px); height:1px; background:linear-gradient(90deg,#00e87a,#1f1f1f,#00e87a); opacity:0.3; }
        .step-item { padding:0 40px; text-align:center; }
        .step-num { width:64px; height:64px; border-radius:50%; background:#0a0a0a; border:1px solid #1f1f1f; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-family:'Space Mono',monospace; font-size:18px; font-weight:700; color:#00e87a; position:relative; z-index:1; }
        .step-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:500; margin-bottom:10px; color:#f0ede8; }
        .step-text { font-size:14px; color:#8a8680; line-height:1.7; font-weight:300; }
        .features-section { padding:120px 60px; max-width:1200px; margin:0 auto; }
        .features-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; margin-top:80px; }
        .features-list { display:flex; flex-direction:column; gap:24px; }
        .feature-item { display:flex; gap:20px; padding:24px; background:#0d0d0d; border:1px solid #161616; border-radius:12px; transition:border-color 0.2s; }
        .feature-item:hover { border-color:rgba(0,232,122,0.2); }
        .feature-icon-box { font-size:22px; flex-shrink:0; margin-top:2px; }
        .feature-title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:500; margin-bottom:6px; color:#f0ede8; }
        .feature-text { font-size:13px; color:#8a8680; line-height:1.6; font-weight:300; }
        .platform-preview { background:#0d0d0d; border:1px solid #1f1f1f; border-radius:16px; overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,0.5); }
        .preview-header { background:#0a0a0a; border-bottom:1px solid #161616; padding:16px 20px; display:flex; align-items:center; gap:8px; }
        .preview-title { font-family:'Space Mono',monospace; font-size:11px; color:#4a4743; flex:1; text-align:center; text-transform:uppercase; letter-spacing:0.1em; }
        .preview-body { padding:24px; }
        .mini-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
        .mini-stat { background:#0a0a0a; border:1px solid #161616; border-radius:8px; padding:14px; }
        .mini-stat-label { font-size:9px; color:#4a4743; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px; }
        .mini-stat-value { font-family:'Space Mono',monospace; font-size:18px; font-weight:700; }
        .withdraw-preview { background:#0a0a0a; border:1px solid #161616; border-radius:8px; padding:16px; margin-bottom:16px; }
        .withdraw-preview-title { font-size:10px; color:#4a4743; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; }
        .withdraw-row { display:flex; justify-content:space-between; font-size:12px; padding:4px 0; color:#8a8680; }
        .withdraw-row.total-row { border-top:1px solid #1f1f1f; margin-top:8px; padding-top:10px; font-weight:600; color:#00e87a; font-family:'Space Mono',monospace; font-size:14px; }
        .cycle-preview-box { background:#0a0a0a; border:1px solid rgba(0,232,122,0.15); border-radius:8px; padding:14px; }
        .cycle-preview-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .cycle-preview-lbl { font-size:9px; color:#4a4743; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px; }
        .cycle-preview-val { font-family:'Space Mono',monospace; font-size:16px; font-weight:700; color:#00e87a; }
        .cycle-preview-badge { font-size:9px; font-weight:700; padding:3px 8px; background:rgba(0,232,122,0.1); color:#00e87a; border-radius:20px; text-transform:uppercase; letter-spacing:0.08em; }
        .cycle-preview-progress-info { font-size:11px; color:#4a4743; display:flex; justify-content:space-between; margin-bottom:8px; }
        .progress-track { height:4px; background:#1f1f1f; border-radius:2px; overflow:hidden; }
        .progress-bar-fill { height:100%; background:linear-gradient(90deg,#00e87a,#00ccff); border-radius:2px; }
        .testimonials-section { padding:120px 60px; background:#070707; border-top:1px solid #161616; border-bottom:1px solid #161616; }
        .testimonials-inner { max-width:1200px; margin:0 auto; }
        .testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:64px; }
        .testimonial { background:#0d0d0d; border:1px solid #161616; border-radius:12px; padding:32px; transition:border-color 0.2s; }
        .testimonial:hover { border-color:#1f1f1f; }
        .testimonial-stars { color:#e8c76a; font-size:14px; letter-spacing:2px; margin-bottom:16px; }
        .testimonial-text { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:300; font-style:italic; color:#f0ede8; line-height:1.6; margin-bottom:20px; }
        .testimonial-author { font-size:12px; color:#4a4743; text-transform:uppercase; letter-spacing:0.1em; }
        .cta-section { padding:160px 60px; text-align:center; position:relative; overflow:hidden; }
        .cta-bg { position:absolute; inset:0; background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(0,232,122,0.04) 0%,transparent 60%); }
        .cta-inner { position:relative; z-index:1; max-width:700px; margin:0 auto; }
        .cta-title { font-family:'Cormorant Garamond',serif; font-size:clamp(42px,5vw,64px); font-weight:300; line-height:1.15; margin-bottom:20px; }
        .cta-title em { font-style:italic; color:#00e87a; }
        .cta-sub { font-size:17px; color:#8a8680; font-weight:300; line-height:1.7; margin-bottom:40px; }
        .cta-steps { display:flex; justify-content:center; gap:48px; margin-bottom:48px; }
        .cta-step { display:flex; flex-direction:column; align-items:center; gap:8px; }
        .cta-step-num { width:36px; height:36px; border-radius:50%; border:1px solid rgba(0,232,122,0.3); display:flex; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-size:13px; color:#00e87a; }
        .cta-step-label { font-size:12px; color:#8a8680; text-align:center; max-width:80px; line-height:1.4; }
        .btn-cta { display:inline-block; padding:16px 48px; background:#00e87a; border:none; border-radius:4px; color:#000; font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.25s; letter-spacing:0.04em; }
        .btn-cta:hover { background:#00c268; box-shadow:0 16px 60px rgba(0,232,122,0.15); transform:translateY(-2px); }
        .landing-footer { border-top:1px solid #161616; padding:60px; background:#030303; }
        .footer-inner { max-width:1200px; margin:0 auto; }
        .footer-top { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:60px; padding-bottom:48px; border-bottom:1px solid #161616; margin-bottom:32px; }
        .footer-brand-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:500; margin-bottom:12px; }
        .footer-brand-name span { color:#00e87a; }
        .footer-brand-desc { font-size:13px; color:#4a4743; line-height:1.7; max-width:260px; margin-bottom:20px; }
        .footer-col-title { font-size:11px; font-weight:600; color:#8a8680; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:16px; }
        .footer-links-list { list-style:none; display:flex; flex-direction:column; gap:10px; padding:0; margin:0; }
        .footer-links-list a { font-size:13px; color:#4a4743; transition:color 0.15s; }
        .footer-links-list a:hover { color:#8a8680; }
        .footer-bottom { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#4a4743; }
        .footer-social { display:flex; gap:20px; }
        .footer-social a { color:#4a4743; transition:color 0.15s; font-size:12px; }
        .footer-social a:hover { color:#8a8680; }
        .footer-disclaimer { font-size:11px; color:#4a4743; line-height:1.6; margin-top:24px; padding-top:24px; border-top:1px solid #161616; opacity:0.7; }
        .fade-up { opacity:0; transform:translateY(30px); transition:opacity 0.7s ease,transform 0.7s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .fade-up-delay-1 { transition-delay:0.1s; }
        .fade-up-delay-2 { transition-delay:0.2s; }
        .fade-up-delay-3 { transition-delay:0.3s; }
        .fade-up-delay-4 { transition-delay:0.4s; }
        @media(max-width:900px){
          .landing-nav{padding:0 24px;}
          .nav-links{display:none;}
          .hero-content{grid-template-columns:1fr;padding:40px 24px 60px;gap:48px;}
          .hero-right{display:none;}
          .stats-bar{padding:24px;}
          .stats-bar-inner{grid-template-columns:1fr 1fr;gap:24px;}
          .stats-bar-item{border-right:none;padding:0;}
          .lp-section{padding:60px 24px;}
          .why-grid{grid-template-columns:1fr;}
          .how-section{padding:60px 24px;}
          .steps-grid{grid-template-columns:1fr;gap:40px;}
          .steps-grid::before{display:none;}
          .features-section{padding:60px 24px;}
          .features-grid{grid-template-columns:1fr;gap:40px;}
          .testimonials-section{padding:60px 24px;}
          .testimonials-grid{grid-template-columns:1fr;}
          .cta-section{padding:80px 24px;}
          .cta-steps{gap:24px;}
          .landing-footer{padding:40px 24px;}
          .footer-top{grid-template-columns:1fr 1fr;gap:32px;}
        }
      `}</style>

      <div className="landing-page">

        {/* NAVBAR */}
        <nav className="landing-nav">
          <div className="nav-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 28,10 28,22 16,30 4,22 4,10" fill="none" stroke="#00e87a" strokeWidth="1.5"/>
              <polygon points="16,2 28,10 16,16 4,10" fill="#00e87a" opacity="0.9"/>
              <polygon points="4,10 16,16 4,22" fill="#00c268" opacity="0.7"/>
              <polygon points="28,10 16,16 28,22" fill="#00c268" opacity="0.7"/>
              <polygon points="16,16 4,22 16,30 28,22" fill="#00e87a" opacity="0.45"/>
            </svg>
            <span className="nav-logo-text">Capital<span>Invest</span></span>
          </div>
          <ul className="nav-links">
            <li><a onClick={() => document.getElementById('why').scrollIntoView({behavior:'smooth'})}>Why Us</a></li>
            <li><a onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})}>How It Works</a></li>
            <li><a onClick={() => document.getElementById('platform').scrollIntoView({behavior:'smooth'})}>Platform</a></li>
            <li><a onClick={() => document.getElementById('testimonials').scrollIntoView({behavior:'smooth'})}>Reviews</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn-nav-login" onClick={() => router.push('/login')}>Log In</button>
            <button className="btn-nav-signup" onClick={() => router.push('/register')}>Get Started</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg"></div>
          <div className="hero-grid"></div>
          <div className="hero-content">
            <div className="hero-left">
              <div className="hero-tag fade-up">Private Investment Management</div>
              <h1 className="hero-title fade-up fade-up-delay-1">
                Grow your wealth with <em>disciplined</em> 30-day cycles
              </h1>
              <p className="hero-sub fade-up fade-up-delay-2">
                Capital Invest is a private capital management platform where your funds are actively managed in structured 30-day investment cycles. Full transparency, real results, no surprises.
              </p>
              <div className="hero-actions fade-up fade-up-delay-3">
                <button className="btn-hero-primary" onClick={() => router.push('/register')}>Open an Account</button>
                <button className="btn-hero-secondary" onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})}>How It Works</button>
              </div>
              <div className="hero-trust fade-up fade-up-delay-4">
                <div className="trust-item">
                  <div className="trust-value">30<span className="accent">d</span></div>
                  <div className="trust-label">Cycle Duration</div>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <div className="trust-value">0.5<span className="accent">%</span></div>
                  <div className="trust-label">Withdrawal Fee</div>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <div className="trust-value">100<span className="accent">%</span></div>
                  <div className="trust-label">Transparent</div>
                </div>
              </div>
            </div>

            <div className="hero-right fade-up fade-up-delay-2">
              <div className="float-badge">
                <div className="float-badge-value">+8.5%</div>
                <div className="float-badge-label">Last Cycle</div>
              </div>
              <div className="dashboard-mockup">
                <div className="mockup-bar">
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#ff5f57',flexShrink:0}}></div>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#ffbd2e',flexShrink:0}}></div>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#28c840',flexShrink:0}}></div>
                  <div className="mockup-url">capitalinvest.com/investor/dashboard</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-section-header">Investor Dashboard</div>
                  <div className="mockup-stats-grid">
                    <div className="mockup-stat-card"><div className="mockup-stat-lbl">Balance</div><div className="mockup-stat-val" style={{color:'#00e87a'}}>$12,850</div></div>
                    <div className="mockup-stat-card"><div className="mockup-stat-lbl">Profit</div><div className="mockup-stat-val" style={{color:'#00e87a'}}>+$2,850</div></div>
                    <div className="mockup-stat-card"><div className="mockup-stat-lbl">Cycles</div><div className="mockup-stat-val" style={{color:'#f0ede8'}}>4</div></div>
                  </div>
                  <div className="mockup-chart-area">
                    <svg viewBox="0 0 300 72" preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00e87a" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#00e87a" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M 0,60 L 60,45 L 120,33 L 180,37 L 240,20 L 300,10 L 300,72 L 0,72 Z" fill="url(#chartGrad)"/>
                      <path d="M 0,60 L 60,45 L 120,33 L 180,37 L 240,20 L 300,10" fill="none" stroke="#00e87a" strokeWidth="2"/>
                      <line x1="0" y1="36" x2="300" y2="36" stroke="#1a1a1a" strokeWidth="1"/>
                    </svg>
                  </div>
                  <div className="mockup-active-cycle">
                    <div>
                      <div style={{fontSize:'9px',color:'#4a4743',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'4px'}}>Active Cycle</div>
                      <div style={{fontFamily:'Space Mono,monospace',fontSize:'16px',fontWeight:'700',color:'#00e87a'}}>$12,850.00</div>
                      <div className="mockup-progress-bar"><div className="mockup-progress-fill"></div></div>
                    </div>
                    <div className="cycle-active-badge">● Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <div className="stats-bar">
          <div className="stats-bar-inner">
            {[
              {val:'30', suffix:'d', label:'Per Investment Cycle'},
              {val:'24h', suffix:'', label:'Withdrawal Processing'},
              {val:'100', suffix:'%', label:'Result Transparency'},
              {val:'0.5', suffix:'%', label:'Only Fee on Withdrawal'},
            ].map((s,i) => (
              <div key={i} className={`stats-bar-item fade-up fade-up-delay-${i}`}>
                <div className="stats-bar-value">{s.val}<span className="accent">{s.suffix}</span></div>
                <div className="stats-bar-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WHY US */}
        <section id="why">
          <div className="lp-section">
            <div className="section-tag fade-up">Why Capital Invest</div>
            <h2 className="section-title fade-up fade-up-delay-1">Built for <em>serious</em> investors</h2>
            <p className="section-sub fade-up fade-up-delay-2">We believe private capital management should be transparent, structured, and results-driven. No hidden fees. No vague promises.</p>
            <div className="why-grid">
              {[
                {icon:'◈', title:'Structured 30-Day Cycles', text:'Every investment follows a clear 30-day cycle. You know exactly when it starts, when it ends, and what the result was. No ambiguity, no delays.'},
                {icon:'⟳', title:'Real-Time Dashboard', text:'Monitor your balance, track cycle progress, view your full history and performance chart — all in one clean, intuitive platform.'},
                {icon:'↗', title:'Flexible Withdrawals', text:'Request a withdrawal at the end of any cycle. Transparent 0.5% fee and fast processing — your funds are always accessible when you need them.'},
                {icon:'◉', title:'Full Transparency', text:'Every cycle result is recorded and visible. Your balance reflects real outcomes — every profit and every loss, exactly as it happened.'},
                {icon:'⬡', title:'Secure & Private', text:'Your account is protected with JWT authentication and encrypted communications. Your investment data stays private and secure.'},
                {icon:'✦', title:'Dedicated Management', text:'Each account is personally managed. Your capital is never pooled with others. Individual attention and precise reporting.'},
              ].map((item, i) => (
                <div key={i} className={`why-card fade-up ${i%3===1?'fade-up-delay-1':i%3===2?'fade-up-delay-2':''}`}>
                  <div className="why-icon">{item.icon}</div>
                  <div className="why-title">{item.title}</div>
                  <div className="why-text">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="how-section">
          <div className="how-inner">
            <div className="section-tag fade-up">The Process</div>
            <h2 className="section-title fade-up fade-up-delay-1">How it <em>works</em></h2>
            <p className="section-sub fade-up fade-up-delay-2">Three simple steps from registration to growing your capital.</p>
            <div className="steps-grid">
              {[
                {n:'01', title:'Create Your Account', text:'Register on our platform and contact us to activate your investment account. We set up your initial deposit and get you onboarded within 24 hours.'},
                {n:'02', title:'Start Your First Cycle', text:'Our team starts a 30-day investment cycle with your capital. Track progress in real-time from your personal dashboard at any time.'},
                {n:'03', title:'Grow & Withdraw', text:'At cycle end, results are recorded and your balance updated instantly. Reinvest for another cycle or request a withdrawal — your choice.'},
              ].map((s, i) => (
                <div key={i} className={`step-item fade-up ${i===1?'fade-up-delay-2':i===2?'fade-up-delay-4':''}`}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section id="platform" className="features-section">
          <div className="section-tag fade-up">The Platform</div>
          <h2 className="section-title fade-up fade-up-delay-1">Everything you need, <em>nothing you don&apos;t</em></h2>
          <p className="section-sub fade-up fade-up-delay-2">A clean, powerful dashboard built specifically for private investment management.</p>
          <div className="features-grid">
            <div className="features-list">
              {[
                {icon:'📊', title:'Performance Chart', text:'Visual profit and loss chart across all completed cycles. See your growth trajectory at a glance.'},
                {icon:'⏱', title:'Live Cycle Tracker', text:'Real-time progress bar showing exactly where you are in your 30-day cycle. Days remaining, amount invested, dates.'},
                {icon:'💸', title:'Withdrawal Calculator', text:'See your net payout before you request — fee is calculated live so you always know exactly what you will receive.'},
                {icon:'📋', title:'Full Cycle History', text:'Every investment cycle — amount, result, profit/loss, dates — all in one clean table. Complete audit trail.'},
              ].map((f, i) => (
                <div key={i} className={`feature-item fade-up fade-up-delay-${i}`}>
                  <div className="feature-icon-box">{f.icon}</div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-text">{f.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="platform-preview fade-up fade-up-delay-2">
              <div className="preview-header">
                <div style={{width:10,height:10,borderRadius:'50%',background:'#ff5f57',flexShrink:0}}></div>
                <div style={{width:10,height:10,borderRadius:'50%',background:'#ffbd2e',flexShrink:0}}></div>
                <div style={{width:10,height:10,borderRadius:'50%',background:'#28c840',flexShrink:0}}></div>
                <div className="preview-title">Investor Portal</div>
              </div>
              <div className="preview-body">
                <div className="mini-stats-grid">
                  <div className="mini-stat"><div className="mini-stat-label">Balance</div><div className="mini-stat-value" style={{color:'#00e87a'}}>$12,850</div></div>
                  <div className="mini-stat"><div className="mini-stat-label">Total Profit</div><div className="mini-stat-value" style={{color:'#00e87a'}}>+$2,850</div></div>
                  <div className="mini-stat"><div className="mini-stat-label">Initial Deposit</div><div className="mini-stat-value" style={{color:'#8a8680'}}>$10,000</div></div>
                  <div className="mini-stat"><div className="mini-stat-label">Cycles Done</div><div className="mini-stat-value" style={{color:'#f0ede8'}}>4</div></div>
                </div>
                <div className="withdraw-preview">
                  <div className="withdraw-preview-title">Withdrawal Preview</div>
                  <div className="withdraw-row"><span>Gross Amount</span><span style={{fontFamily:'Space Mono,monospace'}}>$1,000.00</span></div>
                  <div className="withdraw-row"><span style={{color:'#ff6b6b'}}>Fee (0.5%)</span><span style={{fontFamily:'Space Mono,monospace',color:'#ff6b6b'}}>−$5.00</span></div>
                  <div className="withdraw-row total-row"><span>You Receive</span><span>$995.00</span></div>
                </div>
                <div className="cycle-preview-box">
                  <div className="cycle-preview-top">
                    <div>
                      <div className="cycle-preview-lbl">Active Cycle</div>
                      <div className="cycle-preview-val">$12,850.00</div>
                    </div>
                    <div className="cycle-preview-badge">● Active</div>
                  </div>
                  <div className="cycle-preview-progress-info">
                    <span>Progress</span><span>72% — 8 days left</span>
                  </div>
                  <div className="progress-track"><div className="progress-bar-fill" style={{width:'72%'}}></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="testimonials-section">
          <div className="testimonials-inner">
            <div className="section-tag fade-up">Investor Reviews</div>
            <h2 className="section-title fade-up fade-up-delay-1">What our investors <em>say</em></h2>
            <div className="testimonials-grid">
              {[
                {text:'"The dashboard is incredibly clear. I can see exactly what\'s happening with my capital at any time. The 30-day cycle structure gives me peace of mind."', author:'M.D. — Private Investor'},
                {text:'"I appreciate the full transparency. Every cycle result is recorded and visible on my account. No surprises, no hidden fees — exactly what I was looking for."', author:'J.S. — Business Owner'},
                {text:'"The withdrawal process is seamless. I requested a withdrawal after my third cycle and it was processed within 24 hours. Very professional operation."', author:'A.K. — Entrepreneur'},
              ].map((t, i) => (
                <div key={i} className={`testimonial fade-up fade-up-delay-${i}`}>
                  <div className="testimonial-stars">★★★★★</div>
                  <div className="testimonial-text">{t.text}</div>
                  <div className="testimonial-author">{t.author}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-bg"></div>
          <div className="cta-inner">
            <div className="section-tag fade-up" style={{textAlign:'center'}}>Start Today</div>
            <h2 className="cta-title fade-up fade-up-delay-1">Ready to grow your <em>capital?</em></h2>
            <p className="cta-sub fade-up fade-up-delay-2">Join Capital Invest and start your first 30-day investment cycle. Full transparency, structured returns, professional management.</p>
            <div className="cta-steps fade-up fade-up-delay-3">
              {['Create Account','Make Your Deposit','Start Investing'].map((label, i) => (
                <div key={i} className="cta-step">
                  <div className="cta-step-num">{i+1}</div>
                  <div className="cta-step-label">{label}</div>
                </div>
              ))}
            </div>
            <button className="btn-cta fade-up fade-up-delay-4" onClick={() => router.push('/register')}>
              Open Your Account
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer">
          <div className="footer-inner">
            <div className="footer-top">
              <div>
                <div className="footer-brand-name">Capital<span>Invest</span></div>
                <div className="footer-brand-desc">Private capital management through structured 30-day investment cycles. Transparent, professional, results-driven.</div>
                <div style={{fontSize:'12px',color:'#4a4743'}}>contact@capitalinvest.com</div>
              </div>
              <div>
                <div className="footer-col-title">Platform</div>
                <ul className="footer-links-list">
                  <li><a href="/login">Log In</a></li>
                  <li><a href="/register">Register</a></li>
                  <li><a onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})} style={{cursor:'pointer'}}>How It Works</a></li>
                  <li><a onClick={() => document.getElementById('platform').scrollIntoView({behavior:'smooth'})} style={{cursor:'pointer'}}>Dashboard</a></li>
                </ul>
              </div>
              <div>
                <div className="footer-col-title">Investment</div>
                <ul className="footer-links-list">
                  <li><a onClick={() => document.getElementById('why').scrollIntoView({behavior:'smooth'})} style={{cursor:'pointer'}}>Why Capital Invest</a></li>
                  <li><a onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})} style={{cursor:'pointer'}}>30-Day Cycles</a></li>
                  <li><a onClick={() => document.getElementById('platform').scrollIntoView({behavior:'smooth'})} style={{cursor:'pointer'}}>Withdrawals</a></li>
                  <li><a onClick={() => document.getElementById('testimonials').scrollIntoView({behavior:'smooth'})} style={{cursor:'pointer'}}>Reviews</a></li>
                </ul>
              </div>
              <div>
                <div className="footer-col-title">Legal</div>
                <ul className="footer-links-list">
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Risk Disclosure</a></li>
                  <li><a href="#">Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <div>© 2025 Capital Invest. All rights reserved.</div>
              <div className="footer-social">
                <a href="#">Twitter</a>
                <a href="#">LinkedIn</a>
                <a href="#">Instagram</a>
              </div>
            </div>
            <div className="footer-disclaimer">
              Capital Invest is a private investment management service. Past performance is not indicative of future results. All investments carry risk. The value of your investment may go down as well as up. Please ensure you understand the risks involved before investing.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
