<template>
	<view class="discover-page">
		<text class="title">发现好店</text>
		<view class="search-bar">
			<input class="text-input" type="text" v-model="keyword" placeholder="搜索店铺或菜品" />
			<button class="btn" @click="doSearch"><uni-icons type="search" size="22"></uni-icons> 搜索</button>
			<button class="btn secondary" @click="clearSearch" v-if="keyword">清空</button>
		</view>
		<view class="filters">
			<view class="chip" :class="{ active: sortMode === 'recent' }" @click="setSort('recent')">
				<uni-icons type="calendar" size="20"></uni-icons>
				<text>最近更新</text>
			</view>
			<view class="chip" :class="{ active: sortMode === 'distance' }" @click="setSort('distance')">
				<uni-icons type="location" size="20"></uni-icons>
				<text>距离优先</text>
			</view>
			<button class="btn small" @click="goCreate"><uni-icons type="plusempty" size="18"></uni-icons> 创建店铺</button>
		</view>
		<view class="list">
			<view v-if="loading" class="skeleton-list">
				<view class="skeleton-card" v-for="n in 4" :key="n"></view>
			</view>
			<view v-else>
				<view class="store-card" v-for="s in stores" :key="s._id" @click="goDetail(s)">
					<image class="cover" :src="getCover(s)" mode="aspectFill" />
					<view class="info">
						<text class="name ellipsis">{{ s.name }}</text>
						<text class="desc ellipsis-2">{{ s.description || '—' }}</text>
						<view class="meta-row">
							<view class="creator" v-if="s.creator">
								<image v-if="s.creator.avatarUrl" :src="s.creator.avatarUrl" class="avatar" mode="aspectFill" />
								<text class="creator-name">{{ s.creator.nickName || '—' }}</text>
							</view>

							<view class="chip light" v-if="longitude && latitude && s.location && s.location.coordinates">
								<uni-icons type="location" size="18"></uni-icons>
								<text>{{ distanceText(s) }}</text>
							</view>
							<view class="chip light">
								<uni-icons type="time" size="18"></uni-icons>
								<text>{{ updatedText(s) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="load-more" v-if="hasMore && !loading">
				<button class="btn" @click="loadMore"><uni-icons type="more" size="22"></uni-icons> 加载更多</button>
			</view>
			<text v-if="!loading && stores.length === 0" class="empty">暂无店铺，快去创建吧</text>
		</view>
		<button class="fab" @click="goCreate">创建店铺</button>
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
.discover-page { padding: 32rpx; }
.title { font-size: 36rpx; font-weight: 600; color: #212529; margin-bottom: 16rpx; }
.search-bar { display: grid; grid-template-columns: 1fr auto auto; gap: 8rpx; margin-bottom: 12rpx; }
.text-input { height: 72rpx; background: #F8F9FA; border-radius: 12rpx; padding: 0 24rpx; font-size: 28rpx; }
.filters { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.chip { display: inline-flex; align-items: center; gap: 8rpx; padding: 0 16rpx; height: 56rpx; border-radius: 28rpx; background: #F1F3F5; color: #343A40; font-size: 24rpx; }
.chip.light { height: 48rpx; padding: 0 12rpx; background: #F8F9FA; font-size: 22rpx; }
.chip.active { background: #FF6B6B; color: #FFFFFF; }
.list { display: flex; flex-direction: column; gap: 12rpx; }
.skeleton-list { display: grid; grid-template-columns: 1fr; gap: 12rpx; }
.skeleton-card { height: 160rpx; border-radius: 12rpx; background: linear-gradient(90deg, #f3f4f6 25%, #e9ecef 37%, #f3f4f6 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
.store-card { background: #FFFFFF; border-radius: 12rpx; padding: 12rpx; box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06); display: grid; grid-template-columns: 200rpx 1fr; gap: 12rpx; align-items: center; }
.cover { width: 200rpx; height: 140rpx; border-radius: 8rpx; background: #F1F3F5; }
.info { display: flex; flex-direction: column; gap: 6rpx; }
.meta-row { display: flex; gap: 8rpx; align-items: center; flex-wrap: wrap; }
.creator { display: flex; align-items: center; gap: 6rpx; }
.avatar { width: 32rpx; height: 32rpx; border-radius: 16rpx; background: #F1F3F5; }
.name { font-size: 30rpx; color: #212529; }
.desc { font-size: 26rpx; color: #868E96; }
.load-more { display: flex; justify-content: center; padding: 8rpx 0; }
.empty { font-size: 26rpx; color: #868E96; text-align: center; padding: 16rpx 0; }
.loading { font-size: 26rpx; color: #868E96; text-align: center; padding: 8rpx 0; }
</style>
