/**
 * 表单验证工具
 */

/**
 * 验证是否为空
 */
export function required(value, message = 'This field is required') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message }
  }
  return { valid: true }
}

/**
 * 验证最小长度
 */
export function minLength(value, min, message) {
  if (!value || value.length < min) {
    return { valid: false, message: message || `Minimum length is ${min}` }
  }
  return { valid: true }
}

/**
 * 验证最大长度
 */
export function maxLength(value, max, message) {
  if (value && value.length > max) {
    return { valid: false, message: message || `Maximum length is ${max}` }
  }
  return { valid: true }
}

/**
 * 验证价格格式
 */
export function validatePrice(value) {
  const priceRegex = /^\d+(\.\d{1,2})?$/
  if (!priceRegex.test(value)) {
    return { valid: false, message: 'Invalid price format' }
  }
  return { valid: true }
}

/**
 * 验证手机号
 */
export function validatePhone(value) {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    return { valid: false, message: 'Invalid phone number' }
  }
  return { valid: true }
}

/**
 * 验证数字范围
 */
export function range(value, min, max) {
  const num = Number(value)
  if (isNaN(num) || num < min || num > max) {
    return { valid: false, message: `Value must be between ${min} and ${max}` }
  }
  return { valid: true }
}

/**
 * 组合验证器
 */
export function validate(value, validators) {
  for (const validator of validators) {
    const result = validator(value)
    if (!result.valid) {
      return result
    }
  }
  return { valid: true }
}
