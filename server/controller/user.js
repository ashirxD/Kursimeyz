const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get WhatsApp number (public - for frontend button)
// @route   GET /api/v1/user/whatsapp
const getWhatsAppNumber = async (req, res) => {
    try {
        // Find the admin user who has the WhatsApp number set
        // We look for any admin with a whatsappNumber field set
        const admin = await User.findOne({ 
            role: 'admin',
            whatsappNumber: { $exists: true, $ne: null }
        });

        if (!admin || !admin.whatsappNumber) {
            // Return a default number if none is set
            return res.json({
                success: true,
                whatsappNumber: '923024379999', // Default fallback
                isDefault: true
            });
        }

        res.json({
            success: true,
            whatsappNumber: admin.whatsappNumber,
            isDefault: false
        });
    } catch (err) {
        console.error('Error fetching WhatsApp number:', err);
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
    getAdminWhatsAppNumber,
    updateWhatsAppNumber,
    getAllCustomers,
    updateAdminProfile
}
