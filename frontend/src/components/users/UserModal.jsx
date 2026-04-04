import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api.js';

const EMPTY = { name: '', email: '', password: '', role: 'viewer', status: 'active' };

export default function UserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, password: '', role: user.role, status: user.status });
    } else {
      setForm(EMPTY);
    }
  }, [user]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status };
      if (!user || form.password) payload.password = form.password;
      if (user) {
        await api.put(`/users/${user._id}`, payload);
      } else {
        if (!form.password) { setError('Password is required for new users.'); setLoading(false); return; }
        await api.post('/users', payload);
      }
      onSaved();
    } catch (err) {
      const errData = err.response?.data;
      setError(errData?.errors?.[0]?.message || errData?.message || 'Failed to save user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">{user ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}>
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input-field" placeholder="John Doe" value={form.name} onChange={set('name')} required minLength={2} maxLength={50} />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input-field" placeholder="user@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">
              Password {user && <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontSize: '11px' }}>(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder={user ? 'New password (optional)' : 'Min. 6 characters'}
                value={form.password}
                onChange={set('password')}
                minLength={form.password ? 6 : 0}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role</label>
              <select className="input-field" value={form.role} onChange={set('role')}>
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg text-xs" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {form.role === 'viewer' && <><span style={{ color: 'var(--accent-amber)' }}>Viewer</span><span style={{ color: 'var(--text-muted)' }}> — Can only view dashboard and records. No editing access.</span></>}
            {form.role === 'analyst' && <><span style={{ color: 'var(--accent-violet)' }}>Analyst</span><span style={{ color: 'var(--text-muted)' }}> — Can view records and access advanced analytics & insights.</span></>}
            {form.role === 'admin' && <><span style={{ color: 'var(--accent-cyan)' }}>Admin</span><span style={{ color: 'var(--text-muted)' }}> — Full access: manage records, users, and all system settings.</span></>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Save size={15} />{user ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}