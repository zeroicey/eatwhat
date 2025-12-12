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
  console.log(`[uploadToMinio] Starting upload for: ${filePath}`);
  return new Promise((resolve, reject) => {
    const performUpload = (uploadFilePath) => {
      console.log(`[uploadToMinio] Performing upload for local file: ${uploadFilePath}`);
      const fs = uni.getFileSystemManager();
      fs.readFile({
        filePath: uploadFilePath,
        success: (readRes) => {
          console.log(`[uploadToMinio] File read success. Data length: ${readRes.data.byteLength}`);
          const ext = (uploadFilePath.split('.').pop() || 'jpg').toLowerCase();
          const MIME_MAP = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
          };
          const contentType = MIME_MAP[ext] || 'application/octet-stream';

          uni.request({
            url: uploadUrl,
            method: 'PUT',
            header: { 'Content-Type': contentType },
            data: readRes.data,
            success: (res) => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('[uploadToMinio] Upload via uni.request successful.');
                resolve(res);
              } else {
                console.error(`[uploadToMinio] Upload failed with status: ${res.statusCode}`, res);
                reject(new Error(`Upload failed with status: ${res.statusCode}`));
              }
            },
            fail: (err) => {
              console.error('[uploadToMinio] uni.request failed:', err);
              reject(err);
            },
          });
        },
        fail: (err) => {
          console.error(`[uploadToMinio] fs.readFile failed for ${uploadFilePath}:`, err);
          reject(err);
        },
      });
    };

    if (filePath.startsWith('http')) {
      if (filePath.startsWith('http://127.0.0.1')) {
        console.log('[uploadToMinio] Detected local devtools tmp url, using getImageInfo to resolve local path.');
        uni.getImageInfo({
          src: filePath,
          success: (info) => {
            if (info && info.path) {
              console.log('[uploadToMinio] getImageInfo success. Resolved path:', info.path);
              performUpload(info.path);
            } else {
              console.warn('[uploadToMinio] getImageInfo returned no path, fallback to downloadFile.');
              uni.downloadFile({
                url: filePath,
                success: (downloadRes) => {
                  console.log(`[uploadToMinio] File download success. Status: ${downloadRes.statusCode}. Temp path: ${downloadRes.tempFilePath}`);
                  if (downloadRes.statusCode === 200) {
                    performUpload(downloadRes.tempFilePath);
                  } else {
                    console.error(`[uploadToMinio] Failed to download temp file. Status: ${downloadRes.statusCode}`);
                    reject(new Error(`Failed to download temp file: ${downloadRes.statusCode}`));
                  }
                },
                fail: (err) => {
                  console.error(`[uploadToMinio] uni.downloadFile failed for ${filePath}:`, err);
                  reject(err);
                },
              });
            }
          },
          fail: (err) => {
            console.warn('[uploadToMinio] getImageInfo failed, fallback to downloadFile.', err);
            uni.downloadFile({
              url: filePath,
              success: (downloadRes) => {
                console.log(`[uploadToMinio] File download success. Status: ${downloadRes.statusCode}. Temp path: ${downloadRes.tempFilePath}`);
                if (downloadRes.statusCode === 200) {
                  performUpload(downloadRes.tempFilePath);
                } else {
                  console.error(`[uploadToMinio] Failed to download temp file. Status: ${downloadRes.statusCode}`);
                  reject(new Error(`Failed to download temp file: ${downloadRes.statusCode}`));
                }
              },
              fail: (err) => {
                console.error(`[uploadToMinio] uni.downloadFile failed for ${filePath}:`, err);
                reject(err);
              },
            });
          },
        });
      } else {
        console.log(`[uploadToMinio] Detected HTTP path, downloading file first.`);
        uni.downloadFile({
          url: filePath,
          success: (downloadRes) => {
            console.log(`[uploadToMinio] File download success. Status: ${downloadRes.statusCode}. Temp path: ${downloadRes.tempFilePath}`);
            if (downloadRes.statusCode === 200) {
              performUpload(downloadRes.tempFilePath);
            } else {
              console.error(`[uploadToMinio] Failed to download temp file. Status: ${downloadRes.statusCode}`);
              reject(new Error(`Failed to download temp file: ${downloadRes.statusCode}`));
            }
          },
          fail: (err) => {
            console.error(`[uploadToMinio] uni.downloadFile failed for ${filePath}:`, err);
            reject(err);
          },
        });
      }
    } else {
      console.log(`[uploadToMinio] Detected non-HTTP path, uploading directly.`);
      performUpload(filePath);
    }
  });
}

/**
 * 批量上传图片
 * @param {Array} filePaths - 文件路径数组
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise} - 返回访问 URL 数组
 */
export async function uploadImages(filePaths, onProgress) {
  console.log('[uploadImages] Starting batch upload for paths:', filePaths);
  const uploadPromises = filePaths.map(async (filePath, index) => {
    try {
      console.log(`[uploadImages] Processing file ${index + 1}: ${filePath}`);
      // 获取预签名 URL
      const ext = (filePath.split('.').pop() || 'jpg').toLowerCase();
      const { uploadUrl, accessUrl } = await getUploadUrl({
        fileType: ext,
        bucket: 'momentImages'
      });
      console.log(`[uploadImages] Got presigned URL for file ${index + 1}. Access URL: ${accessUrl}`);

      // 上传到 Minio
      await uploadToMinio(uploadUrl, filePath, (progress) => {
        if (onProgress) {
          onProgress({
            index,
            progress,
            total: filePaths.length
          });
        }
      });
      console.log(`[uploadImages] Successfully uploaded file ${index + 1}.`);

      return accessUrl;
    } catch (error) {
      console.error(`[uploadImages] Failed to upload image ${index}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}
