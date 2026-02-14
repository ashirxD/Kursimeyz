const express = require('express');
const router = express.Router();
const uploadController = require('../../controller/upload');
const uploadMiddleware = require('../../utils/multer');

// POST /api/upload - Handles single image upload
router.post('/', uploadMiddleware.single('image'), uploadController.uploadImage);

module.exports = router;
