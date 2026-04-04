import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Users, User, LogOut,
  TrendingUp, ChevronRight, Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const roleBadge = { admin: 'badge-admin', analyst: 'badge-analyst', viewer: 'badge-viewer' };

export default function Sidebar({ onClose }) {
  const { user, logout, canManageUsers } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/records', icon: Receipt, label: 'Records' },
    ...(canManageUsers ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)' }}>
          <TrendingUp size={16} className="text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>FinaxaCore</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>v1.0</p>
        </div>
      </div>


      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-3 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} style={{ opacity: 0.4 }} />
          </NavLink>
        ))}
      </nav>


      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="card p-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00d4ff22, #8b5cf622)', color: 'var(--accent-cyan)', border: '1px solid var(--border-light)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Shield size={11} style={{ color: 'var(--text-muted)' }} />
            <span className={`badge ${roleBadge[user?.role]}`}>{user?.role}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-danger w-full justify-center text-xs py-2">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}