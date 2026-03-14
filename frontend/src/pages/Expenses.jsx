import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, X, ChevronDown, Calendar } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food & Dining', 'Shopping', 'Transportation', 'Entertainment', 'Healthcare', 'Utilities', 'Rent & Housing', 'Education', 'Travel', 'Subscriptions', 'Investments', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'];

const emptyForm = { title: '', amount: '', category: 'Food & Dining', date: new Date().toISOString().split('T')[0], notes: '', paymentMethod: 'UPI' };

function ExpenseModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial?._id) {
        await api.put(`/expenses/${initial._id}`, form);
        toast.success('Expense updated!');
      } else {
        await api.post('/expenses', form);
        toast.success('Expense added!');
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
        style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Space Grotesk' }}>{initial?._id ? '✏️ Edit Expense' : '➕ Add Expense'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Title *</label>
            <input className="input-field" placeholder="e.g. Grocery shopping" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Amount (₹) *</label>
              <input className="input-field" type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Date *</label>
              <input className="input-field" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Category *</label>
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Payment Method</label>
            <select className="input-field" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Notes</label>
            <textarea className="input-field" placeholder="Optional notes..." rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {saving ? <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : initial?._id ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [total, setTotal] = useState(0);
  const { user } = useAuthStore();
  const currency = user?.currency || 'INR';

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.expenses);
      setTotal(data.expenses.reduce((a, e) => a + e.amount, 0));
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadExpenses(); }, [filterCategory]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      loadExpenses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = expenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>💸 Expenses</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Track & manage your spending</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Expense
        </button>
      </motion.div>

      {/* Summary bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>💰</span>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Space Grotesk' }}>{formatCurrency(total, currency)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total ({filtered.length} items)</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: '36px' }} placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" style={{ width: 'auto', minWidth: '180px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
        {filterCategory && <button onClick={() => setFilterCategory('')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Clear Filter</button>}
      </motion.div>

      {/* Expense list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{search ? 'No matching expenses' : 'No expenses yet'}</p>
          <p style={{ fontSize: '14px' }}>Start tracking your spending!</p>
        </motion.div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 80px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Description</span>
            <span>Category</span>
            <span>Date</span>
            <span>Amount</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>
          <div>
            <AnimatePresence>
              {filtered.map((expense, i) => (
                <motion.div key={expense._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 80px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background 0.2s' }}
                  whileHover={{ backgroundColor: 'var(--bg-card-hover)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${CATEGORY_COLORS[expense.category]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {CATEGORY_ICONS[expense.category]}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{expense.title}</div>
                      {expense.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{expense.notes}</div>}
                    </div>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{expense.category}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatDate(expense.date)}</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#ef4444' }}>-{formatCurrency(expense.amount, currency)}</span>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditItem(expense); setShowModal(true); }}
                      style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(expense._id)}
                      style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ExpenseModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); loadExpenses(); }} initial={editItem} />
        )}
      </AnimatePresence>
    </div>
  );
}
