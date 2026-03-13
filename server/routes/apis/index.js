const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const productRoutes = require('./products');
const uploadRoutes = require('./upload');
const cartRoutes = require('./cart');
const orderRoutes = require('./order');
const userRoutes = require('./user');

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/upload', uploadRoutes);
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);
router.use('/user', userRoutes);

module.exports = router;
