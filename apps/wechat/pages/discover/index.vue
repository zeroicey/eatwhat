<template>
	<view class="discover-page">


		<!-- Search Section -->
		<view class="search-section">
			<view class="search-container">
				<view class="search-input-wrapper">
					<uni-icons type="search" size="20" class="search-icon"></uni-icons>
					<input 
						class="search-input" 
						type="text" 
						v-model="keyword" 
						placeholder="搜索店铺或菜品..."
						placeholder-style="color: #9ca3af"
						@confirm="doSearch"
					/>
					<view v-if="keyword" class="clear-btn" @click="clearSearch">
						<uni-icons type="close" size="16"></uni-icons>
					</view>
				</view>
				<button class="search-btn" @click="doSearch">搜索</button>
			</view>
		</view>



		<!-- Store List -->
		<view class="store-section">
			<view v-if="stores.length > 0" class="store-grid">
				<view 
					class="store-card" 
					v-for="s in stores" 
					:key="s._id" 
					@click="goDetail(s)"
				>
					<view class="card-image-container">
						<image 
							class="card-image" 
							:src="getCover(s)" 
							mode="aspectFill"
							lazy-load
						/>
						<view class="image-overlay">
							<view class="store-badge" v-if="isNewStore(s)">
								<text class="badge-text">新店</text>
							</view>
						</view>
					</view>
					
					<view class="card-content">
						<view class="store-header">
							<text class="store-name">{{ s.name }}</text>
							<view class="rating" v-if="s.rating">
								<uni-icons type="star-filled" size="14" color="#fbbf24"></uni-icons>
								<text class="rating-text">{{ s.rating }}</text>
							</view>
						</view>
						
						<text class="store-desc">{{ s.description || '暂无描述' }}</text>
						
						<view class="store-meta">
							<view class="meta-item" v-if="s.creator">
								<image 
									v-if="s.creator.avatarUrl" 
									:src="s.creator.avatarUrl" 
									class="creator-avatar"
									mode="aspectFill"
								/>
								<text class="creator-name">{{ s.creator.nickName || '匿名用户' }}</text>
							</view>
							
							<view class="meta-item location" v-if="longitude && latitude && s.location && s.location.coordinates">
								<uni-icons type="location" size="14" color="#6b7280"></uni-icons>
								<text class="meta-text">{{ distanceText(s) }}</text>
							</view>
							
							<view class="meta-item time">
								<uni-icons type="time" size="14" color="#6b7280"></uni-icons>
								<text class="meta-text">{{ updatedText(s) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view v-else-if="!loading" class="empty-state">
				<view class="empty-icon">
					<uni-icons type="shop" size="48" color="#d1d5db"></uni-icons>
				</view>
				<text class="empty-title">暂无店铺</text>
				<text class="empty-desc">成为第一个创建店铺的人吧！</text>
			</view>

			<!-- Load More -->
			<view v-if="hasMore && !loading" class="load-more-container">
				<button class="load-more-btn" @click="loadMore">
					<text>加载更多</text>
					<uni-icons type="arrow-down" size="14"></uni-icons>
				</button>
			</view>
		</view>

		<!-- Floating Action Button -->
		<view class="fab-container" @click="goCreate">
			<view class="fab">
				<uni-icons type="plusempty" size="24" color="#ffffff"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getStoreList, searchStores } from '@/api/store'
import { useAppStore } from '@/stores/app'
import { formatDistance, formatTime } from '@/utils/formatters'
import { getDistance } from '@/utils/helpers'

const appStore = useAppStore()
const stores = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const loading = ref(false)
const hasMore = ref(false)
const keyword = ref('')
const longitude = ref(null)
const latitude = ref(null)
const sortMode = ref('recent')

onMounted(() => {
	tryGetLocation()
	loadList(true)
})

onPullDownRefresh(async () => {
	page.value = 1
	await loadList(true)
	uni.stopPullDownRefresh()
})

onReachBottom(() => {
	if (hasMore.value && !loading.value) {
		loadMore()
	}
})

function tryGetLocation() {
	uni.getLocation({
		type: 'wgs84',
		success: (res) => {
			longitude.value = res.longitude
			latitude.value = res.latitude
		}
	})
}

async function loadList(refresh = false) {
	try {
		loading.value = true
		const paramsBase = { page: page.value, limit: limit.value }
		let res
		if (keyword.value && keyword.value.trim().length > 0) {
			const params = { ...paramsBase }
			res = await searchStores(keyword.value.trim(), params)
		} else {
			const params = { ...paramsBase }
			if (sortMode.value === 'distance' && longitude.value && latitude.value) {
				params.sort = 'distance'
				params.location = { longitude: longitude.value, latitude: latitude.value }
			} else {
				params.sort = 'recent'
			}
			res = await getStoreList(params)
		}
		const list = Array.isArray(res) ? res : (res?.items || res || [])
		if (refresh) {
			stores.value = list
		} else {
			stores.value = stores.value.concat(list)
		}
		const totalCount = res?.pagination?.total ?? list.length
		total.value = totalCount
		hasMore.value = stores.value.length < totalCount
	} catch (err) {
		console.error('Load store list failed:', err)
	} finally {
		loading.value = false
	}
}

function loadMore() {
	if (loading.value || !hasMore.value) return
	page.value += 1
	loadList(false)
}

function goDetail(s) {
	uni.navigateTo({ url: `/pages/store/detail?id=${s._id}` })
}

function doSearch() {
	page.value = 1
	loadList(true)
}

function clearSearch() {
	keyword.value = ''
	page.value = 1
	loadList(true)
}

function setSort(mode) {
	if (sortMode.value === mode) return
	sortMode.value = mode
	page.value = 1
	loadList(true)
}

function goCreate() {
	uni.navigateTo({ url: '/pages/store/create' })
}

function getCover(s) {
	const fallback = '/static/logo.png'
	if (s.coverImage && typeof s.coverImage === 'string' && s.coverImage.length > 0) return s.coverImage
	if (Array.isArray(s.menuImages) && s.menuImages.length > 0) return s.menuImages[0]
	return fallback
}

function isNewStore(store) {
	const createdTime = new Date(store.createdAt || store.updatedAt).getTime()
	const now = new Date().getTime()
	const sevenDays = 7 * 24 * 60 * 60 * 1000
	return (now - createdTime) < sevenDays
}

function distanceText(s) {
	try {
		const coords = s?.location?.coordinates
		if (!coords || coords.length < 2) return ''
		const dist = getDistance(latitude.value, longitude.value, coords[1], coords[0])
		return formatDistance(dist)
	} catch {
		return ''
	}
}

function updatedText(s) {
	return `更新于 ${formatTime(s.updatedAt || s.createdAt)}`
}
</script>

<style lang="scss" scoped>
/* Modern Design System Variables */
:root {
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --secondary-color: #8b5cf6;
  --accent-color: #f59e0b;
  --background: #ffffff;
  --surface: #f8fafc;
  --surface-hover: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --neutral-600: #6b7280;
  --neutral-700: #4b5563;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --radius-sm: 8rpx;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
  --radius-xl: 24rpx;
}

/* Main Container */
.discover-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F7F8FB 0%, #F4F6FA 100%);
  padding-top: 24rpx;
  padding-bottom: 120rpx;
}

/* Hero removed */

/* Search Section */
.search-section {
  padding: 0 24rpx 16rpx;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 0 32rpx 0 80rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);
  border: 1rpx solid #F1F3F5;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 20rpx rgba(0,0,0,0.06);
}

.search-icon {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  height: 88rpx;
  font-size: 30rpx;
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
}

.clear-btn {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 8rpx;
  border-radius: 50%;
  background: #F7F9FC;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.clear-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.search-btn {
  background: #FF6B6B;
  color: #ffffff;
  border: none;
  border-radius: var(--radius-xl);
  padding: 0 32rpx;
  height: 88rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.search-btn:active {
  transform: translateY(2rpx);
  box-shadow: var(--shadow-sm);
}

/* Filters removed */

.create-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--primary-color);
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.create-btn:active {
  transform: scale(0.98);
  background: var(--primary-color);
  color: white;
}

/* Store Section */
.store-section {
  padding: 0 32rpx;
}

/* Loading State */

/* Store Grid */
.store-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24rpx;
}

.store-card {
  display: flex;
  gap: 24rpx;
  background: linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 100%);
  border-radius: var(--radius-xl);
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);
  border: 1rpx solid #F1F3F5;
  transition: all 0.3s ease;
  cursor: pointer;
}

.store-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
}

.card-image-container {
  position: relative;
  flex-shrink: 0;
}

.card-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: var(--radius-lg);
  object-fit: cover;
  box-shadow: var(--shadow-sm);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-lg);
  pointer-events: none;
}

.store-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  padding: 4rpx 12rpx;
  border-radius: var(--radius-sm);
}

.badge-text {
  font-size: 20rpx;
  color: white;
  font-weight: 600;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.store-name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: rgba(251, 191, 36, 0.1);
  padding: 4rpx 8rpx;
  border-radius: var(--radius-sm);
}

.rating-text {
  font-size: 24rpx;
  color: #f59e0b;
  font-weight: 600;
}

.store-desc {
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.store-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: var(--text-muted);
  font-size: 22rpx;
}

.creator-avatar {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid var(--border-color);
}

.creator-name {
  color: var(--text-secondary);
  font-weight: 500;
}

.meta-text {
  color: var(--text-muted);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 32rpx;
}

.empty-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  border-radius: var(--radius-xl);
  color: white;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.empty-btn:active {
  transform: translateY(2rpx);
  box-shadow: var(--shadow-md);
}

/* Load More */
.load-more-container {
  display: flex;
  justify-content: center;
  padding: 32rpx 0;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid var(--border-color);
  border-radius: var(--radius-xl);
  color: var(--primary-color);
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.load-more-btn:active {
  transform: scale(0.98);
}

/* Floating Action Button */
.fab-container {
  position: fixed;
  bottom: 40rpx;
  right: 32rpx;
  z-index: 1000;
}

.fab {
  width: 96rpx;
  height: 96rpx;
  background: #FF6B6B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.35);
  transition: all 0.3s ease;
}

.fab:active {
  transform: scale(0.95);
  box-shadow: 0 5px 15px rgba(107, 114, 128, 0.3);
}

/* Responsive Design */
@media (min-width: 768px) {
  .store-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .store-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
