const authService = require('../services/authService');
const { success, error } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, password, nickName, avatarUrl } = req.body || {};
      if (!username || !password) {
        return error(res, 'Username and password are required', 400);
      }
      const result = await authService.register(username, password, { nickName, avatarUrl });
      return success(res, result, 'Register successful');
    } catch (err) {
      if (err.code === 'USER_EXISTS') {
        return error(res, 'Username already exists', 400);
      }
      next(err);
    }
  }

  async passwordLogin(req, res, next) {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return error(res, 'Username and password are required', 400);
      }
      const result = await authService.passwordLogin(username, password);
      return success(res, result, 'Login successful');
    } catch (err) {
      if (err.code === 'USER_NOT_FOUND') {
        return error(res, 'User not found', 404);
      }
      if (err.code === 'INVALID_PASSWORD') {
        return error(res, 'Invalid password', 401);
      }
      next(err);
    }
  }
}

module.exports = new AuthController();
