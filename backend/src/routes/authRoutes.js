const express = require('express');
const { register, login, getMe, updateProfile, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Forgot password routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
