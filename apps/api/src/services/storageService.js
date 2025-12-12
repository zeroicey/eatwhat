const { minioClient, buckets } = require('../config/minio');
const { generateFileName, getFileExtension, isValidImageType } = require('../utils/helpers');
const { ALLOWED_IMAGE_TYPES } = require('../utils/constants');

class StorageService {
  /**
   * Generate presigned URL for uploading
   */
  async getUploadUrl(userId, bucket, fileType) {
    try {
      // Validate file type
      const extension = fileType.toLowerCase();
      if (!isValidImageType(extension, ALLOWED_IMAGE_TYPES)) {
        throw new Error(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
      }

      // Validate bucket
      if (!Object.values(buckets).includes(bucket)) {
        throw new Error('Invalid bucket name');
      }

      // Generate file name
      const fileName = generateFileName(userId, extension);

      // Generate presigned URL (valid for 5 minutes)
      const presignedUrl = await minioClient.presignedPutObject(bucket, fileName, 5 * 60);

      // Construct public access URL
      const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
      const endpoint = process.env.MINIO_ENDPOINT;
      const port = process.env.MINIO_PORT;
      const accessUrl = `${protocol}://${endpoint}:${port}/${bucket}/${fileName}`;

      return {
        uploadUrl: presignedUrl,
        accessUrl,
        fileName,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get presigned URL for accessing private files (not needed in current scenario)
   */
  async getAccessUrl(bucket, fileName) {
    try {
      // Generate presigned URL (valid for 1 hour)
      const presignedUrl = await minioClient.presignedGetObject(bucket, fileName, 60 * 60);
      return presignedUrl;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StorageService();
