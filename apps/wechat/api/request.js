/**
 * 请求封装 - 统一请求处理
 * 封装 uni.request 为 Promise 风格
 */
import { requestInterceptor, responseInterceptor, errorInterceptor } from './interceptors'

// API 基础地址
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api'
  : 'https://api.eatwhat.com/api'

/**
 * 发送 HTTP 请求
 * @param {Object} options - 请求配置
 * @returns {Promise} 请求Promise
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      timeout = 30000
    } = options
    const config = requestInterceptor({
      url: BASE_URL + url,
      method,
      data,
      header,
      timeout
    })

    uni.request({
      ...config,
      success: async (res) => {
        try {
          const data = await responseInterceptor(res)
          resolve(data)
        } catch (err) {
          reject(err)
        }
      },
      fail: async (err) => {
        try {
          await errorInterceptor(err)
        } finally {
          reject(err)
        }
      }
    })
  })
}

/**
 * GET 请求
 */
export function get(url, params = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST 请求
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export default request
