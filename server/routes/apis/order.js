const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    getDashboardStats,
    updateOrderStatus
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
router.put('/admin/:id/status', admin, updateOrderStatus);

module.exports = router;
