<template>
  <view class="publish-moment-page">
    <view class="header card">
      <text class="title"><uni-icons type="paperplane" size="22"></uni-icons> 发布动态</text>
      <text class="desc">分享你的美食时刻</text>
    </view>

    <view class="card form-section">
      <textarea class="content-input" v-model="content" :maxlength="1000" placeholder="这一刻，想说点什么..." />
    </view>

    <view class="card form-section">
      <view class="section-title">
        <uni-icons type="camera" size="20"></uni-icons>
        <text>图片（{{ images.length }}/9）</text>
      </view>
      <view class="images-grid">
        <view v-for="(img, idx) in images" :key="idx" class="img-item">
          <image :src="img" mode="aspectFill" class="img" @click="preview(images, idx)" />
          <view class="remove" @click="removeImage(idx)"><uni-icons type="closeempty" size="18" color="#fff"></uni-icons></view>
        </view>
        <view v-if="images.length < 9" class="img-add" @click="pickImages">
          <uni-icons type="plus" size="32"></uni-icons>
          <text class="add-text">添加图片</text>
        </view>
      </view>
    </view>

    <view class="card form-section">
      <view class="section-title">
        <view class="title-left">
          <uni-icons type="shop" size="20"></uni-icons>
          <text>关联店铺</text>
        </view>
        <switch :checked="isAssociatingStore" @change="onAssociateStoreChange" color="#FF6B6B" style="transform:scale(0.8)" />
      </view>
      <template v-if="isAssociatingStore">
        <view class="search-bar-wrapper">
          <uni-icons type="search" size="20" color="#adb5bd"></uni-icons>
          <input class="search-input" v-model="searchQuery" placeholder="搜索店铺" />
        </view>
        <picker v-if="filteredStores.length" @change="bindPickerChange" :value="selectedStoreIndexInFiltered" :range="filteredStores" range-key="name">
          <view class="store-picker">
            <text>{{ selectedStoreName }}</text>
            <uni-icons type="right" size="16"></uni-icons>
          </view>
        </picker>
        <view v-else class="store-picker">
          <text>没有找到匹配的店铺</text>
        </view>
      </template>
    </view>

    <button class="submit-btn primary" :disabled="submitting" @click="submit">
      <uni-icons type="paperplane" size="22"></uni-icons>
      {{ submitting ? '发布中...' : '立即发布' }}
    </button>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '../../stores/app.js'
import { publishMoment } from '../../api/moment.js'
import { uploadImages } from '../../api/storage.js'
import { chooseImage, previewImage, compressImage } from '../../utils/helpers.js'

import { getStoreList } from '../../api/store.js'

const appStore = useAppStore()
const content = ref('')
const images = ref([]) // 本地或已上传访问URL
const storeId = ref('')
const submitting = ref(false)
const storeOptions = ref([])
const storeIndex = ref(0)
const isAssociatingStore = ref(false)
const searchQuery = ref('')

const filteredStores = computed(() => {
  if (!searchQuery.value) {
    return storeOptions.value
  }
  return storeOptions.value.filter(store =>
    store.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedStoreName = computed(() => {
  if (storeId.value && storeOptions.value.length > 0) {
    const store = storeOptions.value.find(s => s._id === storeId.value)
    return store ? store.name : '请选择店铺'
  }
  return '请选择店铺'
})

const selectedStoreIndexInFiltered = computed(() => {
  if (storeId.value) {
    const index = filteredStores.value.findIndex(s => s._id === storeId.value)
    return Math.max(0, index) // return 0 if not found or -1
  }
  return 0
})

function onAssociateStoreChange(e) {
  isAssociatingStore.value = e.detail.value
  if (!isAssociatingStore.value) {
    storeId.value = ''
  } else {
    // When toggling on, if there are stores, default to the first one in the filtered list
    if (filteredStores.value.length > 0) {
      storeId.value = filteredStores.value[0]._id
    } else {
      storeId.value = ''
    }
  }
}

onLoad(async (options) => {
  if (options?.storeId) {
    storeId.value = options.storeId
    isAssociatingStore.value = true
  }
  try {
    const stores = await getStoreList()
    storeOptions.value = Array.isArray(stores) ? stores : []
    // If a storeId is passed via options, find its index
    if (storeId.value && storeOptions.value.length > 0) {
      const selectedIndex = storeOptions.value.findIndex(s => s._id === storeId.value)
      if (selectedIndex !== -1) {
        storeIndex.value = selectedIndex
      }
    }
  } catch (e) {
    console.error("Failed to load stores", e)
    storeOptions.value = []
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

function bindPickerChange(e) {
  const selectedIndex = e.detail.value
  const selectedStore = filteredStores.value[selectedIndex]
  if (selectedStore) {
    storeId.value = selectedStore._id
  }
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
  if (isAssociatingStore.value && !storeId.value) {
    appStore.showToast({ message: '请选择要关联的店铺', type: 'error' })
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
    const isLocalPath = (u) => {
      const s = (u || '').toLowerCase()
      return s.startsWith('wxfile://')
        || s.startsWith('file://')
        || s.startsWith('http://127.0.0.1')
        || s.startsWith('https://127.0.0.1')
        || s.includes('/__tmp__/')
        || s.startsWith('http://tmp')
        || s.startsWith('https://tmp')
    }
    const localImages = images.value.filter(isLocalPath)
    const alreadyUrls = images.value.filter(u => !isLocalPath(u))
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
.publish-moment-page {
  padding: 32rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.header {
  .title {
    font-size: 40rpx;
    font-weight: 700;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  .desc {
    font-size: 28rpx;
    color: #868e96;
    margin-top: 8rpx;
  }
}

.form-section {
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #343a40;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8rpx;
  }

  .title-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
  color: #343a40;
  padding: 0; // Reset padding
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;

  .img-item, .img-add {
    width: 100%;
    height: 210rpx;
    border-radius: 12rpx;
    background-color: #f1f3f5;
  }

  .img-item {
    position: relative;
    overflow: hidden;
    .img {
      width: 100%;
      height: 100%;
    }
    .remove {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      width: 36rpx;
      height: 36rpx;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .img-add {
    border: 2rpx dashed #dee2e6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    color: #adb5bd;
    .add-text {
      font-size: 24rpx;
    }
  }
}

.store-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #495057;
}

.search-bar-wrapper {
  display: flex;
  align-items: center;
  background-color: #f1f3f5;
  border-radius: 12rpx;
  padding: 12rpx 20rpx;
  margin-bottom: 16rpx;

  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: #343a40;
    margin-left: 12rpx;
  }
}

.submit-btn {
  height: 96rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  &.primary {
    background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
    color: #ffffff;
    box-shadow: 0 8rpx 16rpx rgba(255, 107, 107, 0.3);
  }

  &[disabled] {
    background: #e9ecef;
    color: #adb5bd;
    box-shadow: none;
  }
}
</style>
