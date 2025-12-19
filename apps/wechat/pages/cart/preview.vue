<template>
  <view class="preview-page">
    <view class="panel">
      <view class="row">
        <text class="title">清单预览</text>
        <text class="desc">生成一张可分享的清单长图</text>
      </view>
      <view class="row">
        <text class="meta">商品: {{ totalItems }} 件</text>
        <text class="meta">总计: ¥{{ formatPrice(totalPrice) }}</text>
      </view>
      <view class="actions">
        <button class="primary-btn" :disabled="loading" @click="generate">{{ loading ? '生成中...' : '生成图片' }}</button>
        <button class="outline-btn" :disabled="!imagePath || loading" @click="save">保存到相册</button>
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
    uni.showToast({ title: '购物车为空', icon: 'none' })
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
      uni.showToast({ title: '已生成', icon: 'success' })
    } else {
      uni.showToast({ title: '生成失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '生成失败', icon: 'none' })
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
            uni.showToast({ title: '已保存', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '保存失败', icon: 'none' })
          }
        })
      },
      fail: () => {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    })
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.preview-page {
  min-height: 100vh;
  background: #F8F9FA;
  padding-bottom: 40rpx;
}
.panel {
  background: #FFFFFF;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #212529;
}
.desc {
  font-size: 26rpx;
  color: #868E96;
}
.meta {
  font-size: 28rpx;
  color: #495057;
  font-weight: 500;
}
.actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}
.primary-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
  
  &[disabled] {
    background: #E9ECEF;
    color: #ADB5BD;
    box-shadow: none;
  }
}
.outline-btn {
  flex: 1;
  height: 88rpx;
  line-height: 86rpx; /* account for border */
  border-radius: 44rpx;
  background: #FFFFFF;
  color: #FF6B6B;
  font-size: 30rpx;
  font-weight: 600;
  border: 2rpx solid #FF6B6B;
  
  &:active {
    background: #FFF5F5;
  }

  &[disabled] {
    border-color: #E9ECEF;
    color: #ADB5BD;
    background: #F8F9FA;
  }
}
.result {
  margin: 30rpx 20rpx;
  display: flex;
  justify-content: center;
}
.result-img {
  width: 100%;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
  background: #FFFFFF;
}
</style>

