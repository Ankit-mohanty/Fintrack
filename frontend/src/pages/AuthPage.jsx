import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const floatingCards = [
  { icon: '💳', label: 'Smart Budgets', top: '15%', left: '5%', delay: 0 },
  { icon: '📈', label: '+24% Growth', top: '70%', left: '3%', delay: 0.4 },
  { icon: '🔔', label: 'Bill Reminders', top: '30%', right: '4%', delay: 0.8 },
  { icon: '⚡', label: 'Instant Insights', top: '65%', right: '5%', delay: 1.2 },
];

const FloatingCard = ({ card }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0, transition: { delay: card.delay, duration: 0.6 } }}
    className="absolute hidden lg:flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-xl text-[var(--text-primary)] bg-[rgba(22,22,31,0.9)] border border-[rgba(99,102,241,0.2)] backdrop-blur-md transition-all duration-300 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
    style={{ top: card.top, left: card.left, right: card.right }}
  >
    <span>{card.icon}</span>
    <span>{card.label}</span>
  </motion.div>
);

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (mode === 'login') {
      result = await login(form.email, form.password);
    } else {
      if (!form.name) return toast.error('Name is required');
      result = await register(form.name, form.email, form.password);
    }
    if (result.success) {
      toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created! 🎉');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-stretch relative overflow-hidden">
      <div className="animated-bg" />

      {/* Left Panel */}
      <div className="flex-1 hidden lg:flex flex-col justify-center items-center p-[60px] relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)]" />
        
        {floatingCards.map((card, i) => (
          <FloatingCard key={i} card={card} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <div className="text-[64px] mb-6">💹</div>
          <h1 className="text-[42px] font-extrabold font-['Space_Grotesk'] leading-[1.2] mb-4 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
            FinTracker Pro
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-[360px] leading-relaxed mx-auto">
            Your intelligent companion for financial freedom and subscription mastery.
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-6 mt-12">
            {[{ val: '₹2L+', label: 'Tracked Monthly' }, { val: '500+', label: 'Active Users' }, { val: '99.9%', label: 'Uptime' }].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center">
                <div className="text-2xl font-extrabold text-[var(--accent-light)]">{s.val}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex items-center justify-center w-full max-w-[480px] p-[40px_32px] border-l border-[var(--border)] bg-[var(--bg-secondary)]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[380px]"
        >
          {/* Logo mobile */}
          <div className="mb-8 text-center lg:hidden">
            <span className="text-[32px]">💹</span>
            <h1 className="text-[24px] font-extrabold font-['Space_Grotesk'] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">FinTracker Pro</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold mb-2 font-['Space_Grotesk']">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              {mode === 'login' ? 'Sign in to your FinTracker dashboard' : 'Start your financial journey today'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-[var(--bg-card)] rounded-[10px] p-1 mb-7 border border-[var(--border)]">
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
                background: mode === m ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: mode === m ? 'white' : 'var(--text-secondary)',
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pr-4 pl-10 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]" placeholder="Ankit Mohanty" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pr-4 pl-10 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]" type="email" placeholder="ankit@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-medium text-[var(--text-secondary)]">Password</label>
                {mode === 'login' && (
                  <Link
                    to="/forgot-password"
                    className="text-[12px] text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors no-underline font-medium"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pl-10 pr-11 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" className="w-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-[10px] p-3.5 mt-2 flex items-center justify-center gap-2 font-semibold text-[15px] cursor-pointer transition-all duration-200 relative overflow-hidden active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}>
              {isLoading ? (
                <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <Sparkles size={16} /></>
              )}
            </motion.button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 p-4 bg-[rgba(99,102,241,0.08)] rounded-[10px] border border-[rgba(99,102,241,0.15)]">
              <p className="text-xs text-[var(--text-secondary)] mb-1.5 font-semibold">🔑 Demo Credentials</p>
              <p className="text-xs text-[var(--text-muted)]">Email: demo@fintracker.com</p>
              <p className="text-xs text-[var(--text-muted)]">Password: demo123</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
