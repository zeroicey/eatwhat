const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Buckets configuration
const buckets = {
  storeImages: process.env.MINIO_BUCKET_STORE_IMAGES,
  momentImages: process.env.MINIO_BUCKET_MOMENT_IMAGES,
  avatars: process.env.MINIO_BUCKET_AVATARS,
};

// Initialize buckets
const initializeBuckets = async () => {
  try {
    for (const [key, bucketName] of Object.entries(buckets)) {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`Bucket created: ${bucketName}`);

        // Set public read policy for all buckets
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`Bucket policy set for: ${bucketName}`);
      } else {
        console.log(`Bucket already exists: ${bucketName}`);
      }
    }
  } catch (error) {
    console.error('Error initializing buckets:', error);
  }
};

module.exports = {
  minioClient,
  buckets,
  initializeBuckets,
};
