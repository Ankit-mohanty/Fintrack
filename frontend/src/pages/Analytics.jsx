import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
      <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '13px', color: p.color || 'var(--accent-light)' }}>
          {p.name}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [subData, setSubData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const currency = user?.currency || 'INR';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [expRes, subRes] = await Promise.all([
          api.get('/expenses/analytics', { params: { year } }),
          api.get('/subscriptions', { params: { status: 'active' } }),
        ]);
        setData(expRes.data);
        setSubData(subRes.data.subscriptions);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    load();
  }, [year]);

  // Build monthly array for chart
  const monthlyChart = MONTHS.map((month, i) => {
    const found = data?.monthlySpending?.find(m => m._id.month === i + 1);
    return { month, amount: found?.total || 0, count: found?.count || 0 };
  });

  const categoryChart = data?.categoryBreakdown?.map(c => ({
    name: c._id, value: c.total, color: CATEGORY_COLORS[c._id] || '#6366f1', icon: CATEGORY_ICONS[c._id]
  })) || [];

  const subByCategory = Object.values(
    subData.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = { name: s.category, value: 0, count: 0 };
      const monthly = s.billingCycle === 'yearly' ? s.amount / 12 : s.billingCycle === 'quarterly' ? s.amount / 3 : s.billingCycle === 'weekly' ? s.amount * 4 : s.amount;
      acc[s.category].value += monthly;
      acc[s.category].count += 1;
      return acc;
    }, {})
  );

  const totalSpend = data?.categoryBreakdown?.reduce((a, c) => a + c.total, 0) || 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" /><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Crunching numbers...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>📊 Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Deep insights into your financial patterns</p>
        </div>
        <select className="input-field" style={{ width: 'auto' }} value={year} onChange={e => setYear(e.target.value)}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </motion.div>

      {/* Total spend card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Spent', value: formatCurrency(totalSpend, currency), icon: '💰', sub: `in ${year}` },
          { label: 'Avg Monthly', value: formatCurrency(totalSpend / 12, currency), icon: '📅', sub: 'per month' },
          { label: 'Categories', value: categoryChart.length, icon: '🏷️', sub: 'active categories' },
          { label: 'Monthly Sub Cost', value: formatCurrency(subData.reduce((a, s) => a + (s.billingCycle === 'monthly' ? s.amount : s.billingCycle === 'yearly' ? s.amount / 12 : s.billingCycle === 'quarterly' ? s.amount / 3 : s.amount * 4), 0), currency), icon: '🔄', sub: 'recurring/month' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="stat-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '2px' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Bar chart - Monthly Spending */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Monthly Spending Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyChart}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area type="monotone" dataKey="amount" name="Spending" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category & Subscription charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Category pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Category Distribution</h3>
          {categoryChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryChart} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px' }}>📊</div><p>No expense data for {year}</p>
            </div>
          )}
        </motion.div>

        {/* Subscription bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Subscription Cost by Category</h3>
          {subByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={v => formatCurrency(v, currency)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Bar dataKey="value" name="Monthly Cost" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px' }}>📱</div><p>No active subscriptions</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top categories table */}
      {categoryChart.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Spending Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryChart.map((cat, i) => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', fontSize: '16px', textAlign: 'center' }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{cat.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{formatCurrency(cat.value, currency)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.value / totalSpend) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                      style={{ height: '100%', background: cat.color, borderRadius: '3px' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{((cat.value / totalSpend) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
