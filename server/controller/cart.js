const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user cart
exports.getCart = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    console.log('POST /api/cart/add - Body:', req.body, 'User:', req.user?.id || req.user?._id);

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
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
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// Update cart item quantity
exports.updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1',
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
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
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
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
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message,
        });
    }
};
