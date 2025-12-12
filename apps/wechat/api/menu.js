/**
 * 菜单相关 API
 */
import { get, post } from './request'

/**
 * 获取菜单列表
 * @param {String} storeId - 店铺ID
 * @returns {Promise}
 */
export function getMenuItems(storeId) {
  return get(`/menus/${storeId}`)
}

/**
 * 数字化菜单（批量添加菜品）
 * @param {String} storeId - 店铺ID
 * @param {Array} items - 菜品列表
 * @returns {Promise}
 */
export function digitizeMenu(storeId, items) {
  return post(`/menus/${storeId}/digitize`, { items })
}

/**
 * 获取菜品详情
 * @param {String} itemId - 菜品ID
 * @returns {Promise}
 */
export function getMenuItem(itemId) {
  return get(`/menus/items/${itemId}`)
}

/**
 * 点赞菜品
 * @param {String} itemId - 菜品ID
 * @returns {Promise}
 */
export function likeMenuItem(itemId) {
  return post(`/menus/items/${itemId}/like`)
}

/**
 * 报错菜品
 * @param {String} itemId - 菜品ID
 * @param {String} reason - 报错原因
 * @returns {Promise}
 */
export function reportMenuItem(itemId, reason) {
  return post(`/menus/items/${itemId}/report`, { reason })
}
