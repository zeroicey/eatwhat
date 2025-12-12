const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { error } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Attach user info to request
    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    return error(res, 'Authentication failed', 401);
  }
};

module.exports = authMiddleware;
