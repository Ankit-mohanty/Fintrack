const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      createdAt: user.createdAt,
    },
  });
};

// Create nodemailer transporter using env config
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, monthlyBudget } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, currency, monthlyBudget },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Please provide your email', 400));

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No account found with that email address', 404));
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    user.resetOTPVerified = false;
    await user.save({ validateBeforeSave: false });

    // Guard: make sure email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
      return next(new AppError('Email service is not configured. Contact support.', 500));
    }

    // Send email
    const transporter = createTransporter();
    const mailOptions = {
      from: `"FinTracker Pro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your Password Reset OTP - FinTracker Pro',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: #111118; color: #f8f8ff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(99,102,241,0.2);">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 28px 32px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">💹</div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: white;">FinTracker Pro</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">Password Reset Request</p>
          </div>
          <div style="padding: 32px;">
            <p style="color: #a0a0b8; font-size: 15px; margin: 0 0 20px;">Hi <strong style="color: #f8f8ff;">${user.name}</strong>,</p>
            <p style="color: #a0a0b8; font-size: 14px; margin: 0 0 24px;">You requested to reset your password. Use the OTP below. It expires in <strong style="color: #f8f8ff;">10 minutes</strong>.</p>
            <div style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #60607a; text-transform: uppercase; letter-spacing: 2px;">Your OTP</p>
              <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #818cf8;">${otp}</div>
            </div>
            <p style="color: #60607a; font-size: 12px; margin: 0;">If you did not request this, please ignore this email. Your account is safe.</p>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.07); text-align: center;">
            <p style="color: #60607a; font-size: 11px; margin: 0;">© 2025 FinTracker Pro. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your registered email address',
    });
  } catch (err) {
    // Log the real error for debugging
    console.error('❌ Forgot password error:', err.message);
    // Clear OTP on email failure
    await User.findOneAndUpdate(
      { email: req.body.email },
      { $unset: { resetOTP: '', resetOTPExpiry: '', resetOTPVerified: '' } }
    ).catch(() => {});
    next(err);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return next(new AppError('Email and OTP are required', 400));

    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpiry +resetOTPVerified');
    if (!user) return next(new AppError('No account found with that email', 404));

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return next(new AppError('No OTP requested. Please request a new one.', 400));
    }

    if (user.resetOTPExpiry < new Date()) {
      return next(new AppError('OTP has expired. Please request a new one.', 400));
    }

    if (user.resetOTP !== otp.trim()) {
      return next(new AppError('Invalid OTP. Please try again.', 400));
    }

    // Mark OTP as verified
    user.resetOTPVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Email and new password are required', 400));
    if (password.length < 6) return next(new AppError('Password must be at least 6 characters', 400));

    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpiry +resetOTPVerified +password');
    if (!user) return next(new AppError('No account found with that email', 404));

    if (!user.resetOTPVerified) {
      return next(new AppError('Please verify your OTP before resetting password', 400));
    }

    if (user.resetOTPExpiry < new Date()) {
      return next(new AppError('Session expired. Please start the process again.', 400));
    }

    // Update password and clear OTP fields
    user.password = password;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    user.resetOTPVerified = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, verifyOTP, resetPassword };
