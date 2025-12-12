/**
 * 动态相关 API
 */
import { get, post, del } from './request'

/**
 * 获取动态流
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export function getMomentsFeed(params) {
  return get('/moments', params)
}

/**
 * 获取动态详情
 * @param {String} momentId - 动态ID
 * @returns {Promise}
 */
export function getMomentDetail(momentId) {
  return get(`/moments/${momentId}`)
}

/**
 * 发布动态
 * @param {Object} data - { content, images, storeId }
 * @returns {Promise}
 */
export function publishMoment(data) {
  return post('/moments', data)
}

/**
 * 删除动态
 * @param {String} momentId - 动态ID
 * @returns {Promise}
 */
export function deleteMoment(momentId) {
  return del(`/moments/${momentId}`)
}

/**
 * 点赞动态
 * @param {String} momentId - 动态ID
 * @returns {Promise}
 */
export function likeMoment(momentId) {
  return post(`/moments/${momentId}/like`)
}

/**
 * 取消点赞
 * @param {String} momentId - 动态ID
 * @returns {Promise}
 */
export function unlikeMoment(momentId) {
  return del(`/moments/${momentId}/like`)
}

/**
 * 发布评论
 * @param {String} momentId - 动态ID
 * @param {String} content - 评论内容
 * @returns {Promise}
 */
export function commentMoment(momentId, content) {
  return post(`/moments/${momentId}/comments`, { content })
}

/**
 * 获取评论列表
 * @param {String} momentId - 动态ID
 * @param {Object} params - { page, limit }
 * @returns {Promise}
 */
export function getMomentComments(momentId, params) {
  return get(`/moments/${momentId}/comments`, params)
}
