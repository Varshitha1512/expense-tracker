import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/',             label: 'Dashboard' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/categories',   label: 'Categories' },
  ];

  return (
    <nav style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>
            💸 Spendly
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem',
                color: location.pathname === l.to ? 'var(--accent)' : 'var(--muted)',
                background: location.pathname === l.to ? 'rgba(124,106,255,0.1)' : 'transparent',
                fontWeight: location.pathname === l.to ? 600 : 400,
              }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Hi, {user?.name}</span>
          <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
