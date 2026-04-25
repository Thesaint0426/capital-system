import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const investorNav = [
  { href: '/investor/dashboard', icon: '◈', label: 'Dashboard' },
  { href: '/investor/cycles', icon: '⟳', label: 'Cycles' },
  { href: '/investor/withdraw', icon: '↗', label: 'Withdraw' },
];

const adminNav = [
  { href: '/admin', icon: '◈', label: 'Overview' },
  { href: '/admin/users', icon: '◉', label: 'Investors' },
  { href: '/admin/cycles', icon: '⟳', label: 'Cycles' },
  { href: '/admin/withdrawals', icon: '↗', label: 'Withdrawals' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const nav = user?.role === 'admin' ? adminNav : investorNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">CAPITAL</div>
        <div className="logo-sub">{user?.role === 'admin' ? 'Admin Panel' : 'Investor Portal'}</div>
      </div>

      <nav style={{ flex: 1 }}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ padding: '0 24px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{user?.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>{user?.email}</div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={logout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
