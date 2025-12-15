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
					<view class="pill-btn primary" @click="goDigitize">
						<uni-icons type="paperplane" size="20" color="#ffffff"></uni-icons>
						<text>录入菜品</text>
					</view>
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
							<view class="icon-btn" @click="handleLike(m)">
								<uni-icons type="heart" size="20" color="#ef4444"></uni-icons>
								<text class="count">{{ m.likeCount || 0 }}</text>
							</view>
							<view class="report-badge" @click="handleReport(m)">
								<text class="number">{{ m.reportCount || 0 }}</text>
							</view>
							<view class="pill-btn sm" @click="goItemDetail(m)">
								<uni-icons type="info" size="16"></uni-icons>
								<text>详情</text>
							</view>
						</view>
					</view>
				</view>
				<view v-if="hasMore && !loading" class="pill-btn outline" @click="loadMore">
					<text>加载更多</text>
					<uni-icons type="arrow-down" size="16"></uni-icons>
				</view>
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
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}
.banner {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  background: #eef2f7;
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
  background: #eef2f7;
}
.creator-name {
  font-size: 26rpx;
  color: #64748b;
}
.desc {
  font-size: 28rpx;
  color: #64748b;
}
.section {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12rpx;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 12rpx;
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
  background: #eef2f7;
}
.empty {
  font-size: 26rpx;
  color: #94a3b8;
}
.pill-btn {
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f1f5f9;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid #e2e8f0;
}
.pill-btn.sm {
  height: 48rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  gap: 6rpx;
}
.pill-btn.primary {
  background: #3b82f6;
  color: #ffffff;
  border-color: transparent;
}
.pill-btn.outline {
  background: #ffffff;
  color: #334155;
}
.icon-btn {
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: #f8fafc;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid #e2e8f0;
}
.icon-btn .count {
  font-size: 24rpx;
  color: #64748b;
}
.icon-btn.danger {
  background: #fff5f5;
  border-color: #ffe3e3;
}
.report-badge {
  height: 48rpx;
  min-width: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: #fff5f5;
  border: 2rpx solid #ffe3e3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.report-badge .number {
  font-size: 24rpx;
  color: #ef4444;
  font-weight: 600;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.item {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name {
  font-size: 30rpx;
  color: #1e293b;
}
.price {
  font-size: 28rpx;
  color: #334155;
}
.row2 {
  margin-top: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status {
  font-size: 24rpx;
  color: #ef4444;
}
.actions {
  display: flex;
  gap: 8rpx;
}
.btn {
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  color: #374151;
  border: 2rpx solid #e5e7eb;
}
.btn.primary {
  background: #6b7280;
  color: #ffffff;
  border-color: transparent;
}
.btn.small {
  height: 48rpx;
  padding: 0 16rpx;
}
.btn.danger {
  background: #ef4444;
  color: #ffffff;
  border-color: transparent;
}
.loading {
  font-size: 26rpx;
  color: #94a3b8;
  text-align: center;
  padding: 8rpx 0;
}
</style>
