const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const PaymentConfirmation = require('../models/PaymentConfirmation');
const emailService = require('../services/emailService');

const adminOrderPopulate = [
    { path: 'user', select: 'username email phone' },
    { path: 'items.product', select: 'name image category price' },
    {
        path: 'paymentConfirmation',
        populate: { path: 'confirmedBy', select: 'username' },
    },
];

const getAdminOrderEmailRecipients = async () => {
    const admins = await User.find({
        role: 'admin',
        email: { $exists: true, $nin: [null, ''] },
    }).select('email');

    const adminEmails = admins.map((adminUser) => adminUser.email).filter(Boolean);

    if (adminEmails.length > 0) {
        return adminEmails;
    }

    return process.env.EMAIL_USER ? [process.env.EMAIL_USER] : [];
};

const logOrderEmailResults = (orderId, results) => {
    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            return;
        }

        console.error('Order email failed:', {
            orderId,
            context: result.reason?.context,
            error: result.reason?.message || result.reason,
        });
    });
};

const sendOrderEmails = async (user, order) => {
    const adminEmails = await getAdminOrderEmailRecipients();

    const tagEmailError = (context, promise) =>
        promise.catch((error) => {
            error.context = context;
            throw error;
        });

    const results = await Promise.allSettled([
        tagEmailError(
            { type: 'customer', recipient: user.email },
            emailService.sendCustomerOrderConfirmation(user, order)
        ),
        tagEmailError(
            { type: 'admin', recipients: adminEmails },
            emailService.sendAdminOrderNotification(adminEmails, user, order)
        ),
    ]);

    logOrderEmailResults(order._id, results);
};

// @desc    Create new order
// @route   POST /api/order
// @access  Private
const createOrder = async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items',
            });
        }

        // Simulating "Paid" status if payment method is "Card"
        const isPaid = paymentMethod === 'Card';
        const paidAt = isPaid ? Date.now() : null;

        const order = new Order({
            user: req.user.id || req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            isPaid,
            paidAt,
        });

        const createdOrder = await order.save();

        // Clear user's cart after successful order
        await Cart.findOneAndUpdate(
            { user: req.user.id || req.user._id },
            { $set: { items: [] } }
        );

        const emailOrder = await Order.findById(createdOrder._id)
            .populate('items.product', 'name image category price');

        try {
            await sendOrderEmails(req.user, emailOrder || createdOrder);
        } catch (emailError) {
            console.error('Order email dispatch failed:', {
                orderId: createdOrder._id,
                error: emailError.message,
            });
        }

        res.status(201).json({
            success: true,
            data: createdOrder,
        });
    } catch (err) {
        console.error('Error in createOrder:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/order/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id || req.user._id }).sort('-createdAt');
        res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/order/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'username email');

        if (order) {
            res.status(200).json({
                success: true,
                data: order,
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/order/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            // First, find users matching the search query
            const matchingUsers = await User.find({
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            // Build order search conditions
            query.$or = [
                { user: { $in: userIds } },
                { status: { $regex: search, $options: 'i' } },
                { 'shippingAddress.city': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
            ];

            // Only add _id matching if search is a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(search)) {
                query.$or.push({ _id: search });
            }
        }

        const orders = await Order.find(query)
            .populate('user', 'username email')
            .populate('items.product', 'name image')
            .sort('-createdAt');
        
        res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/order/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Get all orders
        const orders = await Order.find({});
        
        // Calculate total sales
        const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
        // Count orders by status
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        
        // Count active orders (not delivered or cancelled)
        const activeOrders = orders.filter(order => 
            order.status !== 'Delivered' && order.status !== 'Cancelled'
        ).length;
        
        // Get recent orders (last 10)
        const recentOrders = await Order.find({})
            .populate('user', 'username email')
            .populate('items.product', 'name image')
            .sort('-createdAt')
            .limit(10);
        
        // Calculate monthly sales for the last 6 months
        const monthlySales = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const monthSales = orders
                .filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= monthStart && orderDate <= monthEnd;
                })
                .reduce((sum, order) => sum + order.totalPrice, 0);
            
            monthlySales.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                sales: monthSales
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                totalSales,
                activeOrders,
                totalOrders: orders.length,
                statusCounts,
                recentOrders,
                monthlySales
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/order/admin/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        
        order.status = status;
        
        // If order is delivered, set paid status and date
        if (status === 'Delivered') {
            if (!order.deliveredAt) {
                order.deliveredAt = new Date();
            }
            if (!order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
            }
        }
        
        const updatedOrder = await order.save();
        
        res.status(200).json({
            success: true,
            data: updatedOrder,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Get single order by ID (Admin only)
// @route   GET /api/order/admin/:id
// @access  Private/Admin
const getAdminOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(adminOrderPopulate);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Confirm payment for an order (Admin only)
// @route   PUT /api/order/admin/:id/pay
// @access  Private/Admin
const confirmPayment = async (req, res) => {
    try {
        const { paymentId, receiptUrl, paymentDate } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.paymentConfirmation) {
            return res.status(400).json({
                success: false,
                message: 'Payment has already been confirmed for this order',
            });
        }

        const paidAt = paymentDate ? new Date(paymentDate) : new Date();

        const paymentConfirmation = await PaymentConfirmation.create({
            order: order._id,
            transactionReference: paymentId || '',
            paymentDate: paidAt,
            receiptUrl: receiptUrl || '',
            confirmedBy: req.user._id,
            confirmedAt: new Date(),
        });

        order.isPaid = true;
        order.paidAt = paidAt;
        order.paymentConfirmation = paymentConfirmation._id;

        await order.save();

        const updatedOrder = await Order.findById(order._id).populate(adminOrderPopulate);

        res.status(200).json({
            success: true,
            data: updatedOrder,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    getDashboardStats,
    updateOrderStatus,
    getAdminOrderById,
    confirmPayment,
};
