/**
 * 店铺相关 API
 */
import { get, post } from './request'

/**
 * 获取店铺列表
 * @param {Object} params - { page, limit, sort, location }
 * @returns {Promise}
 */
export function getStoreList(params) {
  return get('/stores', params)
}

/**
 * 获取店铺详情
 * @param {String} storeId - 店铺ID
 * @returns {Promise}
 */
export function getStoreDetail(storeId) {
  return get(`/stores/${storeId}`)
}

/**
 * 创建店铺
 * @param {Object} data - 店铺信息
 * @returns {Promise}
 */
export function createStore(data) {
  return post('/stores', data)
}

/**
 * 搜索店铺
 * @param {String} keyword - 搜索关键词
 * @param {Object} params - 其他参数
 * @returns {Promise}
 */
export function searchStores(keyword, params = {}) {
  return get('/stores/search', { keyword, ...params })
}
