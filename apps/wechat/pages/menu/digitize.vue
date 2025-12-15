<template>
	<view class="digitize-menu-page">
		<view v-if="bannerImages.length > 0" class="banner">
			<swiper 
				class="banner-swiper" 
				indicator-dots 
				:circular="true" 
				:autoplay="false" 
				:current="currentBanner"
				@change="onBannerChange"
			>
				<swiper-item v-for="(img, idx) in bannerImages" :key="idx">
					<image :src="img" class="banner-img" mode="aspectFill" @click="previewBanner(idx)" />
				</swiper-item>
			</swiper>
		</view>
		<view v-else-if="bannerImage" class="banner">
			<image :src="bannerImage" class="banner-img" mode="aspectFill" @click="previewBanner(0)" />
		</view>
		<text class="title"><uni-icons type="compose" size="22"></uni-icons> 菜单数字化</text>
		<view class="form">
			<input class="input" type="text" v-model="name" placeholder="菜名" />
			<input class="input" type="digit" v-model="price" placeholder="价格（元）" />
			<button class="btn primary" :disabled="submitting" @click="submitItem"><uni-icons type="plus" size="22"></uni-icons> 添加菜品</button>
		</view>
		<view class="list-header">
			<text class="list-title">已录入菜品</text>
			<text class="meta">共 {{ total }} 条</text>
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
						<button class="btn small" @click="handleLike(m)"><uni-icons type="heart" size="20" color="#E03131"></uni-icons> {{ m.likeCount || 0 }}</button>
						<button class="btn small danger" @click="handleReport(m)"><uni-icons type="alert" size="20" color="#E03131"></uni-icons> {{ m.reportCount || 0 }}</button>
						<button class="btn small" @click="goDetail(m)"><uni-icons type="info" size="20"></uni-icons> 详情</button>
					</view>
				</view>
			</view>
			<button v-if="hasMore && !loading" class="btn" @click="loadMore"><uni-icons type="more" size="22"></uni-icons> 加载更多</button>
			<text v-if="loading" class="loading">加载中...</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import { getStoreDetail } from '@/api/store'
import { previewImage } from '@/utils/helpers'
import { getMenuItems, digitizeMenu, likeMenuItem, reportMenuItem } from '@/api/menu'

const appStore = useAppStore()
const storeId = ref('')
const name = ref('')
const price = ref('')
const submitting = ref(false)
const items = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const loading = ref(false)
const hasMore = ref(false)
const storeInfo = ref(null)
const bannerImage = ref('')
const bannerImages = ref([])
const currentBanner = ref(0)

onLoad(async (options) => {
	storeId.value = options?.storeId || ''
	if (storeId.value) {
		try {
			const detail = await getStoreDetail(storeId.value)
			storeInfo.value = detail
			const imgs = Array.isArray(detail?.menuImages) ? detail.menuImages : []
			if (imgs.length > 0) {
				bannerImages.value = imgs
				bannerImage.value = imgs[0]
			} else if (detail?.coverImage) {
				bannerImage.value = detail.coverImage
				bannerImages.value = [detail.coverImage]
			} else {
				bannerImage.value = ''
				bannerImages.value = []
			}
		} catch (e) {
			console.error('Load store detail failed:', e)
		}
	}
	loadList(true)
})

function onBannerChange(e) {
	currentBanner.value = e?.detail?.current || 0
}

function previewBanner(idx = 0) {
	if (bannerImages.value.length === 0) return
	previewImage(bannerImages.value, idx)
}

function validate() {
	if (!storeId.value) {
		appStore.showToast({ message: '缺少店铺ID', type: 'error' })
		return false
	}
	if (!name.value || !name.value.trim()) {
		appStore.showToast({ message: '请输入菜名', type: 'error' })
		return false
	}
	const p = Number(price.value)
	if (isNaN(p) || p <= 0) {
		appStore.showToast({ message: '请输入有效价格', type: 'error' })
		return false
	}
	// 保留两位小数
	price.value = (Math.round(p * 100) / 100).toString()
	return true
}

async function submitItem() {
	if (submitting.value) return
	if (!validate()) return
	try {
		submitting.value = true
		await digitizeMenu({ storeId: storeId.value, name: name.value.trim(), price: Number(price.value) })
		name.value = ''
		price.value = ''
		page.value = 1
		await loadList(true)
		appStore.showToast({ message: '添加成功', type: 'success' })
	} catch (err) {
		console.error('Add menu item failed:', err)
		appStore.showToast({ message: '添加失败', type: 'error' })
	} finally {
		submitting.value = false
	}
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
		// 尝试从响应结构读取分页信息
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

function goDetail(m) {
	uni.navigateTo({ url: `/pages/menu/item-detail?id=${m._id}` })
}
</script>

<style lang="scss" scoped>
.digitize-menu-page {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.banner {
  width: 100%;
  height: 280rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #eef2f7;
}
.banner-swiper {
  width: 100%;
  height: 100%;
}
.banner-img {
  width: 100%;
  height: 100%;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}
.form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12rpx;
  background: #ffffff;
  border-radius: 12rpx;
  padding: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.input {
  height: 72rpx;
  background: #f3f4f6;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}
.meta {
  font-size: 26rpx;
  color: #94a3b8;
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
