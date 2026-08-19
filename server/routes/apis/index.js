const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const productTypeRoutes = require('./productTypes');
const aboutPageRoutes = require('./aboutPage');
const homePageRoutes = require('./homePage');
const uploadRoutes = require('./upload');
const cartRoutes = require('./cart');
const orderRoutes = require('./order');
const reviewRoutes = require('./reviews');
const userRoutes = require('./user');

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/product-types', productTypeRoutes);
router.use('/about-page', aboutPageRoutes);
router.use('/home-page', homePageRoutes);
router.use('/upload', uploadRoutes);
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/user', userRoutes);

module.exports = router;
