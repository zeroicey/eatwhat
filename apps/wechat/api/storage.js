/**
 * 文件上传相关 API
 * 采用客户端直传 Minio 方案
 */
import { post } from './request'

/**
 * 获取上传预签名 URL
 * @param {Object} params - { filename, fileType }
 * @returns {Promise} - { uploadUrl, accessUrl }
 */
export function getUploadUrl(params) {
  return post('/storage/upload-url', params)
}

/**
 * 上传文件到 Minio
 * @param {String} uploadUrl - 预签名上传 URL
 * @param {String} filePath - 本地文件路径
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise}
 */
export function uploadToMinio(uploadUrl, filePath, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      const fs = uni.getFileSystemManager && uni.getFileSystemManager()
      if (!fs) {
        reject(new Error('FileSystemManager not available'))
        return
      }
      fs.readFile({
        filePath,
        success: (readRes) => {
          const ext = (filePath.split('.').pop() || 'jpg').toLowerCase()
          const MIME_MAP = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp'
          }
          const contentType = MIME_MAP[ext] || 'application/octet-stream'
          // 使用 PUT 原始二进制体上传，避免 multipart 与多重认证问题
          uni.request({
            url: uploadUrl,
            method: 'PUT',
            header: {
              'Content-Type': contentType
              // 不附加 Authorization，避免与预签名冲突
            },
            data: readRes.data,
            success: (res) => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(res)
              } else {
                reject(new Error(`Upload failed: ${res.statusCode}`))
              }
            },
            fail: (err) => {
              reject(err)
            }
          })
        },
        fail: (err) => {
          reject(err)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 批量上传图片
 * @param {Array} filePaths - 文件路径数组
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise} - 返回访问 URL 数组
 */
export async function uploadImages(filePaths, onProgress) {
  const uploadPromises = filePaths.map(async (filePath, index) => {
    try {
      // 获取预签名 URL
      const ext = (filePath.split('.').pop() || 'jpg').toLowerCase()
      const { uploadUrl, accessUrl } = await getUploadUrl({
        fileType: ext
      })

      // 上传到 Minio
      await uploadToMinio(uploadUrl, filePath, (progress) => {
        if (onProgress) {
          onProgress({
            index,
            progress,
            total: filePaths.length
          })
        }
      })

      return accessUrl
    } catch (error) {
      console.error(`Failed to upload image ${index}:`, error)
      throw error
    }
  })

  return Promise.all(uploadPromises)
}
