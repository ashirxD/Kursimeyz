const express = require('express');
const router = express.Router();
const { getWhatsAppNumber, getAdminWhatsAppNumber, updateWhatsAppNumber } = require('../../controller/user');
const { protect } = require('../../middleware/auth');

// @desc    Get WhatsApp number (public - for frontend button)
// @route   GET /user/whatsapp
router.get('/whatsapp', getWhatsAppNumber);

// @desc    Get WhatsApp number for admin (protected)
// @route   GET /user/admin/whatsapp
router.get('/admin/whatsapp', protect, getAdminWhatsAppNumber);

// @desc    Update WhatsApp number (admin only)
// @route   PUT /user/whatsapp
router.put('/whatsapp', protect, updateWhatsAppNumber);

module.exports = router;
