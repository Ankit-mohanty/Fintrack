import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Pause, Play, Bell } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { formatCurrency, formatDate, getDaysUntil, getMonthlyEquivalent } from '../utils/helpers';
import toast from 'react-hot-toast';

const SUB_CATEGORIES = ['Streaming', 'Music', 'Gaming', 'Productivity', 'Cloud Storage', 'Health & Fitness', 'News & Media', 'Education', 'Software', 'Other'];
const BILLING_CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'];

const POPULAR_SUBS = [
  { name: 'Netflix', logo: '🎬', color: '#e50914', amount: 649 },
  { name: 'Spotify', logo: '🎵', color: '#1db954', amount: 119 },
  { name: 'Amazon Prime', logo: '📦', color: '#ff9900', amount: 299 },
  { name: 'Disney+', logo: '🏰', color: '#113ccf', amount: 299 },
  { name: 'YouTube Premium', logo: '▶️', color: '#ff0000', amount: 139 },
  { name: 'Apple Music', logo: '🎶', color: '#fc3c44', amount: 99 },
];

const emptyForm = {
  name: '', amount: '', billingCycle: 'monthly', category: 'Streaming', color: '#6366f1',
  logo: '', startDate: new Date().toISOString().split('T')[0],
  nextBillingDate: new Date().toISOString().split('T')[0], notes: '', reminderDays: 3,
};

function SubModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    startDate: new Date(initial.startDate).toISOString().split('T')[0],
    nextBillingDate: new Date(initial.nextBillingDate).toISOString().split('T')[0],
  } : emptyForm);
  const [saving, setSaving] = useState(false);

  const applyPreset = (sub) => {
    setForm(f => ({ ...f, name: sub.name, logo: sub.logo, color: sub.color, amount: sub.amount, category: 'Streaming' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial?._id) {
        await api.put(`/subscriptions/${initial._id}`, form);
        toast.success('Subscription updated!');
      } else {
        await api.post('/subscriptions', form);
        toast.success('Subscription added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Space Grotesk' }}>{initial?._id ? '✏️ Edit Subscription' : '➕ Add Subscription'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {/* Quick presets */}
        {!initial?._id && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase' }}>Popular Services</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {POPULAR_SUBS.map(sub => (
                <button key={sub.name} onClick={() => applyPreset(sub)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.target.style.borderColor = sub.color}
                  onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}>
                  {sub.logo} {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Service Name *</label>
              <input className="input-field" placeholder="e.g. Netflix" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Icon</label>
              <input className="input-field" placeholder="🎬" value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} style={{ textAlign: 'center', fontSize: '20px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Amount (₹) *</label>
              <input className="input-field" type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Billing Cycle</label>
              <select className="input-field" value={form.billingCycle} onChange={e => setForm({ ...form, billingCycle: e.target.value })}>
                {BILLING_CYCLES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {SUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Date</label>
              <input className="input-field" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Next Billing</label>
              <input className="input-field" type="date" value={form.nextBillingDate} onChange={e => setForm({ ...form, nextBillingDate: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Reminder (days before)</label>
            <input className="input-field" type="number" min="0" max="30" value={form.reminderDays} onChange={e => setForm({ ...form, reminderDays: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {saving ? <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : initial?._id ? 'Update' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState('active');
  const { user } = useAuthStore();
  const currency = user?.currency || 'INR';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subscriptions', { params: { status: filter } });
      setSubs(data.subscriptions);
      setTotalMonthly(data.totalMonthly);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete subscription?')) return;
    await api.delete(`/subscriptions/${id}`);
    toast.success('Deleted');
    load();
  };

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    await api.put(`/subscriptions/${sub._id}`, { status: newStatus });
    toast.success(`Subscription ${newStatus}`);
    load();
  };

  const totalYearly = totalMonthly * 12;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>📱 Subscriptions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage all your recurring payments</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Subscription
        </button>
      </motion.div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Monthly Cost', value: formatCurrency(totalMonthly, currency), icon: '💳', color: '#6366f1' },
          { label: 'Annual Cost', value: formatCurrency(totalYearly, currency), icon: '📅', color: '#8b5cf6' },
          { label: 'Active Subs', value: subs.filter(s => s.status === 'active').length, icon: '✅', color: '#10b981' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '160px' }}>
            <span style={{ fontSize: '28px' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Space Grotesk', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['active', 'paused', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
            background: filter === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)',
            color: filter === f ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s'
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Subscription grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : subs.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📭</div>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>No {filter} subscriptions</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <AnimatePresence>
            {subs.map((sub, i) => {
              const daysLeft = getDaysUntil(sub.nextBillingDate);
              const isUrgent = daysLeft <= 3;
              return (
                <motion.div key={sub._id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card"
                  style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  {isUrgent && sub.status === 'active' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: sub.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: `1px solid ${sub.color}30` }}>
                        {sub.logo || '📋'}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700' }}>{sub.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub.category}</div>
                      </div>
                    </div>
                    <span className={`badge ${sub.status === 'active' ? 'badge-green' : sub.status === 'paused' ? 'badge-yellow' : 'badge-red'}`}>
                      {sub.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Space Grotesk' }}>{formatCurrency(sub.amount, currency)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per {sub.billingCycle}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: isUrgent ? '#f59e0b' : 'var(--text-secondary)' }}>
                        {daysLeft === 0 ? '🔴 Due today!' : daysLeft < 0 ? '⚠️ Overdue' : `${daysLeft}d left`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(sub.nextBillingDate)}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    ≈ {formatCurrency(getMonthlyEquivalent(sub.amount, sub.billingCycle), currency)}/month
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleToggleStatus(sub)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      {sub.status === 'active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
                    </button>
                    <button onClick={() => { setEditItem(sub); setShowModal(true); }}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(sub._id)}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showModal && <SubModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} initial={editItem} />}
      </AnimatePresence>
    </div>
  );
}
