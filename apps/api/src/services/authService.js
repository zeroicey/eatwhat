const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const wechatConfig = require('../config/wechat');
const jwtConfig = require('../config/jwt');

class AuthService {
  /**
   * WeChat login
   */
  async wechatLogin(code, userInfo = {}) {
    try {
      // Call WeChat code2Session API
      const response = await axios.get(wechatConfig.code2SessionUrl, {
        params: {
          appid: wechatConfig.appId,
          secret: wechatConfig.secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      const { openid, session_key, errcode, errmsg } = response.data;

      if (errcode) {
        throw new Error(`WeChat API error: ${errmsg}`);
      }

      // Find or create user
      let user = await User.findOne({ openId: openid });

      if (!user) {
        user = await User.create({
          openId: openid,
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
        });
      } else if (userInfo.nickName || userInfo.avatarUrl) {
        // Update user info if provided
        if (userInfo.nickName) user.nickName = userInfo.nickName;
        if (userInfo.avatarUrl) user.avatarUrl = userInfo.avatarUrl;
        await user.save();
      }

      // Generate JWT token
      const token = this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      return {
        user: {
          id: user._id,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.secret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign({ userId }, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  }
}

module.exports = new AuthService();
