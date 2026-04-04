import { useState } from 'react';
import { User, Lock, Save, CheckCircle, AlertCircle, Shield, Eye, EyeOff, Calendar, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { formatDateTime } from '../utils/helpers.js';

const roleBadge = { admin: 'badge-admin', analyst: 'badge-analyst', viewer: 'badge-viewer' };
const roleDesc = {
  admin: 'Full system access — manage records, users, and all settings.',
  analyst: 'Read access to records plus advanced analytics and insights.',
  viewer: 'View-only access to dashboard and financial records.',
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      await updateProfile({ name: profileForm.name });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const Alert = ({ msg }) => {
    if (!msg) return null;
    const isSuccess = msg.type === 'success';
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg text-sm`}
        style={{
          background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
          border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
          color: isSuccess ? '#10b981' : '#f43f5e',
        }}>
        {isSuccess ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        {msg.text}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account information and security</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.25)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-semibold text-lg truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Mail size={12} /> {user?.email}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`badge ${roleBadge[user?.role]}`}>
                <Shield size={10} /> {user?.role}
              </span>
              <span className="badge badge-active">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                active
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Role Description</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{roleDesc[user?.role]}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={11} /> Member Since
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>
              {user?.createdAt ? formatDateTime(user.createdAt) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
            <User size={15} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h2 className="section-title">Edit Profile</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input-field"
              placeholder="Your full name"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div>
            <label className="label">Email Address <span style={{ color: 'var(--text-muted)', textTransform: 'none' }}>(read-only)</span></label>
            <input className="input-field opacity-60 cursor-not-allowed" value={user?.email} readOnly />
          </div>

          <Alert msg={profileMsg} />

          <button type="submit" className="btn-primary" disabled={profileLoading}>
            {profileLoading
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <><Save size={15} />Save Changes</>}
          </button>
        </form>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <Lock size={15} style={{ color: 'var(--accent-violet)' }} />
          </div>
          <h2 className="section-title">Change Password</h2>
        </div>

        <form onSubmit={handlePwSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Enter current password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              className="input-field"
              placeholder="Min. 6 characters"
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              className="input-field"
              placeholder="Repeat new password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
            />
          </div>

          {pwForm.newPassword && (
            <div className="space-y-1">
              {[
                { label: 'At least 6 characters', ok: pwForm.newPassword.length >= 6 },
                { label: 'Passwords match', ok: pwForm.newPassword === pwForm.confirmPassword && pwForm.confirmPassword.length > 0 },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className={ok ? 'text-emerald-400' : 'text-rose-400'}>
                    {ok ? '✓' : '✗'}
                  </span>
                  <span style={{ color: ok ? '#10b981' : 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          <Alert msg={pwMsg} />

          <button type="submit" className="btn-primary" disabled={pwLoading}>
            {pwLoading
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <><Lock size={15} />Update Password</>}
          </button>
        </form>
      </div>

      <div className="card p-5" style={{ borderColor: 'rgba(244,63,94,0.2)' }}>
        <h2 className="section-title mb-2" style={{ color: '#f43f5e' }}>Account Info</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          To request account deletion or role changes, please contact your system administrator.
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }} className="mb-1">Account ID</p>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', fontSize: '11px' }} className="truncate">{user?._id}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }} className="mb-1">Last Login</p>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>
              {user?.lastLogin ? formatDateTime(user.lastLogin) : 'This session'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}