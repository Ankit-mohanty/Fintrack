import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

const floatingCards = [
  { icon: '🔑', label: 'New Password', top: '15%', left: '5%', delay: 0 },
  { icon: '🛡️', label: 'Stay Secure', top: '70%', left: '3%', delay: 0.4 },
  { icon: '✅', label: 'OTP Verified', top: '30%', right: '4%', delay: 0.8 },
  { icon: '🚀', label: 'Almost Done', top: '65%', right: '5%', delay: 1.2 },
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

// Password strength indicator
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Contains special char', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['var(--red)', 'var(--red)', 'var(--yellow)', 'var(--yellow)', 'var(--green)'];
  const labels = ['', 'Weak', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : 'var(--border)' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {checks.map((c, i) => (
            <span key={i} className="text-[11px]" style={{ color: c.pass ? 'var(--green)' : 'var(--text-muted)' }}>
              {c.pass ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className="text-[11px] font-semibold" style={{ color: colors[score] }}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Guard: if no email in state, redirect back
  if (!email) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-[var(--text-secondary)] mb-4">Session expired or invalid access.</p>
          <Link to="/forgot-password" className="text-[var(--accent-light)] underline">
            Start forgot password again
          </Link>
        </div>
      </div>
    );
  }

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, password });
      setSuccess(true);
      toast.success('Password reset successfully! 🎉');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
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
            Set a strong new password to secure your financial data.
          </p>

          {/* Steps - all completed lest step active */}
          <div className="flex justify-center gap-8 mt-12">
            {[
              { icon: '📧', label: 'Email Sent', done: true },
              { icon: '✅', label: 'OTP Verified', done: true },
              { icon: '🔑', label: 'New Password', done: false, active: true },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="text-center"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl transition-all duration-300"
                  style={{
                    background: s.done || s.active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  {s.icon}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center w-full max-w-[480px] p-[40px_32px] border-l border-[var(--border)] bg-[var(--bg-secondary)]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <span className="text-[32px]">💹</span>
            <h1 className="text-[24px] font-extrabold font-['Space_Grotesk'] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">FinTracker Pro</h1>
          </div>

          {success ? (
            /* ── Success state ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="text-[80px] mb-6"
              >
                🎉
              </motion.div>
              <h2 className="text-[28px] font-extrabold mb-3 font-['Space_Grotesk']">Password Reset!</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Your password has been updated successfully. Redirecting you to sign in…
              </p>
              <div className="flex justify-center">
                <span className="spinner" style={{ width: '28px', height: '28px', borderWidth: '2px' }} />
              </div>
            </motion.div>
          ) : (
            /* ── Form ── */
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-[16px] bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center mb-4">
                  <KeyRound size={26} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="text-[28px] font-extrabold mb-2 font-['Space_Grotesk']">Set New Password</h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  OTP verified for{' '}
                  <span className="text-[var(--accent-light)] font-semibold">{email}</span>.
                  Choose a strong new password.
                </p>
              </div>

              <form onSubmit={handleReset} className="flex flex-col gap-4">
                {/* New Password */}
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pl-10 pr-11 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pl-10 pr-11 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <p
                      className="text-[11px] mt-1.5"
                      style={{ color: password === confirmPassword ? 'var(--green)' : 'var(--red)' }}
                    >
                      {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-[10px] p-3.5 mt-2 flex items-center justify-center gap-2 font-semibold text-[15px] cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  ) : (
                    <>Reset Password <Sparkles size={16} /></>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors no-underline"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
