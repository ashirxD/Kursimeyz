const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { isValidPakistaniMobile } = require('../utils/phone');
const { sendError } = require('../middleware/errorHandler');

// Get user cart
const getCart = async (req, res) => {
    console.log('GET /api/cart - User:', req.user?.id || req.user?._id);
    try {
        let cart = await Cart.findOne({ user: req.user.id || req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }
        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (err) {
        return sendError(res, err, 'We couldn\'t load your cart. Please refresh the page and try again.');
    }
};

// Add to cart
const addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    console.log('POST /api/cart/add - Body:', req.body, 'User:', req.user?.id || req.user?._id);

    try {
        if (!isValidPakistaniMobile(req.user?.phone)) {
            return res.status(428).json({
                success: false,
                code: 'PHONE_REQUIRED',
                message: 'Please add a valid Pakistani phone number before adding items to cart',
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "That product isn't available any more. It may have been removed.",
            });
        }

        let cart = await Cart.findOne({ user: req.user.id || req.user._id });
        console.log('Found cart:', cart ? 'Yes' : 'No');

        if (!cart) {
            console.log('Creating new cart for user:', req.user.id);
            cart = await Cart.create({
                user: req.user.id,
                items: [{ product: productId, quantity }],
            });
            console.log('New cart created successfully');
        } else {
            console.log('Existing cart found, items before:', cart.items.length);
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
                console.log('Updated existing item quantity');
            } else {
                cart.items.push({ product: productId, quantity });
                console.log('Added new item to existing cart');
            }
            cart.updatedAt = Date.now();
            await cart.save();
            console.log('Cart saved successfully');
        }

        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (err) {
        console.error('CRITICAL: Error in addToCart:', err);
        return sendError(res, err, 'We couldn\'t add that to your cart. Please try again.');
    }
};

// Update cart item quantity
const updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Please choose a quantity of 1 or more.',
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "We couldn't find your cart. Please refresh the page and try again.",
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "That item isn't in your cart any more.",
            });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (err) {
        return sendError(res, err, 'We couldn\'t update that quantity. Please try again.');
    }
};

// Remove from cart
const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "We couldn't find your cart. Please refresh the page and try again.",
            });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );
        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (err) {
        return sendError(res, err, 'We couldn\'t remove that from your cart. Please try again.');
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            cart.updatedAt = Date.now();
            await cart.save();
        }

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
        });
    } catch (err) {
        return sendError(res, err, 'We couldn\'t clear your cart. Please try again.');
    }
};

module.exports = {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
};
