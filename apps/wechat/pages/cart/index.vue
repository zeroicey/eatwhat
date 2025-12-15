<template>
  <view class="cart-page">
    <scroll-view
      scroll-y
      style="flex: 1"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      lower-threshold="50"
      @scrolltolower="loadMoreStores"
    >
      <view class="content">
        <view class="section-header">
          <text class="section-title">浏览店铺菜单</text>
          <view class="link-btn" @tap="reloadStores">刷新</view>
        </view>
        <view class="store-card" v-for="s in storeList" :key="s.id">
          <view class="card-cover-container">
            <image class="card-cover" :src="getCover(s)" mode="aspectFill" lazy-load></image>
          </view>
          <view class="card-content">
            <view class="store-row">
              <view class="left">
                <uni-icons type="shop-filled" size="20" color="#6b7280"></uni-icons>
                <text class="name">{{ s.name }}</text>
              </view>
              <view class="right">
                <view class="pill-btn sm" @tap="toggleStore(s.id)">
                  <text>{{ expandedIds.includes(s.id) ? '收起菜单' : '展开菜单' }}</text>
                  <uni-icons :type="expandedIds.includes(s.id) ? 'arrow-up' : 'arrow-down'" size="16"></uni-icons>
                </view>
              </view>
            </view>
          <view v-if="expandedIds.includes(s.id)" class="menu-list">
            <text v-if="loadingMenus[s.id]" class="loading">菜单加载中...</text>
            <view v-else>
              <view v-if="(menuByStore[s.id] || []).length === 0" class="empty-inline">暂无电子菜单</view>
              <view class="menu-item" v-for="m in menuByStore[s.id]" :key="m.id || m._id">
                <view class="mi-left">
                  <text class="mi-name">{{ m.name }}</text>
                  <text class="mi-price">¥{{ formatPrice(m.price) }}</text>
                </view>
                <view class="mi-right">
                  <view class="primary-mini" @tap="addToCart(s, m)">加入</view>
                </view>
              </view>
              <view class="menu-actions">
                <view class="link-btn" @tap="loadMoreMenu(s.id)" v-if="hasMoreMenu[s.id] && !loadingMenus[s.id]">
                  加载更多
                </view>
              </view>
            </view>
          </view>
          </view>
        </view>
        <view class="list-actions">
          <view class="plain-btn" @tap="loadMoreStores" v-if="hasMoreStores && !loadingStores">加载更多店铺</view>
          <text v-if="loadingStores" class="loading">店铺加载中...</text>
        </view>

        <view class="section-header">
          <text class="section-title">已选清单</text>
          <view class="link-btn" v-if="!isEmpty" @tap="clearAll">全部清空</view>
        </view>
        <text v-if="isEmpty" class="empty-inline">暂无已选菜品</text>
        <view v-else>
          <view class="store-block" v-for="store in selectedStores" :key="store.storeId">
            <view class="store-header">
              <view class="left">
                <uni-icons type="shop-filled" size="20" color="#495057"></uni-icons>
                <text class="name">{{ store.storeInfo.name }}</text>
              </view>
              <view class="right">
                <text class="subtotal">¥{{ formatPrice(store.subtotal) }}</text>
                <view class="pill-btn outline sm" @tap="clearStore(store.storeId)">清空本店</view>
              </view>
            </view>

            <view class="item" v-for="it in store.items" :key="it.id">
              <view class="item-main">
                <text class="item-name">{{ it.name }}</text>
                <text class="item-price">¥{{ formatPrice(it.price) }}</text>
              </view>
              <view class="item-actions">
                <view class="qty">
                  <view class="circle-btn" @tap="dec(store.storeId, it.id)">-</view>
                  <text class="count">{{ it.quantity }}</text>
                  <view class="circle-btn" @tap="inc(store.storeId, it.id)">+</view>
                </view>
                <view class="pill-btn outline danger sm" @tap="remove(store.storeId, it.id)">移除</view>
              </view>
              <view class="note">
                <input
                  class="note-input"
                  type="text"
                  :value="it.note"
                  placeholder="添加备注（例：不要香菜）"
                  @blur="onNoteBlur(store.storeId, it.id, $event.detail.value)"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="footer">
      <view class="summary">
        <text class="label">件数</text>
        <text class="value">{{ totalItems }}</text>
      </view>
      <view class="summary">
        <text class="label">总计</text>
        <text class="value strong">¥{{ formatPrice(totalPrice) }}</text>
      </view>
      <view class="primary-btn" :class="{ disabled: isEmpty }" @tap="goPreview">下单预览</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAppStore } from '@/stores/app'
import { getStoreList } from '@/api/store'
import { getMenuItems } from '@/api/menu'
import { PAGE_PATHS } from '@/utils/constants'

const cartStore = useCartStore()
const appStore = useAppStore()

const isEmpty = computed(() => cartStore.isEmpty)
const totalItems = computed(() => cartStore.totalItemCount)
const totalPrice = computed(() => cartStore.totalPrice)

const selectedStores = computed(() => {
  const entries = Object.entries(cartStore.items || {})
  return entries.map(([storeId, s]) => ({
    storeId,
    storeInfo: s.storeInfo,
    items: s.items,
    subtotal: s.items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  }))
})

const storeList = ref([])
const storePage = ref(1)
const storeLimit = ref(10)
const hasMoreStores = ref(false)
const loadingStores = ref(false)
const refreshing = ref(false)

const expandedIds = ref([])
const menuByStore = reactive({})
const menuPageByStore = reactive({})
const hasMoreMenu = reactive({})
const loadingMenus = reactive({})

function formatPrice(n) {
  return (n || 0).toFixed(2)
}

async function loadStores(refresh = false) {
  try {
    loadingStores.value = true
    const res = await getStoreList({ page: storePage.value, limit: storeLimit.value, sort: 'latest' })
    const list = Array.isArray(res) ? res : (res?.items || res || [])
    const mapped = list.map(s => ({
      id: s.id || s._id,
      name: s.name || s.storeName || '店铺',
      coverImage: s.coverImage,
      menuImages: s.menuImages || [],
      description: s.description || ''
    })).filter(s => s.id)
    if (refresh) {
      storeList.value = mapped
    } else {
      storeList.value = storeList.value.concat(mapped)
    }
    const totalCount = res?.pagination?.total ?? storeList.value.length
    hasMoreStores.value = storeList.value.length < totalCount
  } catch (err) {
    console.error('Load stores failed:', err)
  } finally {
    loadingStores.value = false
  }
}

function reloadStores() {
  storePage.value = 1
  resetMenuState()
  loadStores(true)
}

function loadMoreStores() {
  if (loadingStores.value || !hasMoreStores.value) return
  storePage.value += 1
  loadStores(false)
}

async function toggleStore(storeId) {
  const idx = expandedIds.value.indexOf(storeId)
  if (idx >= 0) {
    expandedIds.value.splice(idx, 1)
  } else {
    expandedIds.value.push(storeId)
    if (!menuByStore[storeId]) {
      await loadMenu(storeId, true)
    }
  }
}

async function loadMenu(storeId, refresh = false) {
  try {
    loadingMenus[storeId] = true
    const page = refresh ? 1 : ((menuPageByStore[storeId] || 1) + 1)
    const res = await getMenuItems(storeId, { page, limit: 20 })
    const list = Array.isArray(res) ? res : (res?.items || res || [])
    const mapped = list.map(m => ({
      id: m.id || m._id,
      name: m.name,
      price: m.price
    })).filter(m => m.id)
    if (refresh || !menuByStore[storeId]) {
      menuByStore[storeId] = mapped
      menuPageByStore[storeId] = 1
    } else {
      menuByStore[storeId] = (menuByStore[storeId] || []).concat(mapped)
      menuPageByStore[storeId] = page
    }
    const totalCount = res?.pagination?.total ?? menuByStore[storeId].length
    hasMoreMenu[storeId] = (menuByStore[storeId] || []).length < totalCount
  } catch (err) {
    console.error('Load menu failed:', err)
  } finally {
    loadingMenus[storeId] = false
  }
}

function loadMoreMenu(storeId) {
  if (loadingMenus[storeId] || !hasMoreMenu[storeId]) return
  loadMenu(storeId, false)
}

function addToCart(store, item) {
  cartStore.addItem({ id: store.id, name: store.name }, { id: item.id, name: item.name, price: item.price }, 1)
  appStore.showToast({ message: '已加入清单', type: 'success' })
}

function inc(storeId, itemId) {
  const item = cartStore.items[storeId]?.items.find(i => i.id === itemId)
  if (!item) return
  cartStore.updateQuantity(storeId, itemId, item.quantity + 1)
}

function dec(storeId, itemId) {
  const item = cartStore.items[storeId]?.items.find(i => i.id === itemId)
  if (!item) return
  cartStore.updateQuantity(storeId, itemId, item.quantity - 1)
}

function remove(storeId, itemId) {
  cartStore.removeItem(storeId, itemId)
}

function clearStore(storeId) {
  cartStore.clearStore(storeId)
}

function clearAll() {
  cartStore.clearCart()
}

function onNoteBlur(storeId, itemId, val) {
  cartStore.updateNote(storeId, itemId, val || '')
}

function goPreview() {
  if (isEmpty.value) return
  uni.navigateTo({ url: '/pages/cart/preview' })
}

function goDiscover() {
  uni.switchTab({ url: PAGE_PATHS.DISCOVER })
}

onMounted(() => {
  loadStores(true)
})

function getCover(s) {
  const fallback = '/static/logo.png'
  if (s.coverImage && typeof s.coverImage === 'string' && s.coverImage.length > 0) return s.coverImage
  if (Array.isArray(s.menuImages) && s.menuImages.length > 0) return s.menuImages[0]
  return fallback
}

async function onRefresh() {
  if (loadingStores.value) return
  refreshing.value = true
  storePage.value = 1
  resetMenuState()
  await loadStores(true)
  refreshing.value = false
}

function resetMenuState() {
  expandedIds.value = []
  for (const k in menuByStore) delete menuByStore[k]
  for (const k in menuPageByStore) delete menuPageByStore[k]
  for (const k in hasMoreMenu) delete hasMoreMenu[k]
  for (const k in loadingMenus) delete loadingMenus[k]
}
</script>

 

<style lang="scss" scoped>
:root {
  --primary-color: #3b82f6;
  --accent-color: #ff6b6b;
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --radius-lg: 16rpx;
  --radius-xl: 24rpx;
  --shadow-md: 0 8rpx 24rpx rgba(0,0,0,0.06);
}

.cart-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #F7F8FB 0%, #F4F6FA 100%);
}

.content {
  padding: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.section-title {
  font-size: 32rpx;
  color: var(--text-primary);
  font-weight: 700;
}

.store-card {
  background: linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 100%);
  border-radius: var(--radius-xl);
  padding: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-md);
  border: 1rpx solid #F1F3F5;
}
.card-cover-container {
  position: relative;
  margin-bottom: 12rpx;
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.card-cover {
  width: 100%;
  height: 260rpx;
  object-fit: cover;
}
.card-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.store-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.menu-list {
  margin-top: 12rpx;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
  border-top: 1rpx solid #F1F3F5;
}
.menu-item:first-child {
  border-top: none;
}
.mi-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.mi-name {
  font-size: 28rpx;
  color: var(--text-primary);
}
.mi-price {
  font-size: 26rpx;
  color: var(--text-secondary);
}
.primary-mini {
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 24rpx;
  border-radius: 30rpx;
  background: var(--accent-color);
  color: #FFFFFF;
  font-size: 26rpx;
}
.menu-actions {
  margin-top: 8rpx;
}
.list-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  gap: 12rpx;
}
.empty-inline {
  font-size: 26rpx;
  color: var(--text-muted);
}
.loading {
  font-size: 26rpx;
  color: var(--text-muted);
}

.store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 8rpx;
  .left {
    display: flex;
    align-items: center;
    gap: 8rpx;
    .name {
      font-size: 30rpx;
      color: var(--text-primary);
      font-weight: 600;
    }
  }
  .right {
    display: flex;
    align-items: center;
    gap: 16rpx;
    .subtotal {
      font-size: 28rpx;
      color: var(--text-secondary);
    }
  }
}

.store-block {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 8rpx 16rpx 12rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.item {
  padding: 12rpx 0;
  border-top: 1rpx solid #F1F3F5;
}
.item:first-child {
  border-top: none;
}
.item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .item-name {
    font-size: 28rpx;
    color: var(--text-primary);
  }
  .item-price {
    font-size: 28rpx;
    color: var(--text-secondary);
  }
}
.item-actions {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.qty {
  display: flex;
  align-items: center;
  gap: 12rpx;
  .count {
    min-width: 36rpx;
    text-align: center;
    font-size: 28rpx;
  }
}
.circle-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: #F8F9FA;
  border: 1rpx solid #E2E8F0;
  font-size: 28rpx;
  line-height: 48rpx;
  text-align: center;
}
.pill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 28rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
}
.pill-btn.sm {
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
}
.pill-btn.outline {
  background: #FFFFFF;
  border: 1rpx solid var(--border-color);
  color: var(--text-secondary);
}
.pill-btn.danger {
  color: #EF4444;
  border-color: #FECACA;
}
.pill-btn.primary {
  background: var(--accent-color);
  color: #FFFFFF;
  border: none;
}
.note {
  margin-top: 8rpx;
}
.note-input {
  width: 100%;
  height: 64rpx;
  background: #F8F9FA;
  border: 1rpx solid #E2E8F0;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  box-sizing: border-box;
  outline: none;
}

.footer {
  position: sticky;
  bottom: 0;
  background: #FFFFFF;
  padding: 16rpx 24rpx 24rpx;
  border-top: 1rpx solid #F1F3F5;
  display: flex;
  align-items: center;
  gap: 16rpx;
  .summary {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    .label {
      color: var(--text-secondary);
      font-size: 24rpx;
    }
    .value {
      color: var(--text-primary);
      font-size: 28rpx;
    }
    .strong {
      font-weight: 700;
      color: var(--text-primary);
    }
  }
  .primary-btn {
    flex-shrink: 0;
  }
}

.primary-btn {
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 32rpx;
  border-radius: 40rpx;
  background: var(--accent-color);
  color: #FFFFFF;
  font-size: 28rpx;
}
.primary-btn.disabled {
  background: #cbd5e1;
  color: #ffffff;
  opacity: 0.6;
  pointer-events: none;
}
</style>
