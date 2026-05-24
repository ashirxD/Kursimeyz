const path = require('path');
const { randomUUID } = require('crypto');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getS3Client, getBucketName, getRegion } = require('../config/s3');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const buildObjectKey = (originalName = 'image') => {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.jpg';
  return `uploads/${Date.now()}-${randomUUID()}${safeExt}`;
};

const getPublicUrl = (key) => {
  const bucket = getBucketName();
  const region = getRegion();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const validateImageFile = ({ mimetype, originalname }) => {
  if (!mimetype || !ALLOWED_MIME_TYPES.has(mimetype)) {
    throw new Error('Only jpg, jpeg, png, and webp images are allowed');
  }

  const ext = path.extname(originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Only jpg, jpeg, png, and webp images are allowed');
  }

  const expectedExt = MIME_TO_EXT[mimetype];
  if (expectedExt && ext !== expectedExt && !(mimetype === 'image/jpeg' && ext === '.jpg')) {
    throw new Error('File extension does not match file type');
  }
};

const uploadImageBuffer = async ({ buffer, mimetype, originalname }) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('No file uploaded');
  }

  validateImageFile({ mimetype, originalname });

  const key = buildObjectKey(originalname);

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );
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
  ALLOWED_MIME_TYPES,
};
