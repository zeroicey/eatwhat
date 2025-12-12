const storageService = require('../services/storageService');
const { success, error } = require('../utils/response');
const { buckets } = require('../config/minio');

class StorageController {
  /**
   * POST /api/storage/upload-url
   */
  async getUploadUrl(req, res, next) {
    try {
      const { bucket, fileType } = req.body;

      if (!bucket || !fileType) {
        return error(res, 'Bucket and fileType are required', 400);
      }

      const result = await storageService.getUploadUrl(req.userId, bucket, fileType);

      return success(res, result, 'Upload URL generated successfully');
    } catch (err) {
      if (err.message.includes('Invalid')) {
        return error(res, err.message, 400);
      }
      next(err);
    }
  }

  /**
   * POST /api/storage/access-url
   */
  async getAccessUrl(req, res, next) {
    try {
      const { bucket, fileName } = req.body;

      if (!bucket || !fileName) {
        return error(res, 'Bucket and fileName are required', 400);
      }

      const url = await storageService.getAccessUrl(bucket, fileName);

      return success(res, { accessUrl: url }, 'Access URL generated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StorageController();
