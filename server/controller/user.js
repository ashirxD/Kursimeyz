const User = require('../models/User');

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
            whatsappNumber: admin.whatsappNumber.toString(),
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
        // Return the current admin's WhatsApp number
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            whatsappNumber: user.whatsappNumber ? user.whatsappNumber.toString() : ''
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
            whatsappNumber: user.whatsappNumber.toString()
        });
    } catch (err) {
        console.error('Error updating WhatsApp number:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = {
    getWhatsAppNumber,
    getAdminWhatsAppNumber,
    updateWhatsAppNumber
}
