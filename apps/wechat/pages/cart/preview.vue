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
        <button class="primary-btn" @click="generate">Generate Image</button>
        <button class="plain-btn" :disabled="!imagePath" @click="save">Save to Album</button>
      </view>
    </view>

    <canvas
      canvas-id="cartCanvas"
      class="canvas"
      :style="{ width: '750rpx', height: canvasHeight + 'px' }"
    />

    <view v-if="imagePath" class="result">
      <image class="result-img" :src="imagePath" mode="widthFix" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

const stores = computed(() => {
  const entries = Object.entries(cartStore.items || {})
  return entries.map(([storeId, s]) => ({
    storeId,
    storeInfo: s.storeInfo,
    items: s.items,
    subtotal: s.items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  }))
})

const totalItems = computed(() => cartStore.totalItemCount)
const totalPrice = computed(() => cartStore.totalPrice)

const canvasHeight = ref(0)
const imagePath = ref('')

function formatPrice(n) {
  return (n || 0).toFixed(2)
}

function calcHeight() {
  const base = 120
  let h = base
  stores.value.forEach(s => {
    h += 60
    h += s.items.length * 60
    h += 20
  })
  h += 40
  canvasHeight.value = h
}

function draw() {
  const ctx = uni.createCanvasContext('cartCanvas')
  const w = uni.upx2px(750)
  const h = canvasHeight.value
  ctx.setFillStyle('#FFFFFF')
  ctx.fillRect(0, 0, w, h)

  let y = 30

  ctx.setFillStyle('#212529')
  ctx.setFontSize(20)
  ctx.fillText('EatWhat - Order List', 20, y)

  y += 28
  ctx.setFillStyle('#495057')
  ctx.setFontSize(14)
  const dateStr = new Date().toLocaleString()
  ctx.fillText(dateStr, 20, y)

  y += 20
  ctx.setStrokeStyle('#E9ECEF')
  ctx.beginPath()
  ctx.moveTo(20, y)
  ctx.lineTo(w - 20, y)
  ctx.stroke()

  y += 20
  stores.value.forEach(s => {
    ctx.setFillStyle('#343A40')
    ctx.setFontSize(18)
    ctx.fillText(s.storeInfo.name || 'Store', 20, y)
    ctx.setFillStyle('#495057')
    ctx.setFontSize(14)
    ctx.fillText(`Subtotal: ¥${formatPrice(s.subtotal)}`, w - 220, y)

    y += 24
    s.items.forEach(it => {
      ctx.setFillStyle('#212529')
      ctx.setFontSize(16)
      const left = `${it.name} x${it.quantity}`
      ctx.fillText(left, 20, y)
      ctx.setFillStyle('#212529')
      const right = `¥${formatPrice(it.price * it.quantity)}`
      const rightWidth = right.length * 9
      ctx.fillText(right, w - 40 - rightWidth, y)
      y += 24
      if (it.note) {
        ctx.setFillStyle('#868E96')
        ctx.setFontSize(12)
        ctx.fillText(`Note: ${it.note}`, 20, y)
        y += 20
      }
    })

    y += 10
    ctx.setStrokeStyle('#F1F3F5')
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(w - 20, y)
    ctx.stroke()
    y += 14
  })

  ctx.setFillStyle('#212529')
  ctx.setFontSize(18)
  ctx.fillText(`Total: ¥${formatPrice(totalPrice.value)}`, 20, y + 10)

  ctx.draw(false, () => {
    uni.canvasToTempFilePath({
      canvasId: 'cartCanvas',
      success: (res) => {
        imagePath.value = res.tempFilePath
        uni.showToast({ title: 'Generated', icon: 'success' })
      },
      fail: () => {
        uni.showToast({ title: 'Generate failed', icon: 'none' })
      }
    })
  })
}

function generate() {
  if (cartStore.isEmpty) {
    uni.showToast({ title: 'Cart is empty', icon: 'none' })
    return
  }
  calcHeight()
  draw()
}

function save() {
  if (!imagePath.value) return
  uni.saveImageToPhotosAlbum({
    filePath: imagePath.value,
    success: () => {
      uni.showToast({ title: 'Saved', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: 'Save failed', icon: 'none' })
    }
  })
}

onMounted(() => {
  calcHeight()
})
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
.canvas {
  width: 750rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  margin: 20rpx;
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
