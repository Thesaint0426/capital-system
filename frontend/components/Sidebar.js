import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const investorNav = [
  { href: '/investor/dashboard', icon: '◈', label: 'Dashboard' },
  { href: '/investor/cycles', icon: '⟳', label: 'My Cycles' },
  { href: '/investor/withdraw', icon: '↗', label: 'Withdraw' },
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
  const nav = user?.role === 'admin' ? adminNav : investorNav;
  const isAdmin = user?.role === 'admin';

  return (
    <aside style={{
      width: 220,
      background: '#0c0c0c',
      borderRight: '1px solid #1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      height: '100vh',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #1e1e1e' }}>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f5f3ef' }}>
          Capital<span style={{ color: '#00e87a' }}>Invest</span>
        </div>
        <div style={{ fontSize: 10, color: '#3a3734', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
          {isAdmin ? 'Admin Console' : 'Member Portal'}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <div style={{ padding: '12px 20px 4px', fontSize: 9, fontWeight: 700, color: '#3a3734', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {isAdmin ? 'Management' : 'Account'}
        </div>
        {nav.map(item => {
          const active = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 500,
              color: active ? '#00e87a' : '#524f4b',
              borderLeft: `2px solid ${active ? '#00e87a' : 'transparent'}`,
              background: active ? 'rgba(0,232,122,0.06)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            }}>
              <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #1e1e1e' }}>
        <div style={{
          display: 'inline-flex',
          padding: '2px 8px',
          borderRadius: 20,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 8,
          background: isAdmin ? 'rgba(0,232,122,0.08)' : 'rgba(62,207,142,0.06)',
          color: isAdmin ? '#00e87a' : '#3ecf8e',
          border: `1px solid ${isAdmin ? 'rgba(0,232,122,0.15)' : 'rgba(62,207,142,0.12)'}`,
        }}>
          {isAdmin ? 'Admin' : 'Member'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f3ef', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.name}
        </div>
        <div style={{ fontSize: 11, color: '#3a3734', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.email}
        </div>
        <button onClick={logout} style={{
          width: '100%',
          padding: '7px 12px',
          background: 'transparent',
          border: '1px solid #1e1e1e',
          borderRadius: 6,
          color: '#524f4b',
          fontFamily: 'Manrope, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s',
          letterSpacing: '0.04em',
        }}
          onMouseOver={e => { e.target.style.borderColor = '#252525'; e.target.style.color = '#f5f3ef'; }}
          onMouseOut={e => { e.target.style.borderColor = '#1e1e1e'; e.target.style.color = '#524f4b'; }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
