const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Optional auth middleware: attach req.userId if token is valid; otherwise continue without error.
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, jwtConfig.secret);
      req.userId = decoded.userId;
      req.user = decoded;
    }
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
};

