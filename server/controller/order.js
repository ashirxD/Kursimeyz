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

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById
};
