const authService = require('../services/authService');
const { success, error } = require('../utils/response');

class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { code, userInfo } = req.body;

      if (!code) {
        return error(res, 'Code is required', 400);
      }

      const result = await authService.wechatLogin(code, userInfo);

      return success(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return error(res, 'Refresh token is required', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      return success(res, result, 'Token refreshed');
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return error(res, 'Invalid or expired refresh token', 401);
      }
      next(err);
    }
  }
}

module.exports = new AuthController();
