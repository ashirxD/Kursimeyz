const multer = require('multer');
const { resolveContentType, IMAGE_ERROR_MESSAGE } = require('./s3Upload');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (resolveContentType({ mimetype: file.mimetype, originalname: file.originalname })) {
    cb(null, true);
    return;
  }
  cb(new Error(IMAGE_ERROR_MESSAGE));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
