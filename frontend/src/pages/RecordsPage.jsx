import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, Edit2, Trash2, RotateCcw,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight,
  SlidersHorizontal, X, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import RecordModal from '../components/records/RecordModal.jsx';
import ConfirmModal from '../components/records/ConfirmModal.jsx';
import api from '../utils/api.js';
import { formatCurrency, formatDate, categoryIcons, CATEGORIES } from '../utils/helpers.js';

const LIMIT = 10;

export default function RecordsPage() {
  const { canManageRecords } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '', type: '', category: '', startDate: '', endDate: '', sortBy: 'date', sortOrder: 'desc',
  });
  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchRecords = useCallback(async (currentPage = 1, activeFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: LIMIT, ...activeFilters });
      [...params.keys()].forEach(k => !params.get(k) && params.delete(k));
      const { data } = await api.get(`/records?${params}`);
      setRecords(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(page, appliedFilters);
  }, [page, appliedFilters, fetchRecords]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
    setShowFilters(false);
  };

  const clearFilters = () => {
    const empty = { search: '', type: '', category: '', startDate: '', endDate: '', sortBy: 'date', sortOrder: 'desc' };
    setFilters(empty);
    setAppliedFilters({});
    setPage(1);
    setShowFilters(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleDelete = async () => {
    await api.delete(`/records/${deleteRecord._id}`);
    setDeleteRecord(null);
    fetchRecords(page, appliedFilters);
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditRecord(null);
    fetchRecords(page, appliedFilters);
  };

  const openEdit = (record) => { setEditRecord(record); setShowModal(true); };
  const openCreate = () => { setEditRecord(null); setShowModal(true); };

  const setF = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  const activeFilterCount = Object.entries(appliedFilters).filter(([k, v]) => v && !['sortBy', 'sortOrder'].includes(k)).length;

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Financial Records</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {pagination.total} total records
          </p>
        </div>
        {canManageRecords && (
          <button onClick={openCreate} className="btn-primary flex-shrink-0">
            <Plus size={16} /> New Record
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-field pl-9 pr-4"
              placeholder="Search title or notes…"
              value={filters.search}
              onChange={setF('search')}
            />
          </form>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary relative ${showFilters ? 'border-cyan-500' : ''}`}
            style={showFilters ? { borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' } : {}}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: 'var(--accent-cyan)', color: '#0a0f1e' }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="btn-secondary text-xs" style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 animate-slide-up" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={filters.type} onChange={setF('type')}>
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={filters.category} onChange={setF('category')}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">From Date</label>
                <input type="date" className="input-field" value={filters.startDate} onChange={setF('startDate')} />
              </div>
              <div>
                <label className="label">To Date</label>
                <input type="date" className="input-field" value={filters.endDate} onChange={setF('endDate')} />
              </div>
              <div>
                <label className="label">Sort By</label>
                <select className="input-field" value={filters.sortBy} onChange={setF('sortBy')}>
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="createdAt">Created</option>
                </select>
              </div>
              <div>
                <label className="label">Order</label>
                <select className="input-field" value={filters.sortOrder} onChange={setF('sortOrder')}>
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={clearFilters} className="btn-secondary text-sm">Reset</button>
              <button onClick={applyFilters} className="btn-primary text-sm">
                <Filter size={14} /> Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--accent-cyan)' }} />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)' }}>📋</div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No records found</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {activeFilterCount > 0 ? 'Try adjusting your filters' : canManageRecords ? 'Create your first record' : 'No records available yet'}
            </p>
            {canManageRecords && activeFilterCount === 0 && (
              <button onClick={openCreate} className="btn-primary mt-2"><Plus size={15} /> New Record</button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(23,32,51,0.5)' }}>
                    {['Title', 'Amount', 'Type', 'Category', 'Date', 'Added By', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id} className="table-row">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{categoryIcons[r.category]}</span>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                            {r.notes && <p className="text-xs truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>{r.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold text-sm font-mono flex items-center gap-1 ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {formatCurrency(r.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${r.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{r.type}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{r.category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>{formatDate(r.date)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.createdBy?.name || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {canManageRecords && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(r)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteRecord(r)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {records.map((r) => (
                <div key={r._id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">{categoryIcons[r.category]}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{r.category} · {formatDate(r.date)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold font-mono ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount)}
                      </p>
                      <span className={`badge text-xs ${r.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{r.type}</span>
                    </div>
                  </div>
                  {canManageRecords && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => openEdit(r)} className="btn-secondary text-xs py-1.5 flex-1 justify-center">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => setDeleteRecord(r)} className="btn-danger text-xs py-1.5 flex-1 justify-center">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ color: 'var(--text-secondary)' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: page === pageNum ? 'var(--accent-cyan)' : 'transparent',
                      color: page === pageNum ? '#0a0f1e' : 'var(--text-secondary)',
                    }}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ color: 'var(--text-secondary)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <RecordModal record={editRecord} onClose={() => { setShowModal(false); setEditRecord(null); }} onSaved={handleSaved} />
      )}
      {deleteRecord && (
        <ConfirmModal
          title="Delete Record"
          message={`Are you sure you want to delete "${deleteRecord.title}"? This action can be reversed by an admin.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteRecord(null)}
        />
      )}
    </div>
  );
}