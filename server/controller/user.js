const User = require('../models/User');
const PaymentSettings = require('../models/PaymentSettings');
const bcrypt = require('bcryptjs');
const { requirePakistaniMobile } = require('../utils/phone');

const DEFAULT_WHATSAPP_NUMBER = '+923211411478';
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

const buildPaymentSettingsResponse = (doc) => ({
    whatsappNumber: doc?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
    easypaisaAccountNumber: doc?.easypaisaAccountNumber || '',
    easypaisaRedirectUrl: doc?.easypaisaRedirectUrl || DEFAULT_EASYPAISA_REDIRECT_URL,
    jazzcashAccountNumber: doc?.jazzcashAccountNumber || '',
    jazzcashRedirectUrl: doc?.jazzcashRedirectUrl || DEFAULT_JAZZCASH_REDIRECT_URL,
    bankAccountNumber: doc?.bankAccountNumber || '',
    bankName: doc?.bankName || '',
    bankAccountTitle: doc?.bankAccountTitle || '',
});

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

// @desc    Get WhatsApp number (public - for frontend button)
// @route   GET /api/v1/user/whatsapp
const getWhatsAppNumber = async (req, res) => {
    try {
        const settings = await PaymentSettings.findOne();

        return res.json({
            success: true,
            whatsappNumber: settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
            isDefault: !settings?.whatsappNumber,
        });
    } catch (err) {
        console.error('Error fetching WhatsApp number:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get public payment settings for checkout
// @route   GET /api/v1/user/payment-settings
const getPaymentSettings = async (req, res) => {
    try {
        const settings = await PaymentSettings.findOne();

        res.json({
            success: true,
            data: buildPaymentSettingsResponse(settings),
        });
    } catch (err) {
        console.error('Error fetching payment settings:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update current user's profile phone
// @route   PUT /api/v1/user/phone
const updateUserPhone = async (req, res) => {
    try {
        const normalizedPhone = requirePakistaniMobile(req.body.phone);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { phone: normalizedPhone },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Phone number updated successfully',
            user: buildUserResponse(user),
        });
    } catch (err) {
        if (err.statusCode === 400 || err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }

        console.error('Error updating user phone:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get payment settings for admin (protected)
// @route   GET /api/v1/user/admin/payment-settings
const getAdminPaymentSettings = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can access this endpoint',
            });
        }

        const settings = await PaymentSettings.findOne();

        res.json({
            success: true,
            data: buildPaymentSettingsResponse(settings),
        });
    } catch (err) {
        console.error('Error fetching admin payment settings:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update payment settings (admin only)
// @route   PUT /api/v1/user/admin/payment-settings
const updatePaymentSettings = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can update payment settings',
            });
        }

        const {
            whatsappNumber,
            easypaisaAccountNumber,
            easypaisaRedirectUrl,
            jazzcashAccountNumber,
            jazzcashRedirectUrl,
            bankAccountNumber,
            bankName,
            bankAccountTitle,
        } = req.body;

        let data;

        try {
            data = {
                whatsappNumber: validateOptionalNumber(whatsappNumber, 'WhatsApp number'),
                easypaisaAccountNumber: validateOptionalNumber(easypaisaAccountNumber, 'Easypaisa account number'),
                easypaisaRedirectUrl: validateOptionalRedirectUrl(easypaisaRedirectUrl, 'Easypaisa redirect URL') || DEFAULT_EASYPAISA_REDIRECT_URL,
                jazzcashAccountNumber: validateOptionalNumber(jazzcashAccountNumber, 'JazzCash account number'),
                jazzcashRedirectUrl: validateOptionalRedirectUrl(jazzcashRedirectUrl, 'JazzCash redirect URL') || DEFAULT_JAZZCASH_REDIRECT_URL,
                bankAccountNumber: (bankAccountNumber || '').toString().trim(),
                bankName: (bankName || '').toString().trim(),
                bankAccountTitle: (bankAccountTitle || '').toString().trim(),
            };
        } catch (validationError) {
            return res.status(400).json({ success: false, message: validationError.message });
        }

        const settings = await PaymentSettings.findOneAndUpdate(
            {},
            data,
            { upsert: true, new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Payment settings updated successfully',
            data: buildPaymentSettingsResponse(settings),
        });
    } catch (err) {
        console.error('Error updating payment settings:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all non-admin customers (admin only)
// @route   GET /api/v1/user/admin/all
const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: { $ne: 'admin' } })
            .select('_id username email phone image createdAt role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: customers });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update admin profile (email or password)
// @route   PUT /api/v1/user/admin/profile
const updateAdminProfile = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can update admin profile',
            });
        }

        const { currentPassword, newEmail, newPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your current password to make changes',
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        if (newEmail && newEmail !== user.email) {
            const emailExists = await User.findOne({ email: newEmail });

            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use by another account',
                });
            }

            user.email = newEmail;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters',
                });
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
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Error updating admin profile:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Kept for backwards-compatibility — the route still exists but now reads from PaymentSettings
const getWhatsAppNumberAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admin users can access this endpoint' });
        }

        const settings = await PaymentSettings.findOne();

        res.json({ success: true, whatsappNumber: settings?.whatsappNumber || '' });
    } catch (err) {
        console.error('Error fetching admin WhatsApp number:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getWhatsAppNumber,
    getPaymentSettings,
    updateUserPhone,
    getAdminWhatsAppNumber: getWhatsAppNumberAdmin,
    getAdminPaymentSettings,
    updateWhatsAppNumber: updatePaymentSettings, // legacy route alias
    updatePaymentSettings,
    getAllCustomers,
    updateAdminProfile,
};
