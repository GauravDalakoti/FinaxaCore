import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.05)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0,212,255,0.05)' }} />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)' }}>
            <TrendingUp size={26} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>FinaxaCore</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Create your account</p>
        </div>

        <div className="card p-7 animate-slide-up">
          <h2 className="section-title mb-1">Get started</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>New accounts are created as Viewer role</p>

          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}>
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" placeholder="John Doe" value={form.name} onChange={set('name')} required minLength={2} />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')} required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type={showPw ? 'text' : 'password'} className="input-field" placeholder="Repeat password"
                value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><UserPlus size={16} />Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-cyan)' }} className="font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}