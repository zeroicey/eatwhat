const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const authMiddleware = require('../middlewares/auth');
const { uploadLimiter } = require('../middlewares/rateLimit');

// All storage routes require authentication
router.post(
  '/upload-url',
  authMiddleware,
  uploadLimiter,
  storageController.getUploadUrl.bind(storageController)
);
router.post('/access-url', authMiddleware, storageController.getAccessUrl.bind(storageController));

module.exports = router;
