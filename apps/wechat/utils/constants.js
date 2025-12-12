/**
 * 常量定义
 */

// API 相关
export const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : 'https://api.eatwhat.com/api'

// 存储 Key
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_storage',
  CART: 'cart-storage',
  DEVICE_ID: 'device_id'
}

// 页面路径
export const PAGE_PATHS = {
  HOME: '/pages/home/index',
  DISCOVER: '/pages/discover/index',
  CART: '/pages/cart/index',
  PROFILE: '/pages/profile/index',
  LOGIN: '/pages/auth/login',
  STORE_DETAIL: '/pages/store/detail',
  STORE_CREATE: '/pages/store/create',
  MENU_DIGITIZE: '/pages/menu/digitize',
  MOMENT_PUBLISH: '/pages/moment/publish',
  MOMENT_DETAIL: '/pages/moment/detail',
  SHARE_GENERATE: '/pages/share/generate'
}

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
}

// 图片上传配置
export const UPLOAD_CONFIG = {
  MAX_IMAGE_COUNT: 9,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  COMPRESS_QUALITY: 80,
  COMPRESS_WIDTH: 1200,
  ALLOWED_TYPES: ['jpg', 'jpeg', 'png', 'webp']
}

// Token 过期时间（7天）
export const TOKEN_EXPIRY = 365 * 24 * 60 * 60 * 1000

// 请求超时时间
export const REQUEST_TIMEOUT = 30000

// 业务错误码
export const ERROR_CODES = {
  SUCCESS: 0,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// 排序选项
export const SORT_OPTIONS = {
  LATEST: 'latest',
  DISTANCE: 'distance',
  POPULAR: 'popular'
}

// 缓存时间配置（分钟）
export const CACHE_TIME = {
  STORE_LIST: 5,
  STORE_DETAIL: 10,
  MENU_ITEMS: 10,
  MOMENTS_FEED: 1,
  MOMENT_DETAIL: 5,
  USER_PROFILE: 30,
  CONTRIBUTIONS: 5
}
