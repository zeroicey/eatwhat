/**
 * Application constants
 */

module.exports = {
  // Menu item status
  MENU_STATUS: {
    ACTIVE: 'active',
    PENDING: 'pending',
    HIDDEN: 'hidden',
  },

  // Interaction types
  INTERACTION_TYPE: {
    LIKE: 'like',
    REPORT: 'report',
  },

  // Sort options for stores
  STORE_SORT: {
    UPDATED: 'updated',
    DISTANCE: 'distance',
  },

  // File size limits (in bytes)
  FILE_SIZE_LIMITS: {
    IMAGE: 5 * 1024 * 1024, // 5MB
  },

  // Allowed image extensions
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'webp'],

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Report threshold for menu items
  REPORT_THRESHOLD: 5,

  // Image limits
  MAX_MOMENT_IMAGES: 9,
  MAX_MENU_IMAGES: 10,
};
