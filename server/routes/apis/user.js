const express = require('express');
const router = express.Router();
const {
    getWhatsAppNumber,
    getPaymentSettings,
    getAdminWhatsAppNumber,
    getAdminPaymentSettings,
    updateWhatsAppNumber,
    updatePaymentSettings,
    getAllCustomers,
    updateAdminProfile
} = require('../../controller/user');
const { protect, admin } = require('../../middleware/auth');

// @desc    Get WhatsApp number (public - for frontend button)
// @route   GET /user/whatsapp
router.get('/whatsapp', getWhatsAppNumber);

// @desc    Get public payment settings
// @route   GET /user/payment-settings
router.get('/payment-settings', getPaymentSettings);

// @desc    Get WhatsApp number for admin (protected)
// @route   GET /user/admin/whatsapp
router.get('/admin/whatsapp', protect, getAdminWhatsAppNumber);

// @desc    Get payment settings for admin (protected)
// @route   GET /user/admin/payment-settings
router.get('/admin/payment-settings', protect, admin, getAdminPaymentSettings);

// @desc    Get all non-admin customers (admin only)
// @route   GET /user/admin/all
router.get('/admin/all', protect, admin, getAllCustomers);

// @desc    Update WhatsApp number (admin only)
// @route   PUT /user/whatsapp
router.put('/whatsapp', protect, updateWhatsAppNumber);

// @desc    Update payment settings (admin only)
// @route   PUT /user/admin/payment-settings
router.put('/admin/payment-settings', protect, admin, updatePaymentSettings);

// @desc    Update admin profile (admin only)
// @route   PUT /user/admin/profile
router.put('/admin/profile', protect, admin, updateAdminProfile);

module.exports = router;
