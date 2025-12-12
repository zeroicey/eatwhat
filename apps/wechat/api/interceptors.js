/**
 * 请求拦截器
 * 处理请求前的统一逻辑：添加 Token、通用请求头等
 */
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

/**
 * 请求拦截器
 * @param {Object} config - 请求配置
 * @returns {Object} 处理后的配置
 */
export function requestInterceptor(config) {
  const userStore = useUserStore()
  const appStore = useAppStore()

  // 添加 Authorization Header
  if (userStore.token) {
    config.header = config.header || {}
    config.header['Authorization'] = `Bearer ${userStore.token}`
  }

  // 添加通用请求头
  config.header = {
    ...config.header,
    'Content-Type': 'application/json',
    'X-Platform': 'mp-weixin',
    'X-Version': '1.0.0',
    'X-Device-Id': getDeviceId()
  }

  // 开发环境日志
  if (process.env.NODE_ENV === 'development') {
    console.log('[Request]', config.method, config.url, config.data)
  }

  return config
}

/**
 * 响应拦截器
 * @param {Object} response - 响应对象
 * @returns {Promise} 处理后的数据
 */
export function responseInterceptor(response) {
  const appStore = useAppStore()
  if (process.env.NODE_ENV === 'development') {
    console.log('[Response]', response.statusCode, response.data)
  }
  if (response.statusCode >= 200 && response.statusCode < 300) {
    const payload = response.data || {}
    const { success, data, message, code } = payload
    if (typeof success === 'boolean') {
      if (success) {
        return Promise.resolve(data)
      } else {
        handleBusinessError(code ?? -1, message)
        return Promise.reject({ code: code ?? -1, message })
      }
    }
    if (code === 0 || code === 200) {
      return Promise.resolve(data)
    }
    handleBusinessError(code ?? -1, message)
    return Promise.reject({ code: code ?? -1, message })
  } else {
    handleHttpError(response.statusCode)
    return Promise.reject(response)
  }
}

/**
 * 错误拦截器
 * @param {Object} error - 错误对象
 * @returns {Promise} 拒绝的Promise
 */
export function errorInterceptor(error) {
  const appStore = useAppStore()

  console.error('[Request Error]', error)

  // 网络错误处理
  if (error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      appStore.showToast({
        message: 'Request timeout',
        type: 'error'
      })
    } else if (error.errMsg.includes('fail')) {
      appStore.showToast({
        message: 'Network error',
        type: 'error'
      })
    }
  }

  return Promise.reject(error)
}

/**
 * 处理 HTTP 错误
 * @param {Number} statusCode - HTTP 状态码
 */
function handleHttpError(statusCode) {
  const appStore = useAppStore()
  const userStore = useUserStore()

  let message = 'Unknown error'

  switch (statusCode) {
    case 400:
      message = 'Bad request'
      break
    case 401:
      message = 'Unauthorized'
      // Token 过期，跳转登录
      userStore.logout()
      uni.reLaunch({
        url: '/pages/auth/login'
      })
      break
    case 403:
      message = 'Forbidden'
      break
    case 404:
      message = 'Not found'
      break
    case 500:
      message = 'Server error'
      break
    case 502:
      message = 'Bad gateway'
      break
    case 503:
      message = 'Service unavailable'
      break
    default:
      message = `HTTP Error: ${statusCode}`
  }

  appStore.showToast({
    message,
    type: 'error'
  })
}

/**
 * 处理业务错误
 * @param {Number} code - 业务错误码
 * @param {String} message - 错误消息
 */
function handleBusinessError(code, message) {
  const appStore = useAppStore()

  // 根据业务错误码进行不同处理
  // 可根据实际业务需求扩展

  appStore.showToast({
    message: message || 'Operation failed',
    type: 'error'
  })
}

/**
 * 获取设备ID
 * @returns {String} 设备ID
 */
function getDeviceId() {
  let deviceId = uni.getStorageSync('device_id')
  
  if (!deviceId) {
    // 生成简单的设备ID
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    uni.setStorageSync('device_id', deviceId)
  }

  return deviceId
}
