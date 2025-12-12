const crypto = require('crypto');

/**
 * Generate a random string
 */
const generateRandomString = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate file name with user ID, timestamp, and random string
 */
const generateFileName = (userId, extension) => {
  const timestamp = Date.now();
  const randomStr = generateRandomString(8);
  return `${userId}_${timestamp}_${randomStr}.${extension}`;
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Validate file type
 */
const isValidImageType = (extension, allowedTypes) => {
  return allowedTypes.includes(extension);
};

module.exports = {
  generateRandomString,
  generateFileName,
  getFileExtension,
  isValidImageType,
};
