<template>
  <view class="publish-moment-page">
    <view class="header">
      <text class="title"><uni-icons type="paperplane" size="22"></uni-icons> 发布动态</text>
      <text class="desc">分享你的美食时刻</text>
    </view>

    <view class="form">
      <textarea class="content-input" v-model="content" :maxlength="1000" placeholder="这一刻，想说点什么..." />

      <view class="images-section">
        <view class="images-header">
          <text class="images-title">图片（最多9张）</text>
          <text class="images-meta" v-if="images.length">{{ images.length }}/9</text>
        </view>
        <view class="images-grid">
          <view v-for="(img, idx) in images" :key="idx" class="img-item">
            <image :src="img" mode="aspectFill" class="img" @click="preview(images, idx)" />
            <view class="remove" @click="removeImage(idx)"><uni-icons type="closeempty" size="18" color="#fff"></uni-icons></view>
          </view>
          <view v-if="images.length < 9" class="img-add" @click="pickImages">
            <uni-icons type="plus" size="24"></uni-icons>
            <text class="add-text">添加</text>
          </view>
        </view>
      </view>

      <view class="store-section">
        <text class="store-title">关联店铺（可选）</text>
        <view class="store-row">
          <input class="store-input" v-model="storeId" placeholder="输入店铺ID或留空" />
          <button class="btn" @click="goDiscover"><uni-icons type="discover" size="18"></uni-icons> 去发现</button>
          <button v-if="storeId" class="btn" @click="goStoreDetail"><uni-icons type="info" size="18"></uni-icons> 店铺详情</button>
        </view>
      </view>

      <button class="submit-btn primary" :disabled="submitting" @click="submit">
        <uni-icons type="paperplane" size="22"></uni-icons>
        {{ submitting ? '发布中...' : '发布' }}
      </button>
    </view>
  </view>
  </template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '../../stores/app.js'
import { publishMoment } from '../../api/moment.js'
import { uploadImages } from '../../api/storage.js'
import { chooseImage, previewImage, compressImage } from '../../utils/helpers.js'

const appStore = useAppStore()
const content = ref('')
const images = ref([]) // 本地或已上传访问URL
const storeId = ref('')
const submitting = ref(false)

onLoad((options) => {
  if (options?.storeId) {
    storeId.value = options.storeId
  }
})

async function pickImages() {
  try {
    const remain = Math.max(0, 9 - images.value.length)
    if (remain <= 0) return
    const paths = await chooseImage(remain, ['compressed'])
    // 可选压缩
    const compressed = await Promise.all(paths.map(p => compressImage(p, 80).catch(() => p)))
    images.value = images.value.concat(compressed)
  } catch (err) {
    console.error('Choose image failed:', err)
  }
}

function removeImage(idx) {
  images.value.splice(idx, 1)
}

function preview(list, idx) {
  previewImage(list, idx)
}

function goDiscover() {
  uni.switchTab({ url: '/pages/discover/index' })
}

function goStoreDetail() {
  if (!storeId.value) return
  uni.navigateTo({ url: `/pages/store/detail?id=${storeId.value}` })
}

function validate() {
  if (!content.value || !content.value.trim()) {
    appStore.showToast({ message: '请输入动态内容', type: 'error' })
    return false
  }
  if (images.value.length > 9) {
    appStore.showToast({ message: '最多选择9张图片', type: 'error' })
    return false
  }
  return true
}

async function submit() {
  if (submitting.value) return
  if (!validate()) return
  try {
    submitting.value = true
    let accessUrls = []
    const localImages = images.value.filter(u => typeof u === 'string' && u.startsWith('file://') || u.startsWith('http') === false)
    const alreadyUrls = images.value.filter(u => typeof u === 'string' && u.startsWith('http'))
    if (localImages.length > 0) {
      accessUrls = await uploadImages(localImages)
    }
    const finalImages = alreadyUrls.concat(accessUrls)
    const payload = {
      content: content.value.trim(),
      images: finalImages,
      storeId: storeId.value || undefined
    }
    await publishMoment(payload)
    appStore.showToast({ message: '发布成功', type: 'success' })
    // 返回上一页或跳转首页
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 300)
  } catch (err) {
    console.error('Publish moment failed:', err)
    appStore.showToast({ message: '发布失败', type: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.publish-moment-page { padding: 32rpx; display: flex; flex-direction: column; gap: 16rpx; }
.header { display: flex; flex-direction: column; gap: 8rpx; }
.title { font-size: 36rpx; font-weight: 600; color: #212529; }
.desc { font-size: 28rpx; color: #868E96; }
.form { display: flex; flex-direction: column; gap: 16rpx; }
.content-input { min-height: 200rpx; background: #FFFFFF; border-radius: 12rpx; padding: 16rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); font-size: 28rpx; }
.images-section { display: flex; flex-direction: column; gap: 10rpx; }
.images-header { display: flex; align-items: center; justify-content: space-between; }
.images-title { font-size: 30rpx; font-weight: 600; color: #212529; }
.images-meta { font-size: 24rpx; color: #ADB5BD; }
.images-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8rpx; }
.img-item { position: relative; }
.img { width: 100%; height: 200rpx; border-radius: 12rpx; background: #F1F3F5; }
.remove { position: absolute; top: 6rpx; right: 6rpx; width: 36rpx; height: 36rpx; border-radius: 18rpx; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; }
.img-add { background: #FFFFFF; border: 2rpx dashed #DEE2E6; border-radius: 12rpx; height: 200rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6rpx; color: #495057; }
.add-text { font-size: 24rpx; }
.store-section { display: flex; flex-direction: column; gap: 10rpx; }
.store-title { font-size: 30rpx; font-weight: 600; color: #212529; }
.store-row { display: grid; grid-template-columns: 1fr auto auto; gap: 8rpx; }
.store-input { height: 72rpx; background: #FFFFFF; border-radius: 12rpx; padding: 0 16rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); font-size: 28rpx; }
.btn { height: 72rpx; background: #F8F9FA; border-radius: 12rpx; padding: 0 20rpx; display: flex; align-items: center; gap: 8rpx; color: #212529; }
.submit-btn { height: 84rpx; border-radius: 14rpx; display: flex; align-items: center; justify-content: center; gap: 8rpx; font-size: 30rpx; }
.primary { background: #FF6B6B; color: #FFFFFF; }
</style>
