import { Trash2, X } from 'lucide-react';
import { useState } from 'react';

export default function ConfirmModal({ title, message, onConfirm, onClose, confirmLabel = 'Delete', danger = true }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)' }}>
            <Trash2 size={18} className="text-rose-400" />
          </div>
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            <X size={15} /> Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading} className={`flex-1 justify-center ${danger ? 'btn-danger' : 'btn-primary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Trash2 size={15} />{confirmLabel}</>}
          </button>
        </div>
      </div>
    </div>
  );
}