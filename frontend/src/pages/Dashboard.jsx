import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CreditCard, AlertCircle, ArrowRight, Wallet, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { formatCurrency, formatDate, getDaysUntil, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="stat-card"
    style={{ cursor: 'default' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className={`badge ${trend >= 0 ? 'badge-red' : 'badge-green'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px', fontFamily: 'Space Grotesk' }}>{value}</div>
    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '2px' }}>{title}</div>
    {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</div>}
  </motion.div>
);

const RADIAN = Math.PI / 180;
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get('/dashboard');
        setData(res.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your dashboard...</p>
    </div>
  );

  const currency = user?.currency || 'INR';
  const pieData = data?.categoryBreakdown?.map(c => ({ name: c._id, value: c.total, color: CATEGORY_COLORS[c._id] || '#6366f1' })) || [];

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Here's your financial overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Monthly Spending" value={formatCurrency(data?.currentMonthSpending || 0, currency)}
          subtitle={`vs ${formatCurrency(data?.lastMonthSpending || 0, currency)} last month`}
          icon={Wallet} color="#6366f1" trend={data?.monthChangePercent} delay={0} />
        <StatCard title="Active Subscriptions" value={data?.activeSubscriptionsCount || 0}
          subtitle={`${formatCurrency(data?.monthlySubscriptionCost || 0, currency)}/month total`}
          icon={CreditCard} color="#8b5cf6" delay={0.1} />
        <StatCard title="Upcoming Renewals" value={data?.upcomingRenewals?.length || 0}
          subtitle="in the next 7 days" icon={AlertCircle} color="#f59e0b" delay={0.2} />
        <StatCard title="Recent Transactions" value={data?.recentExpenses?.length || 0}
          subtitle="this session" icon={Receipt} color="#10b981" delay={0.3} />
      </div>

      {/* Charts & lists row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Spending by Category</h3>
            <Link to="/analytics" style={{ fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>View all <ArrowRight size={12} /></Link>
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" labelLine={false} label={CustomLabel}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{CATEGORY_ICONS[item.name]} {item.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{formatCurrency(item.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📊</div>
              <p style={{ fontSize: '14px' }}>No expense data yet</p>
            </div>
          )}
        </motion.div>

        {/* Upcoming Renewals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Upcoming Renewals</h3>
            <Link to="/subscriptions" style={{ fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Manage <ArrowRight size={12} /></Link>
          </div>
          {data?.upcomingRenewals?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.upcomingRenewals.map((s, i) => {
                const days = getDaysUntil(s.nextBillingDate);
                return (
                  <motion.div key={s._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {s.logo || '📋'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(s.nextBillingDate)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{formatCurrency(s.amount, currency)}</div>
                      <span className={`badge ${days <= 1 ? 'badge-red' : days <= 3 ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '11px' }}>
                        {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
              <p style={{ fontSize: '14px' }}>No renewals in next 7 days</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Expenses */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Transactions</h3>
          <Link to="/expenses" style={{ fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>View all <ArrowRight size={12} /></Link>
        </div>
        {data?.recentExpenses?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.recentExpenses.map((e, i) => (
              <motion.div key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${CATEGORY_COLORS[e.category]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {CATEGORY_ICONS[e.category]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{e.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{e.category} • {formatDate(e.date)}</div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ef4444' }}>-{formatCurrency(e.amount, currency)}</div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>💸</div>
            <p style={{ fontSize: '14px' }}>No recent expenses</p>
            <Link to="/expenses" className="btn-primary" style={{ display: 'inline-block', marginTop: '12px', textDecoration: 'none', padding: '8px 20px', fontSize: '13px' }}>
              Add first expense
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
