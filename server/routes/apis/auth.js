const express = require('express');
const router = express.Router();
const { register, login, currentUser } = require('../../controller/auth');
const { protect } = require('../../middleware/auth');

// @desc    Register user
// @route   POST /auth/register
router.post('/register', register);

// @desc    Login user
// @route   POST /auth/login
router.post('/login', login);

// @desc    Get current user
// @route   GET /auth/current_user
router.get('/current_user', protect, currentUser);

module.exports = router;
