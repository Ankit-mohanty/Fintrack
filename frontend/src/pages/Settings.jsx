import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, DollarSign, Moon, Sun, Shield, Bell, Save } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { code: 'INR', label: '🇮🇳 Indian Rupee (₹)' },
  { code: 'USD', label: '🇺🇸 US Dollar ($)' },
  { code: 'EUR', label: '🇪🇺 Euro (€)' },
  { code: 'GBP', label: '🇬🇧 British Pound (£)' },
];

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'INR', monthlyBudget: user?.monthlyBudget || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div style={{ maxWidth: '700px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage your account preferences</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card" style={{ padding: '28px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: 'white' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>{user?.name}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user?.email}</div>
            <span className="badge badge-purple" style={{ marginTop: '6px', fontSize: '11px' }}>Premium Member</span>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <User size={14} style={{ display: 'inline', marginRight: '6px' }} />Full Name
            </label>
            <input className="input-field" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <DollarSign size={14} style={{ display: 'inline', marginRight: '6px' }} />Currency
            </label>
            <select className="input-field" value={profile.currency} onChange={e => setProfile({ ...profile, currency: e.target.value })}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Monthly Budget (optional)
            </label>
            <input className="input-field" type="number" min="0" placeholder="Set a monthly budget limit" value={profile.monthlyBudget} onChange={e => setProfile({ ...profile, monthlyBudget: e.target.value })} />
            {profile.monthlyBudget > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--accent-light)', marginTop: '4px' }}>
                Alerts will trigger when you exceed {new Intl.NumberFormat('en-IN', { style: 'currency', currency: profile.currency }).format(profile.monthlyBudget)}
              </p>
            )}
          </div>

          <motion.button type="submit" className="btn-primary" disabled={saving} whileTap={{ scale: 0.98 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
            {saving ? <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <><Save size={15} /> Save Changes</>}
          </motion.button>
        </form>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Appearance
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Theme Mode</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Currently using {theme} mode</div>
          </div>
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500'
          }}>
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Account Security
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Email Address', value: user?.email, icon: '📧' },
            { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: '📅' },
            { label: 'Account Status', value: 'Active & Verified', icon: '✅' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>{item.icon} {item.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
