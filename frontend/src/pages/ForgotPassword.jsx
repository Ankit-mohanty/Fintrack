import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Sparkles, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

const STEPS = ['email', 'otp', 'success'];

const floatingCards = [
  { icon: '🔐', label: 'Secure Reset', top: '15%', left: '5%', delay: 0 },
  { icon: '📧', label: 'OTP via Email', top: '70%', left: '3%', delay: 0.4 },
  { icon: '🛡️', label: 'Protected', top: '30%', right: '4%', delay: 0.8 },
  { icon: '✅', label: 'Verified', top: '65%', right: '5%', delay: 1.2 },
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

// OTP single-digit input boxes
function OTPInput({ value, onChange }) {
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (i, char) => {
    // Only allow digits
    const sanitized = char.replace(/\D/g, '').slice(-1);
    const arr = digits.map((d) => d);
    arr[i] = sanitized;
    onChange(arr.join(''));
    // Auto-focus next
    if (sanitized && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
  };

  return (
    <div className="flex gap-3 justify-center my-6" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          style={{
            width: '52px',
            height: '60px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: '700',
            background: 'var(--bg-secondary)',
            border: d ? '2px solid var(--accent)' : '2px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: d ? '0 0 0 3px var(--accent-glow)' : 'none',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = d ? 'var(--accent)' : 'var(--border)')}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  // Start resend cooldown timer
  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent! Check your inbox 📧');
      setStep('otp');
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter the complete 6-digit OTP');
    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('OTP verified! 🎉');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('New OTP sent! 📧');
      setOtp('');
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
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
            Secure OTP-based password recovery. Your account safety is our priority.
          </p>

          {/* Steps indicator */}
          <div className="flex justify-center gap-8 mt-12">
            {[
              { icon: '📧', label: 'Enter Email' },
              { icon: '🔢', label: 'Verify OTP' },
              { icon: '🔑', label: 'New Password' },
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
                    background:
                      (step === 'email' && i === 0) || (step === 'otp' && i === 1)
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'rgba(99,102,241,0.1)',
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

          {/* Back to login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-8 transition-colors duration-200 no-underline"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Email ── */}
            {step === 'email' && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-[16px] bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center mb-4">
                    <Mail size={26} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h2 className="text-[28px] font-extrabold mb-2 font-['Space_Grotesk']">Forgot Password?</h2>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    No worries! Enter your registered email and we'll send a 6-digit OTP to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pr-4 pl-10 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]"
                        type="email"
                        placeholder="ankit@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-[10px] p-3.5 mt-2 flex items-center justify-center gap-2 font-semibold text-[15px] cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    ) : (
                      <>Send OTP <Sparkles size={16} /></>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP Verify ── */}
            {step === 'otp' && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-[16px] bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center mb-4">
                    <ShieldCheck size={26} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h2 className="text-[28px] font-extrabold mb-2 font-['Space_Grotesk']">Enter OTP</h2>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    We sent a 6-digit OTP to{' '}
                    <span className="text-[var(--accent-light)] font-semibold">{email}</span>
                    . It expires in 10 minutes.
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                  <OTPInput value={otp} onChange={setOtp} />

                  <motion.button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-[10px] p-3.5 flex items-center justify-center gap-2 font-semibold text-[15px] cursor-pointer transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    ) : (
                      <>Verify OTP <ShieldCheck size={16} /></>
                    )}
                  </motion.button>
                </form>

                {/* Resend + change email */}
                <div className="mt-5 text-center space-y-2">
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-sm transition-colors duration-200 bg-transparent border-none cursor-pointer"
                    style={{ color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-light)' }}
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Didn't receive it? Resend OTP"}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setOtp(''); }}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-transparent border-none cursor-pointer transition-colors"
                    >
                      ← Change email address
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
