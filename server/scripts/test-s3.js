require('dotenv').config();
const { S3Client, HeadBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

(async () => {
  console.log('Region:', process.env.AWS_REGION);
  console.log('Bucket:', process.env.AWS_BUCKET_NAME);
  console.log('Has access key:', Boolean(process.env.AWS_ACCESS_KEY_ID));
  console.log('Has secret:', Boolean(process.env.AWS_SECRET_ACCESS_KEY));

  try {
    await client.send(new HeadBucketCommand({ Bucket: process.env.AWS_BUCKET_NAME }));
    console.log('HeadBucket: OK');
  } catch (e) {
    console.log('HeadBucket failed');
    console.log('  name:', e.name);
    console.log('  message:', e.message);
    console.log('  httpStatus:', e.$metadata?.httpStatusCode);
    console.log('  requestId:', e.$metadata?.requestId);
    if (e.cause) console.log('  cause:', e.cause.message || e.cause);
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/test-${Date.now()}.txt`,
        Body: Buffer.from('test'),
        ContentType: 'text/plain',
      })
    );
    console.log('PutObject: OK');
  } catch (e) {
    console.log('PutObject failed');
    console.log('  name:', e.name);
    console.log('  message:', e.message);
    console.log('  httpStatus:', e.$metadata?.httpStatusCode);
    if (e.cause) console.log('  cause:', e.cause.message || e.cause);
  }
})();
