import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Activity, Clock, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import api from '../utils/api.js';
import { formatCurrency, formatDate, categoryColors, categoryIcons } from '../utils/helpers.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-lg text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user, canViewAnalytics } = useAuth();
  const [summary, setSummary] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const requests = [
          api.get('/dashboard/summary'),
          api.get('/dashboard/recent?limit=8'),
        ];
        if (canViewAnalytics) {
          requests.push(api.get('/dashboard/monthly-trends'));
          requests.push(api.get('/dashboard/by-category'));
        }
        const results = await Promise.all(requests);
        setSummary(results[0].data.data);
        setRecent(results[1].data.data);
        if (canViewAnalytics) {
          setMonthlyTrends(results[2].data.data);
          const catRaw = results[3].data.data;
          // Aggregate by category
          const catMap = {};
          catRaw.forEach(({ _id, total }) => {
            if (!catMap[_id.category]) catMap[_id.category] = { category: _id.category, income: 0, expense: 0 };
            catMap[_id.category][_id.type === 'income' ? 'income' : 'expense'] = total;
          });
          setCategoryData(Object.values(catMap).sort((a, b) => (b.income + b.expense) - (a.income + a.expense)).slice(0, 8));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [canViewAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  const pieData = categoryData.map(d => ({
    name: d.category,
    value: d.income + d.expense,
  }));

  return (
    <div className="space-y-6">

      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{user?.name}</span> — here's your financial overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.netBalance)}
          subtitle="Total net position"
          icon={DollarSign}
          color="#00d4ff"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.totalIncome)}
          subtitle={`${summary?.incomeCount || 0} transactions`}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpenses)}
          subtitle={`${summary?.expenseCount || 0} transactions`}
          icon={TrendingDown}
          color="#f43f5e"
        />
        <StatCard
          title="Transactions"
          value={summary?.totalTransactions || 0}
          subtitle="All time records"
          icon={Activity}
          color="#8b5cf6"
        />
      </div>

      {canViewAnalytics && monthlyTrends.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Monthly Trend */}
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">Monthly Trends</h2>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>Last 12 months</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrends} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h2 className="section-title mb-5">By Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={categoryColors[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                {/* <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '12px' }} /> */}
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    background: '#1e293b',  
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ffffff'      
                  }}
                  itemStyle={{ color: '#ffffff' }}   
                  labelStyle={{ color: '#cbd5f5' }}  
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
              {pieData.slice(0, 5).map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: categoryColors[d.name] }} />
                    <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{categoryIcons[d.name]} {d.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace' }}>{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {canViewAnalytics && categoryData.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Income vs Expenses by Category</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} margin={{ top: 0, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={30} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 8 transactions</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {recent.length === 0 ? (
            <p className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
          ) : (
            recent.map((r) => (
              <div key={r._id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-opacity-50" style={{ ':hover': { background: 'var(--bg-card-hover)' } }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: r.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }}>
                  {categoryIcons[r.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{r.category} · {formatDate(r.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold font-mono ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {r.type === 'income' ? <ArrowUpRight size={13} className="inline" /> : <ArrowDownRight size={13} className="inline" />}
                    {formatCurrency(r.amount)}
                  </p>
                  <span className={`badge text-xs ${r.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{r.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}