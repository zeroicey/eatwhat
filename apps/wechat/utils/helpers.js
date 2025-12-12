/**
 * 通用辅助函数
 */

/**
 * 防抖函数
 * @param {Function} fn - 函数
 * @param {Number} delay - 延迟时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 函数
 * @param {Number} delay - 延迟时间
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {*} obj - 对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  
  const clonedObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

/**
 * 生成随机ID
 * @param {Number} length - 长度
 * @returns {String} 随机ID
 */
export function randomId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 计算两点间距离（米）
 * @param {Number} lat1 - 纬度1
 * @param {Number} lon1 - 经度1
 * @param {Number} lat2 - 纬度2
 * @param {Number} lon2 - 经度2
 * @returns {Number} 距离（米）
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * 图片压缩
 * @param {String} src - 图片路径
 * @param {Number} quality - 压缩质量
 * @returns {Promise} 压缩后的路径
 */
export function compressImage(src, quality = 80) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 选择图片
 * @param {Number} count - 数量
 * @param {Array} sizeType - 尺寸类型
 * @returns {Promise} 图片路径数组
 */
export function chooseImage(count = 1, sizeType = ['compressed']) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType,
      sourceType: ['album', 'camera'],
      success: (res) => resolve(res.tempFilePaths),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 预览图片
 * @param {Array} urls - 图片URL数组
 * @param {Number} current - 当前索引
 */
export function previewImage(urls, current = 0) {
  uni.previewImage({
    urls,
    current: typeof current === 'number' ? current : urls.indexOf(current)
  })
}
