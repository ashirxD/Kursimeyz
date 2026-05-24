const { S3Client } = require('@aws-sdk/client-s3');

const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_BUCKET_NAME',
];

const assertS3Config = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required AWS environment variables: ${missing.join(', ')}`);
  }
};

let s3Client = null;

const getS3Client = () => {
  assertS3Config();
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

const getBucketName = () => {
  assertS3Config();
  return process.env.AWS_BUCKET_NAME;
};

const getRegion = () => {
  assertS3Config();
  return process.env.AWS_REGION;
};

module.exports = {
  assertS3Config,
  getS3Client,
  getBucketName,
  getRegion,
};
