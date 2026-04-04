import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CATEGORIES, formatDateInput } from '../../utils/helpers.js';
import api from '../../utils/api.js';

const EMPTY = { title: '', amount: '', type: 'expense', category: 'other', date: formatDateInput(new Date()), notes: '' };

export default function RecordModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        title: record.title,
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: formatDateInput(record.date),
        notes: record.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [record]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (record) {
        await api.put(`/records/${record._id}`, form);
      } else {
        await api.post('/records', form);
      }
      onSaved();
    } catch (err) {
      const errData = err.response?.data;
      setError(errData?.errors?.[0]?.message || errData?.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">{record ? 'Edit Record' : 'New Record'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="e.g. Monthly Salary" value={form.title} onChange={set('title')} required maxLength={100} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount ($)</label>
              <input type="number" step="0.01" min="0.01" className="input-field" placeholder="0.00"
                value={form.amount} onChange={set('amount')} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={form.type} onChange={set('type')}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} style={{ background: 'var(--bg-secondary)' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={set('date')} required />
            </div>
          </div>

          <div>
            <label className="label">Notes <span style={{ color: 'var(--text-muted)', textTransform: 'none' }}>(optional)</span></label>
            <textarea className="input-field resize-none" rows={3} placeholder="Additional notes..." value={form.notes} onChange={set('notes')} maxLength={500} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Save size={15} />{record ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}