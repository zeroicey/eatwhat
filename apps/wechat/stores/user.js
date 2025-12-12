import { defineStore } from 'pinia'

/**
 * User Store - 用户状态管理
 * 职责：用户认证信息、个人资料、登录状态
 * 持久化：Token 存储到 SecureStorage，个人资料存储到 LocalStorage
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    userInfo: null,
    // JWT Token
    token: null,
    // 登录时间戳
    loginTime: null,
    // 是否已认证
    isAuthenticated: false
  }),

  getters: {
    /**
     * 获取用户ID
     */
    userId: (state) => state.userInfo?.id || null,

    /**
     * 获取用户昵称
     */
    nickname: (state) => state.userInfo?.nickname || '',

    /**
     * 获取用户头像
     */
    avatar: (state) => state.userInfo?.avatar || '',

    /**
     * 检查是否登录
     */
    isLoggedIn: (state) => {
      return state.isAuthenticated && state.token !== null
    },

    /**
     * 检查 Token 是否过期（7天）
     */
    isTokenExpired: (state) => {
      if (!state.loginTime) return true
      const expiryTime = 7 * 24 * 60 * 60 * 1000 // 7天
      return Date.now() - state.loginTime > expiryTime
    }
  },

  actions: {
    /**
     * 登录
     * @param {Object} payload - { token, userInfo }
     */
    login(payload) {
      this.token = payload.token
      this.userInfo = payload.userInfo
      this.loginTime = Date.now()
      this.isAuthenticated = true

      // Token 存储到 SecureStorage（如果可用）
      try {
        uni.setStorageSync('auth_token', payload.token)
      } catch (error) {
        console.error('Failed to store token:', error)
      }
    },

    /**
     * 登出
     */
    logout() {
      this.token = null
      this.userInfo = null
      this.loginTime = null
      this.isAuthenticated = false

      // 清除存储的 Token
      try {
        uni.removeStorageSync('auth_token')
      } catch (error) {
        console.error('Failed to remove token:', error)
      }
    },

    /**
     * 更新用户资料
     * @param {Object} userInfo - 用户信息
     */
    updateProfile(userInfo) {
      this.userInfo = {
        ...this.userInfo,
        ...userInfo
      }
    },

    /**
     * 刷新 Token
     * @param {String} newToken - 新的 Token
     */
    refreshToken(newToken) {
      this.token = newToken
      this.loginTime = Date.now()

      try {
        uni.setStorageSync('auth_token', newToken)
      } catch (error) {
        console.error('Failed to refresh token:', error)
      }
    },

    /**
     * 检查认证状态
     * @returns {Boolean} 是否已认证且 Token 有效
     */
    checkAuth() {
      if (!this.isAuthenticated || !this.token) {
        return false
      }

      if (this.isTokenExpired) {
        // Token 过期，自动登出
        this.logout()
        return false
      }

      return true
    },

    /**
     * 从存储恢复 Token
     */
    restoreToken() {
      try {
        const token = uni.getStorageSync('auth_token')
        if (token && this.userInfo) {
          this.token = token
          this.isAuthenticated = true
        }
      } catch (error) {
        console.error('Failed to restore token:', error)
      }
    }
  },

  // 持久化配置 - 使用 UniApp 本地存储
  // 注意：需要在 store 初始化时手动恢复状态
  persist: false  // 暂时关闭自动持久化，使用手动方式
})
