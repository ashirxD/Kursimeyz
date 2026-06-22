const express = require('express');
const router = express.Router();
const {
    register,
    login,
    adminLogin,
    currentUser,
    logout,
    googleAuth,
    sendOTP,
    verifyOTP,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
} = require('../../controller/auth');
const { protect } = require('../../middleware/auth');

// @desc    Register user
// @route   POST /auth/register
router.post('/register', register);

// @desc    Login user
// @route   POST /auth/login
router.post('/login', login);

// @desc    Login admin user
// @route   POST /auth/admin-login
router.post('/admin-login', adminLogin);

// @desc    Google OAuth login/signup
// @route   POST /auth/google
router.post('/google', googleAuth);

// @desc    Get current user
// @route   GET /auth/current_user
router.get('/current_user', protect, currentUser);

// @desc    Logout user
// @route   POST /auth/logout
router.post('/logout', protect, logout);

// @desc    OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// @desc    Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
