const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const bcrypt = require('bcryptjs');

class AuthService {
  async register(username, password, profile = {}) {
    const exists = await User.findOne({ username });
    if (exists) {
      const err = new Error('User exists');
      err.code = 'USER_EXISTS';
      throw err;
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      passwordHash: hash,
      nickName: profile.nickName || '',
      avatarUrl: profile.avatarUrl || '',
    });
    const token = this.generateToken(user._id);
    return {
      user: {
        id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        username: user.username,
      },
      token,
    };
  }

  async passwordLogin(username, password) {
    const user = await User.findOne({ username });
    if (!user) {
      const err = new Error('User not found');
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) {
      const err = new Error('Invalid password');
      err.code = 'INVALID_PASSWORD';
      throw err;
    }
    const token = this.generateToken(user._id);
    return {
      user: {
        id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        username: user.username,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  }

}

module.exports = new AuthService();
