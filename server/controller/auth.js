const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const googleAuthService = require('../services/googleAuth.service');
const emailService = require('../services/emailService');
const { requirePakistaniMobile } = require('../utils/phone');

const getRequestMeta = (req) => ({
    ip: req.ip || req.socket?.remoteAddress,
    userAgent: req.get('user-agent'),
});

const authLog = (level, action, message, meta = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        scope: 'auth',
        action,
        message,
        ...meta,
    };
    const line = `[AUTH] ${action} - ${message}`;

    if (level === 'error') {
        console.error(line, entry);
        return;
    }
    if (level === 'warn') {
        console.warn(line, entry);
        return;
    }
    console.log(line, entry);
};

// Helper to sign JWT
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d' // 7 days expiry as per requirements
    });
};

// Helper to set JWT cookie
const setTokenCookie = (res, token) => {
    // Security: HTTP-only cookie prevents XSS attacks
    // The cookie cannot be accessed by JavaScript
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,  // Prevents XSS - cookie not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
    };
    
    res.cookie('jwt', token, cookieOptions);
};

const normalizeEmail = (email) => email.toString().trim().toLowerCase();

const buildUserResponse = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    image: user.image,
    provider: user.provider,
    role: user.role,
    emailVerified: user.emailVerified,
});

const OTP_PURPOSE = {
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
};

const createOTP = async (email, purpose, subject) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
        { email, purpose },
        { otp, expiresAt, verified: false, purpose },
        { upsert: true, new: true }
    );

    await emailService.sendCustomEmail(email, subject, 'otp', { otp });
};

const createVerificationOTP = async (email) => {
    await createOTP(email, OTP_PURPOSE.VERIFICATION, 'Your Verification Code');
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
const register = async (req, res, next) => {
    const action = 'register';
    try {
        const { email, password, username: providedUsername, phone } = req.body;
        const meta = { ...getRequestMeta(req), email: email ? normalizeEmail(email) : undefined };

        authLog('info', action, 'Registration attempt', meta);

        // Validate basic fields
        if (!email || !password) {
            authLog('warn', action, 'Missing email or password', meta);
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        let normalizedPhone;
        try {
            normalizedPhone = requirePakistaniMobile(phone);
        } catch (validationError) {
            authLog('warn', action, 'Invalid phone number', meta);
            return res.status(400).json({ success: false, message: validationError.message });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user && user.emailVerified) {
            authLog('warn', action, 'User already exists', { ...meta, userId: user._id });
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        if (user && user.provider !== 'local') {
            authLog('warn', action, 'Email registered with Google', { ...meta, userId: user._id });
            return res.status(400).json({ success: false, message: 'This email is registered with Google. Please sign in with Google.' });
        }

        // Generate username if not provided
        const username = providedUsername || normalizedEmail.split('@')[0] + Math.floor(100 + Math.random() * 900);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            user.password = hashedPassword;
            user.username = username;
            user.phone = normalizedPhone;
            user.emailVerified = false;
            await user.save();
        } else {
            // Create user as pending until their email OTP is confirmed
            user = await User.create({
                email: normalizedEmail,
                password: hashedPassword,
                username,
                phone: normalizedPhone,
                emailVerified: false,
            });
        }

        try {
            await createVerificationOTP(user.email);
        } catch (emailError) {
            authLog('error', action, 'Failed to send verification email', {
                ...meta,
                userId: user._id,
                error: emailError.message,
            });
            return res.status(500).json({
                success: false,
                message: 'Account created, but failed to send OTP email. Please try resending the OTP.'
            });
        }

        authLog('info', action, 'Registration successful, verification OTP sent', {
            ...meta,
            userId: user._id,
            isExistingUser: Boolean(user),
        });

        res.status(201).json({
            success: true,
            requiresEmailVerification: true,
            email: user.email,
            message: 'Account created. Please verify the OTP sent to your email.'
        });

    } catch (err) {
        authLog('error', action, 'Registration failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
const login = async (req, res, next) => {
    const action = 'login';
    try {
        const { email, password } = req.body;
        const meta = { ...getRequestMeta(req), email: email ? normalizeEmail(email) : undefined };

        authLog('info', action, 'Login attempt', meta);

        // Validate
        if (!email || !password) {
            authLog('warn', action, 'Missing email or password', meta);
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        // Check user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            authLog('warn', action, 'Invalid credentials - user not found', meta);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.password) {
            authLog('warn', action, 'Google-only account login attempt', { ...meta, userId: user._id });
            return res.status(401).json({ success: false, message: 'Please sign in with Google for this account' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            authLog('warn', action, 'Invalid credentials - wrong password', { ...meta, userId: user._id });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Block admin accounts from using the user login page
        if (user.role === 'admin') {
            authLog('warn', action, 'Admin tried to login via user portal', { ...meta, userId: user._id });
            return res.status(403).json({
                success: false,
                message: 'Admin accounts must sign in through the admin portal.',
            });
        }

        if (user.provider === 'local' && !user.emailVerified) {
            authLog('warn', action, 'Email not verified', { ...meta, userId: user._id });
            return res.status(403).json({
                success: false,
                requiresEmailVerification: true,
                email: user.email,
                message: 'Please verify your email before logging in'
            });
        }

        // Send token
        const token = signToken(user._id);
        setTokenCookie(res, token);

        authLog('info', action, 'Login successful', {
            ...meta,
            userId: user._id,
            role: user.role,
            provider: user.provider,
        });

        res.json({
            success: true,
            token,
            user: buildUserResponse(user)
        });

    } catch (err) {
        authLog('error', action, 'Login failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Login admin user
// @route   POST /api/v1/auth/admin-login
const adminLogin = async (req, res) => {
    const action = 'admin_login';
    try {
        const { email, password } = req.body;
        const meta = { ...getRequestMeta(req), email: email ? normalizeEmail(email) : undefined };

        authLog('info', action, 'Admin login attempt', meta);

        if (!email || !password) {
            authLog('warn', action, 'Missing email or password', meta);
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            authLog('warn', action, 'Invalid credentials - user not found', meta);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.password) {
            authLog('warn', action, 'Google-only account login attempt', { ...meta, userId: user._id });
            return res.status(401).json({ success: false, message: 'Please sign in with Google for this account' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            authLog('warn', action, 'Invalid credentials - wrong password', { ...meta, userId: user._id });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Block non-admin accounts from using the admin login page
        if (user.role !== 'admin') {
            authLog('warn', action, 'Non-admin tried to login via admin portal', { ...meta, userId: user._id });
            return res.status(403).json({
                success: false,
                message: 'Access denied. This portal is for admin accounts only.',
            });
        }

        const token = signToken(user._id);
        setTokenCookie(res, token);

        authLog('info', action, 'Admin login successful', {
            ...meta,
            userId: user._id,
            role: user.role,
        });

        res.json({
            success: true,
            token,
            user: buildUserResponse(user),
        });

    } catch (err) {
        authLog('error', action, 'Admin login failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/current_user
const currentUser = async (req, res) => {
    const action = 'current_user';
    try {
        authLog('info', action, 'Fetching current user', {
            ...getRequestMeta(req),
            userId: req.user?.id,
        });

        const user = await User.findById(req.user.id);

        if (!user) {
            authLog('warn', action, 'User not found', { userId: req.user?.id });
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        authLog('info', action, 'Current user fetched', {
            userId: user._id,
            email: user.email,
            role: user.role,
        });

        res.json({
            success: true,
            user: buildUserResponse(user)
        });
    } catch (err) {
        authLog('error', action, 'Failed to fetch current user', {
            userId: req.user?.id,
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
const logout = async (req, res) => {
    const action = 'logout';
    try {
        authLog('info', action, 'Logout attempt', {
            ...getRequestMeta(req),
            userId: req.user?.id,
            email: req.user?.email,
        });

        // Clear the JWT cookie
        res.cookie('jwt', '', {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        authLog('info', action, 'Logout successful', { userId: req.user?.id });
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        authLog('error', action, 'Logout failed', {
            userId: req.user?.id,
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Google OAuth login/signup
// @route   POST /api/v1/auth/google
const googleAuth = async (req, res) => {
    const action = 'google';
    try {
        const { token } = req.body;
        const meta = getRequestMeta(req);

        authLog('info', action, 'Google auth attempt', meta);

        // Validate input
        if (!token) {
            authLog('warn', action, 'Google token missing', meta);
            return res.status(400).json({ 
                success: false, 
                message: 'Google token is required' 
            });
        }

        // Step 1: Verify Google token
        // Security: Always verify the token on the backend
        // Never trust user data coming from the frontend
        const googleUser = await googleAuthService.verifyToken(token);
        meta.email = googleUser.email;

        // Security: Only allow verified emails
        if (!googleUser.emailVerified) {
            authLog('warn', action, 'Google email not verified', meta);
            return res.status(400).json({
                success: false,
                message: 'Please verify your Google email before signing in'
            });
        }

        // Step 2: Check if user already exists by email
        // This prevents duplicate accounts using the same email
        let user = await User.findOne({ email: googleUser.email });

        if (user) {
            // User exists - check if they signed up with Google or local auth
            if (user.provider === 'local' && !user.googleId) {
                // Link Google account to existing local account
                user.googleId = googleUser.googleId;
                user.image = user.image || googleUser.picture;
                user.emailVerified = true;
                await user.save();
                authLog('info', action, 'Linked Google account to existing local user', {
                    ...meta,
                    userId: user._id,
                });
            }
            // If user already has googleId, proceed with login
        } else {
            // Step 3: Create new user if not found
            // Auto-signup for new Google users
            user = await User.create({
                googleId: googleUser.googleId,
                email: googleUser.email,
                username: googleUser.name,
                image: googleUser.picture,
                provider: 'google',
                emailVerified: true,
                // No password for Google OAuth users
                // They can only login via Google
            });

            // Send welcome email for new Google users
            authLog('info', action, 'New Google user created', { ...meta, userId: user._id });

            try {
                await emailService.sendWelcomeEmail(
                    user.email,
                    user.username,
                    `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`
                );
                authLog('info', action, 'Welcome email sent to new Google user', { ...meta, userId: user._id });
            } catch (emailError) {
                authLog('error', action, 'Failed to send welcome email to Google user', {
                    ...meta,
                    userId: user._id,
                    error: emailError.message,
                });
                // Continue with registration even if email fails
            }
        }

        // Step 4: Generate our own JWT session token
        const jwtToken = signToken(user._id);

        // Step 5: Store JWT in HTTP-only cookie
        // Security: HTTP-only prevents XSS attacks
        setTokenCookie(res, jwtToken);

        authLog('info', action, 'Google auth successful', {
            ...meta,
            userId: user._id,
            role: user.role,
            provider: user.provider,
        });

        // Step 6: Return user data (without sensitive info)
        res.status(200).json({
            success: true,
            token: jwtToken, // Also send in body for clients that need it
            user: buildUserResponse(user)
        });

    } catch (err) {
        authLog('error', action, 'Google auth failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        
        // Handle specific error types
        if (err.message === 'Invalid Google token') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired Google token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error during authentication' 
        });
    }
};


// @desc    Send OTP to email
// @route   POST /api/v1/auth/send-otp
const sendOTP = async (req, res) => {
    const action = 'send_otp';
    try {
        const { email } = req.body;
        const meta = { ...getRequestMeta(req), purpose: OTP_PURPOSE.VERIFICATION };

        authLog('info', action, 'Send verification OTP attempt', meta);

        if (!email) {
            authLog('warn', action, 'Email missing', meta);
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            authLog('warn', action, 'User not found', meta);
            return res.status(404).json({ success: false, message: 'Please create an account before requesting an OTP' });
        }

        if (user.emailVerified) {
            authLog('warn', action, 'Email already verified', { ...meta, userId: user._id });
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        // Send Email
        try {
            await createVerificationOTP(normalizedEmail);
            authLog('info', action, 'Verification OTP sent', { ...meta, userId: user._id });
            res.json({ success: true, message: 'OTP sent successfully' });
        } catch (emailError) {
            authLog('error', action, 'Failed to send OTP email', {
                ...meta,
                userId: user._id,
                error: emailError.message,
            });
            res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }
    } catch (err) {
        authLog('error', action, 'Send OTP failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
const verifyOTP = async (req, res) => {
    const action = 'verify_otp';
    try {
        const { email, otp } = req.body;
        const meta = { ...getRequestMeta(req), purpose: OTP_PURPOSE.VERIFICATION };

        authLog('info', action, 'Verify OTP attempt', meta);

        if (!email || !otp) {
            authLog('warn', action, 'Missing email or OTP', meta);
            return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            otp,
            purpose: OTP_PURPOSE.VERIFICATION,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            authLog('warn', action, 'Invalid or expired OTP', meta);
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            authLog('warn', action, 'Account not found', meta);
            return res.status(404).json({ success: false, message: 'Account not found. Please sign up first.' });
        }

        user.emailVerified = true;
        await user.save();
        await OTP.deleteOne({ _id: otpRecord._id });

        try {
            await emailService.sendWelcomeEmail(
                user.email,
                user.username,
                `${process.env.CLIENT_URL || 'http://localhost:1800'}/login`
            );
            authLog('info', action, 'Welcome email sent after verification', { ...meta, userId: user._id });
        } catch (emailError) {
            authLog('error', action, 'Failed to send welcome email', {
                ...meta,
                userId: user._id,
                error: emailError.message,
            });
            // Continue verification even if welcome email fails
        }

        const token = signToken(user._id);
        setTokenCookie(res, token);

        authLog('info', action, 'Email verified and user logged in', {
            ...meta,
            userId: user._id,
            role: user.role,
        });

        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: buildUserResponse(user)
        });
    } catch (err) {
        authLog('error', action, 'Verify OTP failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const action = 'forgot_password';
    try {
        const { email } = req.body;
        const meta = { ...getRequestMeta(req), purpose: OTP_PURPOSE.PASSWORD_RESET };

        authLog('info', action, 'Password reset OTP request', meta);

        if (!email) {
            authLog('warn', action, 'Email missing', meta);
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            authLog('info', action, 'Reset requested for unknown email (generic response)', meta);
            return res.json({
                success: true,
                message: 'If an account exists with this email, a reset code has been sent.',
            });
        }

        if (!user.password) {
            authLog('warn', action, 'Google-only account reset attempt', { ...meta, userId: user._id });
            return res.status(400).json({
                success: false,
                message: 'This email is registered with Google. Please sign in with Google.',
            });
        }

        try {
            await createOTP(
                normalizedEmail,
                OTP_PURPOSE.PASSWORD_RESET,
                'Your Password Reset Code'
            );
            authLog('info', action, 'Password reset OTP sent', { ...meta, userId: user._id });
            res.json({
                success: true,
                message: 'If an account exists with this email, a reset code has been sent.',
            });
        } catch (emailError) {
            authLog('error', action, 'Failed to send password reset email', {
                ...meta,
                userId: user._id,
                error: emailError.message,
            });
            res.status(500).json({ success: false, message: 'Failed to send reset code email' });
        }
    } catch (err) {
        authLog('error', action, 'Forgot password failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-reset-otp
const verifyResetOtp = async (req, res) => {
    const action = 'verify_reset_otp';
    try {
        const { email, otp } = req.body;
        const meta = { ...getRequestMeta(req), purpose: OTP_PURPOSE.PASSWORD_RESET };

        authLog('info', action, 'Verify reset OTP attempt', meta);

        if (!email || !otp) {
            authLog('warn', action, 'Missing email or OTP', meta);
            return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            otp,
            purpose: OTP_PURPOSE.PASSWORD_RESET,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            authLog('warn', action, 'Invalid or expired reset OTP', meta);
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        otpRecord.verified = true;
        await otpRecord.save();

        authLog('info', action, 'Reset OTP verified', meta);

        res.json({ success: true, message: 'OTP verified. You can now set a new password.' });
    } catch (err) {
        authLog('error', action, 'Verify reset OTP failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const action = 'reset_password';
    try {
        const { email, password } = req.body;
        const meta = { ...getRequestMeta(req), purpose: OTP_PURPOSE.PASSWORD_RESET };

        authLog('info', action, 'Password reset attempt', meta);

        if (!email || !password) {
            authLog('warn', action, 'Missing email or password', meta);
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        if (password.length < 6) {
            authLog('warn', action, 'Password too short', meta);
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const normalizedEmail = normalizeEmail(email);
        meta.email = normalizedEmail;

        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            purpose: OTP_PURPOSE.PASSWORD_RESET,
            verified: true,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            authLog('warn', action, 'Invalid or expired reset session', meta);
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset session. Please request a new OTP.',
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user || !user.password) {
            authLog('warn', action, 'Unable to reset password for account', meta);
            return res.status(400).json({ success: false, message: 'Unable to reset password for this account' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        await OTP.deleteOne({ _id: otpRecord._id });

        authLog('info', action, 'Password reset successful', { ...meta, userId: user._id });

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        authLog('error', action, 'Password reset failed', {
            ...getRequestMeta(req),
            error: err.message,
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    googleAuth,
    register,
    login,
    adminLogin,
    currentUser,
    logout,
    sendOTP,
    verifyOTP,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
};
