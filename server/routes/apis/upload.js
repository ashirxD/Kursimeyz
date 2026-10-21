const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../../controller/upload');
const uploadMiddleware = require('../../utils/multer');
const { protect, admin } = require('../../middleware/auth');
const { sendError } = require('../../middleware/errorHandler');
const { AppError } = require('../../utils/errors');
const { IMAGE_ERROR_MESSAGE } = require('../../utils/s3Upload');

// Multer's own errors (too big, too many) are translated by the shared handler.
// Anything else it raises is our fileFilter rejecting a non-image, whose message
// is already written for people.
const toUploadError = (err, res) =>
  sendError(
    res,
    err instanceof multer.MulterError
      ? err
      : new AppError(
          err.message === IMAGE_ERROR_MESSAGE || !err.message
            ? "That file isn't an image. Please choose a JPG, PNG, WEBP or a similar picture."
            : err.message,
          { statusCode: 400, code: 'NOT_AN_IMAGE' }
        )
  );

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

// POST /api/upload - Handles single image upload. Admin-only: an open upload
// endpoint lets anyone fill the bucket, or host whatever they like from it.
router.post('/', protect, admin, handleUpload, uploadController.uploadImage);

// POST /api/upload/multiple - Handles a batch of gallery images
router.post('/multiple', protect, admin, handleMultiUpload, uploadController.uploadImages);

module.exports = router;
