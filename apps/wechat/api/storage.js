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
    const uploadTask = uni.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'file',
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res)
        } else {
          reject(new Error('Upload failed'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })

    // 监听上传进度
    if (onProgress && typeof onProgress === 'function') {
      uploadTask.onProgressUpdate((progress) => {
        onProgress(progress.progress)
      })
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
      const { uploadUrl, accessUrl } = await getUploadUrl({
        filename: `image_${Date.now()}_${index}.jpg`,
        fileType: 'image/jpeg'
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
