<template>
  <view class="preview-page">
    <view class="panel">
      <view class="row">
        <text class="title">Order Preview</text>
        <text class="desc">Generate a shareable list image</text>
      </view>
      <view class="row">
        <text class="meta">Items: {{ totalItems }}</text>
        <text class="meta">Total: ¥{{ formatPrice(totalPrice) }}</text>
      </view>
      <view class="actions">
        <button class="primary-btn" :disabled="loading" @click="generate">{{ loading ? 'Generating...' : 'Generate Image' }}</button>
        <button class="plain-btn" :disabled="!imagePath || loading" @click="save">Save to Album</button>
      </view>
    </view>

    <view v-if="imagePath" class="result">
      <image class="result-img" :src="imagePath" mode="widthFix" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { post } from '@/api/request'

const cartStore = useCartStore()

const totalItems = computed(() => cartStore.totalItemCount)
const totalPrice = computed(() => cartStore.totalPrice)

const imagePath = ref('')
const loading = ref(false)

function formatPrice(n) {
  return (n || 0).toFixed(2)
}

async function generate() {
  if (cartStore.isEmpty) {
    uni.showToast({ title: 'Cart is empty', icon: 'none' })
    return
  }
  try {
    loading.value = true
    const data = await post('/tools/order-image', {
      title: '今天吃什么 · 清单',
      cart: cartStore.items
    })
    imagePath.value = data?.dataUrl || ''
    if (imagePath.value) {
      uni.showToast({ title: 'Generated', icon: 'success' })
    } else {
      uni.showToast({ title: 'Generate failed', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: 'Generate failed', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function save() {
  if (!imagePath.value) return
  try {
    const dataUrl = imagePath.value
    const base64 = dataUrl.split(',')[1]
    const filePath = `${wx.env.USER_DATA_PATH}/order-${Date.now()}.png`
    wx.getFileSystemManager().writeFile({
      filePath,
      data: base64,
      encoding: 'base64',
      success: () => {
        uni.saveImageToPhotosAlbum({
          filePath,
          success: () => {
            uni.showToast({ title: 'Saved', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: 'Save failed', icon: 'none' })
          }
        })
      },
      fail: () => {
        uni.showToast({ title: 'Save failed', icon: 'none' })
      }
    })
  } catch (e) {
    uni.showToast({ title: 'Save failed', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.preview-page {
  min-height: 100vh;
  background: #F8F9FA;
}
.panel {
  background: #FFFFFF;
  margin: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.title {
  font-size: 32rpx;
  font-weight: 700;
  color: #212529;
}
.desc {
  font-size: 24rpx;
  color: #868E96;
}
.meta {
  font-size: 26rpx;
  color: #495057;
}
.actions {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}
.primary-btn {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 28rpx;
  border-radius: 36rpx;
  background: #FF6B6B;
  color: #FFFFFF;
  font-size: 28rpx;
}
.plain-btn {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 28rpx;
  border-radius: 36rpx;
  background: #F1F3F5;
  color: #343A40;
  font-size: 28rpx;
}
.result {
  margin: 20rpx;
}
.result-img {
  width: 100%;
  border-radius: 12rpx;
  background: #FFFFFF;
}
</style>

