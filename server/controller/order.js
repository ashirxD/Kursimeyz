const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { getEffectivePrice } = require('../utils/productPricing');
const { resolveFinish } = require('../utils/productFinish');
const { resolveShippingPrice } = require('../utils/shipping');
const {
    MAX_LENGTH: ORDER_NUMBER_MAX_LENGTH,
    normalizeOrderNumber,
    orderNumberFilter,
} = require('../utils/orderNumber');
const PaymentConfirmation = require('../models/PaymentConfirmation');
const emailService = require('../services/emailService');
const { sendError } = require('../middleware/errorHandler');

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

    // Two admin accounts sharing an address, or differing only in case, get one mail.
    const adminEmails = [
        ...new Set(
            admins
                .map((adminUser) => adminUser.email?.trim().toLowerCase())
                .filter(Boolean)
        ),
    ];

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

// Runs after the customer has been answered, so a slow or failing mail server can
// never hold up checkout or turn a placed order into an error. It reloads the
// order with its products (for names and photos) and never throws: whatever goes
// wrong is logged, and the order stands.
const dispatchOrderEmails = async (user, orderId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('items.product', 'name image images category price');

        if (!order) return;

        await sendOrderEmails(user, order);
    } catch (emailError) {
        console.error('Order email dispatch failed:', {
            orderId,
            error: emailError.message,
        });
    }
};

// @desc    Create new order
// @route   POST /api/order
// @access  Private
const createOrder = async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
    } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your order has no items. Please add something to your cart first.',
            });
        }

        // Never trust client-side prices: re-read each product and charge the
        // discounted price whenever one is active.
        const products = await Product.find({
            _id: { $in: items.map((item) => item.product) },
        });
        const productsById = new Map(products.map((product) => [product._id.toString(), product]));

        const missingProduct = items.find((item) => !productsById.has(String(item.product)));
        if (missingProduct) {
            return res.status(400).json({
                success: false,
                message: 'One or more products in your order are no longer available. Please review your cart and try again.',
            });
        }

        const pricedItems = items.map((item) => ({
            product: item.product,
            // Copied, not referenced: an order records the finish that was bought,
            // so editing the product later cannot rewrite its history.
            finish: resolveFinish(productsById.get(String(item.product))),
            quantity: Math.max(1, Number(item.quantity) || 1),
            price: getEffectivePrice(productsById.get(String(item.product))),
        }));

        const itemsPrice = pricedItems.reduce((total, item) => total + item.price * item.quantity, 0);
        // Shipping is read from the city's configured rate for the same reason
        // item prices are re-read above: whatever the client sent is a display
        // value, not an authority. An unlisted city costs nothing here and is
        // flagged so an admin can agree a rate with the customer.
        const { shippingPrice: resolvedShippingPrice, isCustomCity } =
            await resolveShippingPrice(shippingAddress?.city);
        const totalPrice = itemsPrice + resolvedShippingPrice;

        // Simulating "Paid" status if payment method is "Card"
        const isPaid = paymentMethod === 'Card';
        const paidAt = isPaid ? Date.now() : null;

        const order = new Order({
            user: req.user.id || req.user._id,
            items: pricedItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice: resolvedShippingPrice,
            isCustomShippingCity: isCustomCity,
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

        // Deliberately not awaited: see dispatchOrderEmails.
        dispatchOrderEmails(req.user, createdOrder._id);
    } catch (err) {
        console.error('Error in createOrder:', err);
        return sendError(res, err, 'We couldn\'t confirm your order. Please check My Orders before trying again, so you don\'t place it twice.');
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
        return sendError(res, err, 'We couldn\'t load your orders. Please refresh the page and try again.');
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
                message: "We couldn't find that order.",
            });
        }
    } catch (err) {
        return sendError(res, err, 'We couldn\'t load that order. Please try again.');
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
                { orderNumber: { $regex: search, $options: 'i' } },
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
        return sendError(res, err, 'We couldn\'t load the orders. Please refresh the page and try again.');
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
        return sendError(res, err, 'We couldn\'t load the dashboard numbers. Please refresh the page and try again.');
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
                message: "That isn't a valid order status. Please pick one from the list.",
            });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "We couldn't find that order.",
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
        return sendError(res, err, 'We couldn\'t update that order\'s status. Please try again.');
    }
};

// @desc    Set or clear an order's human-readable number (Admin only)
// @route   PUT /api/order/admin/:id/order-number
// @access  Private/Admin
const updateOrderNumber = async (req, res) => {
    try {
        const orderNumber = normalizeOrderNumber(req.body.orderNumber);

        if (orderNumber === null) {
            return res.status(400).json({
                success: false,
                message: `Use up to ${ORDER_NUMBER_MAX_LENGTH} letters, numbers, spaces or - _ / # .`,
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "We couldn't find that order.",
            });
        }

        // Case-insensitive, and ignoring this order, so re-saving the same number
        // or only changing its capitalisation is not reported as a clash.
        if (orderNumber) {
            const clash = await Order.findOne({
                ...orderNumberFilter(orderNumber),
                _id: { $ne: order._id },
            }).select('_id');

            if (clash) {
                return res.status(409).json({
                    success: false,
                    message: `"${orderNumber}" is already used by another order.`,
                });
            }
        }

        // An empty string clears it, putting the order back on its derived label.
        order.orderNumber = orderNumber;

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            data: updatedOrder,
        });
    } catch (err) {
        // The partial unique index catches a duplicate that slipped past the check
        // above between the two queries.
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'That order number was just taken by another order.',
            });
        }

        return sendError(res, err, 'We couldn\'t save that order number. Please try again.');
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
                message: "We couldn't find that order.",
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (err) {
        return sendError(res, err, 'We couldn\'t load that order. Please try again.');
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
                message: "We couldn't find that order.",
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
        return sendError(res, err, 'We couldn\'t confirm that payment. Please try again.');
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    getDashboardStats,
    updateOrderStatus,
    updateOrderNumber,
    getAdminOrderById,
    confirmPayment,
};
