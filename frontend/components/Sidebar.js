import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { useState, useEffect } from 'react';

const investorNav = [
  { href: '/investor/dashboard', icon: '◈', label: 'Investor Interface' },
  { href: '/investor/cycles', icon: '⟳', label: 'My Cycles' },
  { href: '/investor/withdraw', icon: '↗', label: 'Liquidity Request' },
];

const adminNav = [
  { href: '/admin', icon: '◈', label: 'Overview' },
  { href: '/admin/applications', icon: '◉', label: 'Applications' },
  { href: '/admin/members', icon: '▣', label: 'Members' },
  { href: '/admin/cycles', icon: '⟳', label: 'Cycles' },
  { href: '/admin/withdrawals', icon: '↗', label: 'Withdrawals' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const nav = user?.role === 'admin' ? adminNav : investorNav;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [router.pathname]);

  const sidebarVisible = !isMobile || mobileOpen;

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && (
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{
          position:'fixed', top:14, left:14, zIndex:200,
          width:38, height:38, background:'#0c0c0c',
          border:'1px solid #252525', borderRadius:8,
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', gap:5, cursor:'pointer', padding:0,
        }}>
          <span style={{ width:16, height:1.5, background: mobileOpen ? '#00e87a' : '#8b8680', borderRadius:1, transition:'all 0.2s', transform: mobileOpen ? 'rotate(45deg) translate(4px,4px)' : 'none', display:'block' }}></span>
          <span style={{ width:16, height:1.5, background:'#8b8680', borderRadius:1, transition:'all 0.2s', opacity: mobileOpen ? 0 : 1, display:'block' }}></span>
          <span style={{ width:16, height:1.5, background: mobileOpen ? '#00e87a' : '#8b8680', borderRadius:1, transition:'all 0.2s', transform: mobileOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none', display:'block' }}></span>
        </button>
      )}

      {/* Overlay */}
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.65)',
          zIndex:150, backdropFilter:'blur(3px)',
        }} />
      )}

      {/* Sidebar panel */}
      <aside style={{
        width:220, background:'#0c0c0c', borderRight:'1px solid #1e1e1e',
        display:'flex', flexDirection:'column', position:'fixed',
        top:0, left:0, height:'100vh', zIndex:160, flexShrink:0,
        transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: isMobile && mobileOpen ? '4px 0 32px rgba(0,0,0,0.5)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid #1e1e1e', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:600, letterSpacing:'0.05em', color:'#f5f3ef' }}>
              Capital<span style={{ color:'#00e87a' }}>Invest</span>
            </div>
            <div style={{ fontSize:10, color:'#3a3734', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:3 }}>
              {isAdmin ? 'Admin Console' : 'Member Portal'}
            </div>
          </div>
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} style={{ background:'none', border:'none', color:'#524f4b', cursor:'pointer', fontSize:20, padding:'0 4px', lineHeight:1 }}>×</button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 0', overflowY:'auto' }}>
          <div style={{ padding:'12px 20px 4px', fontSize:9, fontWeight:700, color:'#3a3734', letterSpacing:'0.15em', textTransform:'uppercase' }}>
            {isAdmin ? 'Management' : 'Account'}
          </div>
          {nav.map(item => {
            const active = router.pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 20px',
                fontSize:13, fontWeight:500,
                color: active ? '#00e87a' : '#524f4b',
                borderLeft: `2px solid ${active ? '#00e87a' : 'transparent'}`,
                background: active ? 'rgba(0,232,122,0.06)' : 'transparent',
                transition:'all 0.15s', textDecoration:'none',
              }}>
                <span style={{ fontSize:14, width:18, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #1e1e1e' }}>
          <div style={{
            display:'inline-flex', padding:'2px 8px', borderRadius:20,
            fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8,
            background: isAdmin ? 'rgba(200,169,110,0.08)' : 'rgba(0,232,122,0.06)',
            color: isAdmin ? '#c8a96e' : '#00e87a',
            border: `1px solid ${isAdmin ? 'rgba(200,169,110,0.15)' : 'rgba(0,232,122,0.12)'}`,
          }}>{isAdmin ? 'Admin' : 'Member'}</div>
          <div style={{ fontSize:13, fontWeight:600, color:'#f5f3ef', marginBottom:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
          <div style={{ fontSize:11, color:'#3a3734', marginBottom:10, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</div>
          <button onClick={logout} style={{
            width:'100%', padding:'7px 12px', background:'transparent',
            border:'1px solid #1e1e1e', borderRadius:6, color:'#524f4b',
            fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600,
            cursor:'pointer', transition:'all 0.15s',
          }}
            onMouseOver={e => { e.target.style.borderColor='#252525'; e.target.style.color='#f5f3ef'; }}
            onMouseOut={e => { e.target.style.borderColor='#1e1e1e'; e.target.style.color='#524f4b'; }}>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
