const Order = require('../models/Order');
const Cart = require('../models/Cart');

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
        const orders = await Order.find({})
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
        if (status === 'Delivered' && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
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

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    getDashboardStats,
    updateOrderStatus
};
