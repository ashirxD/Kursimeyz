const multer = require('multer');
const { ALLOWED_MIME_TYPES } = require('./s3Upload');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only jpg, jpeg, png, and webp images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
