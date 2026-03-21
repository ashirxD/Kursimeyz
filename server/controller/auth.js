const User = require('../models/User');
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

// @desc    Register new user
// @route   POST /api/v1/auth/register
const register = async (req, res, next) => {
    try {
        const { email, password, username, phone } = req.body; // Accepting mostly email/password/username

        // Validate basic fields (User model also validates)
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide your email' });
        }

        if (!password) {
            return res.status(400).json({ success: false, message: 'Please provide your password' });
        }

        if (!username) {
            return res.status(400).json({ success: false, message: 'Please provide your username' });
        }


        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            email,
            password: hashedPassword,
            username,
            phone,
            // image: gravatar? or default
        });

        // Send welcome email
        try {
            await emailService.sendWelcomeEmail(
                user.email,
                user.username,
                `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`
            );
            console.log(`Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Continue with registration even if email fails
        }

        // Send token
        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
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

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Send token
        const token = signToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
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
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
                role: user.role
            }
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
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
                provider: user.provider,
                role: user.role,
            }
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


module.exports = {
    googleAuth,
    register,
    login,
    currentUser,
    logout
};
