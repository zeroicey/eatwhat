const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload URL rate limiter (stricter)
const uploadLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 10,
  message: {
    success: false,
    message: 'Too many upload requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  uploadLimiter,
  authLimiter,
};
