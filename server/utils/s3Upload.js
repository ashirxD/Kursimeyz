const path = require('path');
const { randomUUID } = require('crypto');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getS3Client, getBucketName, getRegion } = require('../config/s3');

// Admins can upload any image format. Some browsers/OSes report an empty or
// generic MIME type for newer formats (HEIC, AVIF, ...), so a known image
// extension is accepted too.
const IMAGE_EXTENSION_TO_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.png': 'image/png',
  '.apng': 'image/apng',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.ico': 'image/x-icon',
  '.jxl': 'image/jxl',
};

const IMAGE_ERROR_MESSAGE = 'Only image files are allowed';

const isImageMimeType = (mimetype) =>
  typeof mimetype === 'string' && mimetype.toLowerCase().startsWith('image/');

const getSafeExtension = (name = '') => {
  const ext = path.extname(name).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : '';
};

const resolveContentType = ({ mimetype, originalname }) => {
  if (isImageMimeType(mimetype)) return mimetype.toLowerCase();
  return IMAGE_EXTENSION_TO_MIME[getSafeExtension(originalname)] || null;
};

const buildObjectKey = (originalName = 'image', contentType = '') => {
  let ext = getSafeExtension(originalName);
  if (!ext && contentType.startsWith('image/')) {
    const subtype = contentType.slice('image/'.length).split('+')[0].replace(/[^a-z0-9]/g, '');
    ext = subtype ? `.${subtype === 'jpeg' ? 'jpg' : subtype}` : '';
  }
  return `uploads/${Date.now()}-${randomUUID()}${ext || '.img'}`;
};

const getPublicUrl = (key) => {
  const bucket = getBucketName();
  const region = getRegion();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isPermanentS3Error = (err) => [
  'AccessDenied',
  'NoSuchBucket',
  'InvalidAccessKeyId',
  'SignatureDoesNotMatch',
].includes(err.name);

const isRetriableS3Error = (err) => {
  if (isPermanentS3Error(err)) return false;
  if (err.$retryable) return true;

  return [
    'TimeoutError',
    'RequestTimeout',
    'NetworkingError',
    'ECONNRESET',
    'ETIMEDOUT',
    'EPIPE',
    'ENOTFOUND',
    'ServiceUnavailable',
    'SlowDown',
  ].includes(err.name || err.code);
};

const validateImageFile = ({ mimetype, originalname }) => {
  if (!resolveContentType({ mimetype, originalname })) {
    throw new Error(IMAGE_ERROR_MESSAGE);
  }
};

const uploadImageBuffer = async ({ buffer, mimetype, originalname }) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('No file uploaded');
  }

  validateImageFile({ mimetype, originalname });

  const contentType = resolveContentType({ mimetype, originalname });
  const key = buildObjectKey(originalname, contentType);

  try {
    const command = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await getS3Client().send(command);
    } catch (err) {
      if (!isRetriableS3Error(err)) {
        throw err;
      }

      console.warn('Retrying S3 upload after transient failure:', err.name, err.message);
      await sleep(350);
      await getS3Client().send(command);
    }
  } catch (err) {
    console.error('S3 upload failed:', err.name, err.message);

    if (err.name === 'AccessDenied') {
      throw new Error(
        'S3 access denied: IAM user needs s3:PutObject permission on this bucket'
      );
    }
    if (err.name === 'NoSuchBucket') {
      throw new Error('S3 bucket not found: check AWS_BUCKET_NAME and AWS_REGION');
    }
    if (err.name === 'InvalidAccessKeyId' || err.name === 'SignatureDoesNotMatch') {
      throw new Error('Invalid AWS credentials: check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    }

    throw new Error('Failed to upload image to storage');
  }

  return getPublicUrl(key);
};

module.exports = {
  buildObjectKey,
  getPublicUrl,
  validateImageFile,
  uploadImageBuffer,
  resolveContentType,
  IMAGE_ERROR_MESSAGE,
};
