import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, Users, Shield, Eye, BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import UserModal from '../components/users/UserModal.jsx';
import ConfirmModal from '../components/records/ConfirmModal.jsx';
import api from '../utils/api.js';
import { formatDateTime } from '../utils/helpers.js';

const LIMIT = 10;

const roleIcon = { admin: Shield, analyst: BarChart2, viewer: Eye };
const roleBadge = { admin: 'badge-admin', analyst: 'badge-analyst', viewer: 'badge-viewer' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId);
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    await api.delete(`/users/${deleteUser._id}`);
    setDeleteUser(null);
    fetchUsers();
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditUser(null);
    fetchUsers();
  };

  const openEdit = (u) => { setEditUser(u); setShowModal(true); };
  const openCreate = () => { setEditUser(null); setShowModal(true); };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Stats
  const adminCount = users.filter(u => u.role === 'admin').length;
  const analystCount = users.filter(u => u.role === 'analyst').length;
  const viewerCount = users.filter(u => u.role === 'viewer').length;
  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{pagination.total} total users</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex-shrink-0">
          <Plus size={16} /> New User
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: pagination.total, color: '#00d4ff', icon: Users },
          { label: 'Admins', value: adminCount, color: '#00d4ff', icon: Shield },
          { label: 'Analysts', value: analystCount, color: '#8b5cf6', icon: BarChart2 },
          { label: 'Active', value: activeCount, color: '#10b981', icon: Eye },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-field pl-9"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input-field w-36" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <select className="input-field w-36" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--accent-cyan)' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-4xl">👥</div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No users found</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(23,32,51,0.5)' }}>
                    {['User', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const RoleIcon = roleIcon[u.role];
                    const isSelf = u._id === currentUser._id;
                    return (
                      <tr key={u._id} className="table-row">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{
                                background: u.status === 'inactive' ? 'rgba(148,163,184,0.1)' : 'rgba(0,212,255,0.1)',
                                color: u.status === 'inactive' ? '#94a3b8' : 'var(--accent-cyan)',
                                border: `1px solid ${u.status === 'inactive' ? 'rgba(148,163,184,0.2)' : 'rgba(0,212,255,0.2)'}`,
                              }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                {u.name}
                                {isSelf && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)', fontSize: '10px' }}>You</span>}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`badge ${roleBadge[u.role]} flex items-center gap-1 w-fit`}>
                            <RoleIcon size={10} />
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`badge ${u.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                            {u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                            {formatDateTime(u.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)}
                              title="Edit user"
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                              <Edit2 size={14} />
                            </button>
                            {!isSelf && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(u._id)}
                                  disabled={togglingId === u._id}
                                  title={u.status === 'active' ? 'Deactivate user' : 'Activate user'}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ color: u.status === 'active' ? '#10b981' : '#94a3b8' }}>
                                  {togglingId === u._id
                                    ? <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                                    : u.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button onClick={() => setDeleteUser(u)}
                                  title="Delete user"
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ color: 'var(--text-muted)' }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {users.map((u) => {
                const RoleIcon = roleIcon[u.role];
                const isSelf = u._id === currentUser._id;
                return (
                  <div key={u._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.2)' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {u.name} {isSelf && <span className="text-xs" style={{ color: 'var(--accent-cyan)' }}>(You)</span>}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
                        <span className={`badge ${u.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{u.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="btn-secondary text-xs py-1.5 flex-1 justify-center">
                        <Edit2 size={12} /> Edit
                      </button>
                      {!isSelf && (
                        <>
                          <button onClick={() => handleToggleStatus(u._id)} disabled={togglingId === u._id}
                            className="btn-secondary text-xs py-1.5 flex-1 justify-center"
                            style={{ color: u.status === 'active' ? '#10b981' : '#94a3b8' }}>
                            {u.status === 'active' ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => setDeleteUser(u)} className="btn-danger text-xs py-1.5 px-3">
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: 'var(--text-secondary)' }}>
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm" style={{ color: 'var(--text-primary)' }}>{page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: 'var(--text-secondary)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <UserModal user={editUser} onClose={() => { setShowModal(false); setEditUser(null); }} onSaved={handleSaved} />
      )}
      {deleteUser && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to permanently delete "${deleteUser.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteUser(null)}
        />
      )}
    </div>
  );
}