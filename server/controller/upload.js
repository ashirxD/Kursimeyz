const { uploadImageBuffer, IMAGE_ERROR_MESSAGE } = require('../utils/s3Upload');
const { AppError } = require('../utils/errors');
const { sendError } = require('../middleware/errorHandler');

// The storage layer reports problems as plain Errors with developer-facing text
// ("IAM user needs s3:PutObject permission…"). That text belongs in the log, not
// in front of an admin mid-upload, so each failure is turned into what the person
// can actually do about it. The original error is kept as `cause` for the log.
const describeUploadFailure = (error) => {
  const message = error?.message || '';

  if (message === 'No file uploaded') {
    return new AppError('Please choose an image to upload.', { statusCode: 400, code: 'NO_FILE' });
  }

  if (message === IMAGE_ERROR_MESSAGE) {
    return new AppError(
      "That file isn't an image. Please choose a JPG, PNG, WEBP or a similar picture.",
      { statusCode: 400, code: 'NOT_AN_IMAGE' }
    );
  }

  if (message.includes('AWS environment variables')) {
    return new AppError(
      "Image uploads aren't set up on the server yet. Please contact the site developer.",
      { statusCode: 503, code: 'UPLOAD_NOT_CONFIGURED', cause: error }
    );
  }

  if (
    message.includes('S3 access denied') ||
    message.includes('S3 bucket not found') ||
    message.includes('Invalid AWS credentials')
  ) {
    return new AppError(
      "Image storage isn't set up correctly, so the upload was refused. Please contact the site developer.",
      { statusCode: 502, code: 'STORAGE_REJECTED', cause: error }
    );
  }

  if (message === 'Failed to upload image to storage') {
    return new AppError("We couldn't save your image right now. Please try again in a moment.", {
      statusCode: 502,
      code: 'STORAGE_ERROR',
      cause: error,
    });
  }

  // Anything else is not something we recognise; let the shared handler decide.
  return error;
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, describeUploadFailure(new Error('No file uploaded')));
    }

    const url = await uploadImageBuffer({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    res.json({
      message: 'File uploaded successfully',
      url,
    });
  } catch (error) {
    return sendError(res, describeUploadFailure(error), "We couldn't upload that image. Please try again.");
  }
};

// Uploads a batch of gallery images, preserving the order they were sent in.
const uploadImages = async (req, res) => {
  try {
    const files = req.files || [];

    if (files.length === 0) {
      return sendError(res, describeUploadFailure(new Error('No file uploaded')));
    }

    const urls = await Promise.all(
      files.map((file) =>
        uploadImageBuffer({
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
        })
      )
    );

    res.json({
      message: 'Files uploaded successfully',
      urls,
    });
  } catch (error) {
    return sendError(res, describeUploadFailure(error), "We couldn't upload those images. Please try again.");
  }
};

module.exports = {
  uploadImage,
  uploadImages,
};
