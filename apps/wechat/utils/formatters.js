/**
 * 数据格式化工具
 */

/**
 * 格式化价格
 * @param {Number} price - 价格
 * @returns {String} 格式化后的价格
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return '¥0.00'
  return `¥${Number(price).toFixed(2)}`
}

/**
 * 格式化距离
 * @param {Number} distance - 距离（米）
 * @returns {String} 格式化后的距离
 */
export function formatDistance(distance) {
  if (!distance) return '0m'
  
  if (distance < 1000) {
    return `${Math.round(distance)}m`
  } else {
    return `${(distance / 1000).toFixed(1)}km`
  }
}

/**
 * 格式化时间
 * @param {String|Number|Date} time - 时间
 * @returns {String} 格式化后的时间
 */
export function formatTime(time) {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return 'Just now'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)} minutes ago`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)} hours ago`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)} days ago`
  } else {
    return formatDate(date)
  }
}

/**
 * 格式化日期
 * @param {String|Number|Date} date - 日期
 * @param {String} format - 格式
 * @returns {String} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化数字（千分位）
 * @param {Number} num - 数字
 * @returns {String} 格式化后的数字
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 缩略文本
 * @param {String} text - 文本
 * @param {Number} maxLength - 最大长度
 * @returns {String} 缩略后的文本
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
