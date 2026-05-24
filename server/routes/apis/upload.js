const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../../controller/upload');
const uploadMiddleware = require('../../utils/multer');

const handleUpload = (req, res, next) => {
  uploadMiddleware.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File must be less than 5MB' });
      }
      return res.status(400).json({ message: err.message });
    }

    if (err) {
      return res.status(400).json({ message: err.message });
    }

    next();
  });
};

// POST /api/upload - Handles single image upload
router.post('/', handleUpload, uploadController.uploadImage);

module.exports = router;
