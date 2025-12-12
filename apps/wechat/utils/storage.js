/**
 * 本地存储封装
 */

/**
 * 存储数据
 * @param {String} key - 键
 * @param {*} value - 值
 */
export function setStorage(key, value) {
  try {
    const data = JSON.stringify(value)
    uni.setStorageSync(key, data)
    return true
  } catch (error) {
    console.error('Storage set error:', error)
    return false
  }
}

/**
 * 获取数据
 * @param {String} key - 键
 * @param {*} defaultValue - 默认值
 * @returns {*} 数据
 */
export function getStorage(key, defaultValue = null) {
  try {
    const data = uni.getStorageSync(key)
    if (!data) return defaultValue
    return JSON.parse(data)
  } catch (error) {
    console.error('Storage get error:', error)
    return defaultValue
  }
}

/**
 * 删除数据
 * @param {String} key - 键
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (error) {
    console.error('Storage remove error:', error)
    return false
  }
}

/**
 * 清空所有数据
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
    return true
  } catch (error) {
    console.error('Storage clear error:', error)
    return false
  }
}

/**
 * 获取所有键
 * @returns {Array} 键数组
 */
export function getStorageKeys() {
  try {
    const info = uni.getStorageInfoSync()
    return info.keys || []
  } catch (error) {
    console.error('Storage keys error:', error)
    return []
  }
}
