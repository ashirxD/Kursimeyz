const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const googleAuthService = require('../services/googleAuth.service');
const emailService = require('../services/emailService');

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
    try {
        const { email, password, username: providedUsername, phone } = req.body;

        // Validate basic fields
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const normalizedEmail = normalizeEmail(email);

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user && user.emailVerified) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        if (user && user.provider !== 'local') {
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
            user.phone = phone;
            user.emailVerified = false;
            await user.save();
        } else {
            // Create user as pending until their email OTP is confirmed
            user = await User.create({
                email: normalizedEmail,
                password: hashedPassword,
                username,
                phone,
                emailVerified: false,
            });
        }

        try {
            await createVerificationOTP(user.email);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Account created, but failed to send OTP email. Please try resending the OTP.'
            });
        }

        res.status(201).json({
            success: true,
            requiresEmailVerification: true,
            email: user.email,
            message: 'Account created. Please verify the OTP sent to your email.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const normalizedEmail = normalizeEmail(email);

        // Check user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.password) {
            return res.status(401).json({ success: false, message: 'Please sign in with Google for this account' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.provider === 'local' && !user.emailVerified) {
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

        res.json({
            success: true,
            token,
            user: buildUserResponse(user)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/current_user
const currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            user: buildUserResponse(user)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
const logout = async (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie('jwt', '', {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Google OAuth login/signup
// @route   POST /api/v1/auth/google
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        // Validate input
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                message: 'Google token is required' 
            });
        }

        // Step 1: Verify Google token
        // Security: Always verify the token on the backend
        // Never trust user data coming from the frontend
        const googleUser = await googleAuthService.verifyToken(token);

        // Security: Only allow verified emails
        if (!googleUser.emailVerified) {
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
            try {
                await emailService.sendWelcomeEmail(
                    user.email,
                    user.username,
                    `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`
                );
                console.log(`Welcome email sent to Google user ${user.email}`);
            } catch (emailError) {
                console.error('Failed to send welcome email to Google user:', emailError);
                // Continue with registration even if email fails
            }
        }

        // Step 4: Generate our own JWT session token
        const jwtToken = signToken(user._id);

        // Step 5: Store JWT in HTTP-only cookie
        // Security: HTTP-only prevents XSS attacks
        setTokenCookie(res, jwtToken);

        // Step 6: Return user data (without sensitive info)
        res.status(200).json({
            success: true,
            token: jwtToken, // Also send in body for clients that need it
            user: buildUserResponse(user)
        });

    } catch (err) {
        console.error('Google auth error:', err.message);
        
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
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Please create an account before requesting an OTP' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        // Send Email
        try {
            await createVerificationOTP(normalizedEmail);
            res.json({ success: true, message: 'OTP sent successfully' });
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
        }

        const normalizedEmail = normalizeEmail(email);
        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            otp,
            purpose: OTP_PURPOSE.VERIFICATION,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
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
            console.log(`Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Continue verification even if welcome email fails
        }

        const token = signToken(user._id);
        setTokenCookie(res, token);

        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: buildUserResponse(user)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, a reset code has been sent.',
            });
        }

        if (!user.password) {
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
            res.json({
                success: true,
                message: 'If an account exists with this email, a reset code has been sent.',
            });
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            res.status(500).json({ success: false, message: 'Failed to send reset code email' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-reset-otp
const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
        }

        const normalizedEmail = normalizeEmail(email);
        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            otp,
            purpose: OTP_PURPOSE.PASSWORD_RESET,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        otpRecord.verified = true;
        await otpRecord.save();

        res.json({ success: true, message: 'OTP verified. You can now set a new password.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const normalizedEmail = normalizeEmail(email);
        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            purpose: OTP_PURPOSE.PASSWORD_RESET,
            verified: true,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset session. Please request a new OTP.',
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user || !user.password) {
            return res.status(400).json({ success: false, message: 'Unable to reset password for this account' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    googleAuth,
    register,
    login,
    currentUser,
    logout,
    sendOTP,
    verifyOTP,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
};
