/**
 * 认证相关 API
 */
import { post, get } from './request'

/**
 * 微信登录
 * @param {String} code - 微信登录 code
 * @returns {Promise}
 */
export function wechatLogin(code) {
  return post('/auth/wechat/login', { code })
}

/**
 * 刷新 Token
 * @param {String} refreshToken - 刷新令牌
 * @returns {Promise}
 */
export function refreshToken(refreshToken) {
  return post('/auth/refresh', { refreshToken })
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return get('/auth/me')
}

/**
 * 更新用户资料
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function updateUserProfile(data) {
  return post('/auth/profile', data)
}
