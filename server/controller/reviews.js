const Order = require('../models/Order');
const Product = require('../models/Product');
const ProductReview = require('../models/ProductReview');
const { orderLabel } = require('../utils/orderNumber');

const getUserId = (req) => req.user.id || req.user._id;

const dedupeOrderProducts = (items) => {
    const map = new Map();
    for (const item of items) {
        const product = item.product;
        if (!product) continue;
        const productId = product._id.toString();
        if (map.has(productId)) {
            map.get(productId).quantity += item.quantity;
        } else {
            map.set(productId, {
                productId,
                name: product.name,
                image: product.image,
                quantity: item.quantity,
            });
        }
    }
    return Array.from(map.values());
};

// @desc    Get delivered orders with products still needing review
// @route   GET /api/reviews/pending
// @access  Private
const getPendingReviews = async (req, res) => {
    try {
        const userId = getUserId(req);
        const now = new Date();

        const orders = await Order.find({
            user: userId,
            status: 'Delivered',
            reviewsSkippedAt: null,
            $or: [
                { reviewPromptSnoozedUntil: null },
                { reviewPromptSnoozedUntil: { $lte: now } },
            ],
        })
            .populate('items.product', 'name image')
            .sort({ deliveredAt: 1, updatedAt: 1 });

        const pendingOrders = [];

        for (const order of orders) {
            const products = dedupeOrderProducts(order.items);
            if (products.length === 0) continue;

            const existingReviews = await ProductReview.find({
                user: userId,
                order: order._id,
            }).select('product');

            const reviewedProductIds = new Set(
                existingReviews.map((r) => r.product.toString())
            );

            const unratedProducts = products.filter(
                (p) => !reviewedProductIds.has(p.productId)
            );

            if (unratedProducts.length > 0) {
                pendingOrders.push({
                    orderId: order._id,
                    orderShortId: orderLabel(order, 6),
                    products: unratedProducts,
                });
            }
        }

        res.status(200).json({
            success: true,
            data: pendingOrders,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Submit product reviews for a delivered order
// @route   POST /api/reviews
// @access  Private
const submitReviews = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { orderId, reviews } = req.body;

        if (!orderId || !Array.isArray(reviews) || reviews.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'orderId and reviews array are required',
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this order',
            });
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Reviews can only be submitted for delivered orders',
            });
        }

        const orderProductIds = new Set(
            order.items.map((item) => item.product.toString())
        );

        const validatedReviews = [];

        for (const review of reviews) {
            const { productId, rating, comment } = review;

            if (!productId || !orderProductIds.has(productId.toString())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product for this order',
                });
            }

            const numericRating = Number(rating);
            if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be an integer between 1 and 5',
                });
            }

            const existing = await ProductReview.findOne({
                user: userId,
                order: orderId,
                product: productId,
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reviewed one or more of these products for this order',
                });
            }

            validatedReviews.push({
                productId,
                numericRating,
                comment: (comment || '').trim().slice(0, 500),
            });
        }

        for (const { productId, numericRating, comment } of validatedReviews) {
            await ProductReview.create({
                user: userId,
                order: orderId,
                product: productId,
                rating: numericRating,
                comment,
            });

            const product = await Product.findById(productId);
            if (product) {
                const oldCount = product.ratingCount || 0;
                const oldAvg = product.averageRating || 0;
                const newCount = oldCount + 1;
                const newAvg = (oldAvg * oldCount + numericRating) / newCount;

                product.ratingCount = newCount;
                product.averageRating = Math.round(newAvg * 10) / 10;
                await product.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Reviews submitted successfully',
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed one or more of these products for this order',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Snooze review prompt for an order
// @route   POST /api/reviews/snooze/:orderId
// @access  Private
const snoozeReviewPrompt = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { orderId } = req.params;
        const hours = Number(req.body.hours) || 24;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        const snoozeUntil = new Date();
        snoozeUntil.setHours(snoozeUntil.getHours() + hours);
        order.reviewPromptSnoozedUntil = snoozeUntil;
        await order.save();

        res.status(200).json({
            success: true,
            data: { reviewPromptSnoozedUntil: order.reviewPromptSnoozedUntil },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// @desc    Permanently skip review prompt for an order
// @route   POST /api/reviews/skip/:orderId
// @access  Private
const skipReviewPrompt = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        order.reviewsSkippedAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Review prompt skipped for this order',
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
    getPendingReviews,
    submitReviews,
    snoozeReviewPrompt,
    skipReviewPrompt,
};
