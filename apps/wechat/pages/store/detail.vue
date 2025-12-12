<template>
	<view class="store-detail-page">
		<image v-if="storeInfo?.coverImage" :src="storeInfo.coverImage" class="banner" mode="aspectFill" />
		<text class="title">{{ storeInfo?.name || '店铺详情' }}</text>
		<view class="creator-row" v-if="storeInfo?.creator">
			<image v-if="storeInfo.creator.avatarUrl" :src="storeInfo.creator.avatarUrl" class="avatar" mode="aspectFill" />
			<text class="creator-name">{{ storeInfo.creator.nickName || '—' }}</text>
		</view>
		<text class="desc">{{ storeInfo?.description || '店铺信息与菜单' }}</text>
		<view class="section">
		<text class="section-title"><uni-icons type="image" size="22"></uni-icons> 图片菜单</text>
			<view class="images" v-if="(storeInfo?.menuImages || []).length">
				<image v-for="(img, idx) in storeInfo.menuImages" :key="idx" :src="img" class="menu-img" mode="aspectFill" />
			</view>
			<text v-else class="empty">暂无菜单图片</text>
		</view>
		<view class="section">
			<view class="header-row">
				<text class="section-title"><uni-icons type="list" size="22"></uni-icons> 电子菜单</text>
				<view class="header-actions">
					<button class="btn" @click="goDigitize"><uni-icons type="plus" size="22"></uni-icons> 录入菜品</button>
				</view>
			</view>
			<view class="list">
				<view class="item" v-for="m in items" :key="m._id">
					<view class="row">
						<text class="name">{{ m.name }}</text>
						<text class="price">¥{{ m.price }}</text>
					</view>
					<view class="row2">
						<text class="status" v-if="m.status === 'pending'">待确认</text>
						<view class="actions">
							<button class="btn small" @click="handleLike(m)">👍 {{ m.likeCount || 0 }}</button>
							<button class="btn small danger" @click="handleReport(m)">⚠️ {{ m.reportCount || 0 }}</button>
							<button class="btn small" @click="goItemDetail(m)">详情</button>
						</view>
					</view>
				</view>
				<button v-if="hasMore && !loading" class="btn" @click="loadMore"><uni-icons type="more" size="22"></uni-icons> 加载更多</button>
				<text v-if="loading" class="loading">加载中...</text>
				<text v-if="!loading && items.length === 0" class="empty">暂无电子菜单</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import { getStoreDetail } from '@/api/store'
import { getMenuItems, likeMenuItem, reportMenuItem } from '@/api/menu'

const appStore = useAppStore()
const storeId = ref('')
const storeInfo = ref(null)
const items = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const loading = ref(false)
const hasMore = ref(false)

onLoad(async (options) => {
	storeId.value = options?.id || options?.storeId || ''
	if (!storeId.value) {
		appStore.showToast({ message: '缺少店铺ID', type: 'error' })
		return
	}
	try {
		appStore.showLoading('Loading...')
		const data = await getStoreDetail(storeId.value)
		storeInfo.value = data
		await loadList(true)
	} catch (err) {
		console.error('Load store detail failed:', err)
	} finally {
		appStore.hideLoading()
	}
})

function goDigitize() {
	if (!storeId.value) return
	uni.navigateTo({ url: `/pages/menu/digitize?storeId=${storeId.value}` })
}

async function loadList(refresh = false) {
	try {
		loading.value = true
		const res = await getMenuItems(storeId.value, { page: page.value, limit: limit.value })
		const list = Array.isArray(res) ? res : (res?.items || res || [])
		if (refresh) {
			items.value = list
		} else {
			items.value = items.value.concat(list)
		}
		const totalCount = res?.pagination?.total ?? list.length
		total.value = totalCount
		hasMore.value = items.value.length < totalCount
	} catch (err) {
		console.error('Load menu items failed:', err)
	} finally {
		loading.value = false
	}
}

function loadMore() {
	if (loading.value || !hasMore.value) return
	page.value += 1
	loadList(false)
}

async function handleLike(m) {
	try {
		const prev = m.likeCount || 0
		m.likeCount = prev + 1
		const result = await likeMenuItem(m._id)
		if (result && result.liked === false) {
			m.likeCount = Math.max(0, prev - 1)
		}
	} catch (err) {
		console.error('Like failed:', err)
	}
}

async function handleReport(m) {
	try {
		m.reportCount = (m.reportCount || 0) + 1
		const updated = await reportMenuItem(m._id)
		if (updated && updated.status === 'pending') {
			m.status = 'pending'
		}
	} catch (err) {
		console.error('Report failed:', err)
	}
}

function goItemDetail(m) {
	uni.navigateTo({ url: `/pages/menu/item-detail?id=${m._id}` })
}
</script>

<style lang="scss" scoped>
.store-detail-page {
	padding: 32rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}
.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #212529;
}
.banner {
	width: 100%;
	height: 300rpx;
	border-radius: 12rpx;
	background: #F1F3F5;
}
.creator-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
}
.avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	background: #F1F3F5;
}
.creator-name {
	font-size: 26rpx;
	color: #495057;
}
.desc {
	font-size: 28rpx;
	color: #868E96;
}
.section {
	background: #FFFFFF;
	border-radius: 12rpx;
	padding: 16rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}
.section-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #212529;
	margin-bottom: 12rpx;
}
.header-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.header-actions {
	display: flex;
	gap: 8rpx;
}
.images {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 8rpx;
}
.menu-img {
	width: 100%;
	height: 200rpx;
	border-radius: 8rpx;
	background: #F1F3F5;
}
.empty {
	font-size: 26rpx;
	color: #868E96;
}
.list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}
.item {
	background: #FFFFFF;
	border-radius: 12rpx;
	padding: 16rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}
.row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.name {
	font-size: 30rpx;
	color: #212529;
}
.price {
	font-size: 28rpx;
	color: #343A40;
}
.row2 {
	margin-top: 8rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.status {
	font-size: 24rpx;
	color: #E03131;
}
.actions {
	display: flex;
	gap: 8rpx;
}
.loading {
	font-size: 26rpx;
	color: #868E96;
	text-align: center;
	padding: 8rpx 0;
}
</style>
