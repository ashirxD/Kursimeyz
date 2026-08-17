const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../../controller/upload');
const uploadMiddleware = require('../../utils/multer');

const toUploadError = (err, res) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File must be less than 5MB' });
    }
    return res.status(400).json({ message: err.message });
  }

  return res.status(400).json({ message: err.message });
};

const handleUpload = (req, res, next) => {
  uploadMiddleware.single('image')(req, res, (err) => {
    if (err) {
      return toUploadError(err, res);
    }

    next();
  });
};

const handleMultiUpload = (req, res, next) => {
  uploadMiddleware.array('images')(req, res, (err) => {
    if (err) {
      return toUploadError(err, res);
    }

    next();
  });
};

// POST /api/upload - Handles single image upload
router.post('/', handleUpload, uploadController.uploadImage);

// POST /api/upload/multiple - Handles a batch of gallery images
router.post('/multiple', handleMultiUpload, uploadController.uploadImages);

module.exports = router;
