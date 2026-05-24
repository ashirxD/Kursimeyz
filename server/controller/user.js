const User = require('../models/User');
const bcrypt = require('bcryptjs');

const DEFAULT_WHATSAPP_NUMBER = '923024379999';
const DEFAULT_EASYPAISA_REDIRECT_URL = 'https://easypaisa.onelink.me/cw4d/q9y8ba5v';
const DEFAULT_JAZZCASH_REDIRECT_URL = 'https://www.jazzcash.com.pk/jazzcash-app-aur-bhi-behtar/';

const cleanNumber = (value) => (value || '').toString().replace(/\D/g, '');

const validateOptionalNumber = (value, label) => {
    const cleaned = cleanNumber(value);

    if (!cleaned) {
        return '';
    }

    if (cleaned.length < 10) {
        throw new Error(`${label} must have at least 10 digits`);
    }

    if (cleaned.length > 15) {
        throw new Error(`${label} must not exceed 15 digits`);
    }

    return cleaned;
};

const validateOptionalRedirectUrl = (value, label) => {
    const url = (value || '').toString().trim();

    if (!url) {
        return '';
    }

    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
        throw new Error(`${label} must be a valid URL`);
    }

    return url;
};

const buildPaymentSettings = (admin, isDefault = false) => ({
    whatsappNumber: admin?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
    easypaisaAccountNumber: admin?.easypaisaAccountNumber || '',
    easypaisaRedirectUrl: admin?.easypaisaRedirectUrl || DEFAULT_EASYPAISA_REDIRECT_URL,
    jazzcashAccountNumber: admin?.jazzcashAccountNumber || '',
    jazzcashRedirectUrl: admin?.jazzcashRedirectUrl || DEFAULT_JAZZCASH_REDIRECT_URL,
    isDefault,
});

const findAdminWithPaymentSettings = async () => {
    return User.findOne({
        role: 'admin',
        $or: [
            { whatsappNumber: { $exists: true, $nin: [null, ''] } },
            { easypaisaAccountNumber: { $exists: true, $nin: [null, ''] } },
            { easypaisaRedirectUrl: { $exists: true, $nin: [null, ''] } },
            { jazzcashAccountNumber: { $exists: true, $nin: [null, ''] } },
            { jazzcashRedirectUrl: { $exists: true, $nin: [null, ''] } },
        ]
    });
};

// @desc    Get WhatsApp number (public - for frontend button)
// @route   GET /api/v1/user/whatsapp
const getWhatsAppNumber = async (req, res) => {
    try {
        const admin = await findAdminWithPaymentSettings();
        const settings = buildPaymentSettings(admin, !admin || !admin.whatsappNumber);

        return res.json({
            success: true,
            whatsappNumber: settings.whatsappNumber,
            isDefault: settings.isDefault
        });
    } catch (err) {
        console.error('Error fetching WhatsApp number:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get public payment settings for checkout
// @route   GET /api/v1/user/payment-settings
const getPaymentSettings = async (req, res) => {
    try {
        const admin = await findAdminWithPaymentSettings();

        res.json({
            success: true,
            data: buildPaymentSettings(admin, !admin)
        });
    } catch (err) {
        console.error('Error fetching payment settings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get WhatsApp number for admin (protected)
// @route   GET /api/v1/user/admin/whatsapp
const getAdminWhatsAppNumber = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can access this endpoint'
            });
        }

        // Return the current admin's WhatsApp number
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            whatsappNumber: user.whatsappNumber || ''
        });
    } catch (err) {
        console.error('Error fetching admin WhatsApp number:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get payment settings for admin (protected)
// @route   GET /api/v1/user/admin/payment-settings
const getAdminPaymentSettings = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can access this endpoint'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: buildPaymentSettings(user, false)
        });
    } catch (err) {
        console.error('Error fetching admin payment settings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update WhatsApp number (admin only)
// @route   PUT /api/v1/user/whatsapp
const updateWhatsAppNumber = async (req, res) => {
    try {
        const { whatsappNumber } = req.body;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can update WhatsApp number'
            });
        }

        // Validate input
        if (!whatsappNumber) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a WhatsApp number'
            });
        }

        // Remove any non-digit characters and validate
        const cleanedNumber = whatsappNumber.toString().replace(/\D/g, '');

        if (cleanedNumber.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid WhatsApp number with at least 10 digits'
            });
        }

        if (cleanedNumber.length > 15) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp number must not exceed 15 digits'
            });
        }

        // Update the admin user's WhatsApp number
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { whatsappNumber: cleanedNumber },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'WhatsApp number updated successfully',
            whatsappNumber: user.whatsappNumber
        });
    } catch (err) {
        console.error('Error updating WhatsApp number:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Update payment settings (admin only)
// @route   PUT /api/v1/user/admin/payment-settings
const updatePaymentSettings = async (req, res) => {
    try {
        const {
            whatsappNumber,
            easypaisaAccountNumber,
            easypaisaRedirectUrl,
            jazzcashAccountNumber,
            jazzcashRedirectUrl,
        } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can update payment settings'
            });
        }

        let settings;

        try {
            settings = {
                whatsappNumber: validateOptionalNumber(whatsappNumber, 'WhatsApp number'),
                easypaisaAccountNumber: validateOptionalNumber(easypaisaAccountNumber, 'Easypaisa account number'),
                easypaisaRedirectUrl: validateOptionalRedirectUrl(easypaisaRedirectUrl, 'Easypaisa redirect URL') || DEFAULT_EASYPAISA_REDIRECT_URL,
                jazzcashAccountNumber: validateOptionalNumber(jazzcashAccountNumber, 'JazzCash account number'),
                jazzcashRedirectUrl: validateOptionalRedirectUrl(jazzcashRedirectUrl, 'JazzCash redirect URL') || DEFAULT_JAZZCASH_REDIRECT_URL,
            };
        } catch (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError.message
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            settings,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment settings updated successfully',
            data: buildPaymentSettings(user, false)
        });
    } catch (err) {
        console.error('Error updating payment settings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all non-admin customers (admin only)
// @route   GET /api/v1/user/admin/all
const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: { $ne: 'admin' } })
            .select('_id username email phone image createdAt role')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: customers
        });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Update admin profile (email or password)
// @route   PUT /api/v1/user/admin/profile
const updateAdminProfile = async (req, res) => {
    try {
        const { currentPassword, newEmail, newPassword } = req.body;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can update admin profile'
            });
        }

        // Validate input
        if (!currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your current password to make changes'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        // Update email if provided
        if (newEmail && newEmail !== user.email) {
            // Check if email is already taken
            const emailExists = await User.findOne({ email: newEmail });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
            }
            user.email = newEmail;
        }

        // Update password if provided
        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error updating admin profile:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = {
    getWhatsAppNumber,
    getPaymentSettings,
    getAdminWhatsAppNumber,
    getAdminPaymentSettings,
    updateWhatsAppNumber,
    updatePaymentSettings,
    getAllCustomers,
    updateAdminProfile
}
