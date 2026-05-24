const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    getDashboardStats,
    updateOrderStatus,
    getAdminOrderById,
    confirmPayment,
} = require('../../controller/order');
const { protect, admin } = require('../../middleware/auth');

router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/admin/dashboard-stats', admin, getDashboardStats);
router.get('/admin/all', admin, getAllOrders);
router.get('/admin/:id', admin, getAdminOrderById);
router.put('/admin/:id/status', admin, updateOrderStatus);
router.put('/admin/:id/pay', admin, confirmPayment);

module.exports = router;
