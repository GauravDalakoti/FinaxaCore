import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#00d4ff', trend, trendValue }) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
          <p className="text-2xl font-display font-bold truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
          {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={18} style={{ color }} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{Math.abs(trendValue || trend)}% vs last month</span>
        </div>
      )}
    </div>
  );
}
