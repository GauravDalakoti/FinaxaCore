import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@finance.com', password: 'Admin@123' },
      analyst: { email: 'analyst@finance.com', password: 'Analyst@123' },
      viewer: { email: 'viewer@finance.com', password: 'Viewer@123' },
    };
    setForm(creds[role]);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0,212,255,0.05)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.05)' }} />
      </div>

      <div className="w-full max-w-md relative">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)' }}>
            <TrendingUp size={26} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>FinaxaCore</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Finance Dashboard System</p>
        </div>

        <div className="card p-7 animate-slide-up">
          <h2 className="section-title mb-1">Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}>
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>
          {/*
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>Demo accounts — click to fill</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin', label: 'Admin', color: '#00d4ff' },
                { role: 'analyst', label: 'Analyst', color: '#8b5cf6' },
                { role: 'viewer', label: 'Viewer', color: '#f59e0b' },
              ].map(({ role, label, color }) => (
                <button key={role} type="button" onClick={() => fillDemo(role)}
                  className="py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                  onMouseEnter={e => e.target.style.borderColor = color}
                  onMouseLeave={e => e.target.style.borderColor = `${color}30`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
*/}
          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-cyan)' }} className="font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}