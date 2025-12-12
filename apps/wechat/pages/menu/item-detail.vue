<template>
	<view class="menu-item-detail-page">
		<text class="title"><uni-icons type="list" size="22"></uni-icons> 菜品详情</text>
		<view v-if="item" class="card">
			<view class="row">
				<text class="label">名称</text>
				<text class="value">{{ item.name }}</text>
			</view>
			<view class="row">
				<text class="label">价格</text>
				<text class="value">¥{{ item.price }}</text>
			</view>
			<view class="row">
				<text class="label">状态</text>
				<text class="value">{{ item.status }}</text>
			</view>
			<view class="row">
				<text class="label">点赞</text>
				<text class="value">{{ item.likeCount || 0 }}</text>
			</view>
			<view class="row">
				<text class="label">报错</text>
				<text class="value">{{ item.reportCount || 0 }}</text>
			</view>
			<view class="actions">
				<button class="btn small" @click="like"><uni-icons type="heart" size="20" color="#E03131"></uni-icons> 点赞</button>
				<button class="btn small danger" @click="report"><uni-icons type="alert" size="20" color="#E03131"></uni-icons> 报错</button>
			</view>
		</view>
		<text v-else class="loading">加载中...</text>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMenuItem, likeMenuItem, reportMenuItem } from '@/api/menu'

const item = ref(null)
const id = ref('')

onLoad(async (options) => {
	id.value = options?.id || ''
	if (!id.value) return
	try {
		const data = await getMenuItem(id.value)
		item.value = data
	} catch (err) {
		console.error('Get item failed:', err)
	}
})

async function like() {
	if (!id.value) return
	try {
		const result = await likeMenuItem(id.value)
		if (result && result.liked) {
			item.value.likeCount = (item.value.likeCount || 0) + 1
		} else {
			item.value.likeCount = Math.max(0, (item.value.likeCount || 1) - 1)
		}
	} catch (err) {
		console.error('Like failed:', err)
	}
}

async function report() {
	if (!id.value) return
	try {
		const updated = await reportMenuItem(id.value)
		item.value.reportCount = (item.value.reportCount || 0) + 1
		if (updated && updated.status === 'pending') {
			item.value.status = 'pending'
		}
	} catch (err) {
		console.error('Report failed:', err)
	}
}
</script>

<style lang="scss" scoped>
.menu-item-detail-page {
	padding: 32rpx;
}
.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #212529;
	margin-bottom: 16rpx;
}
.card {
	background: #FFFFFF;
	border-radius: 12rpx;
	padding: 16rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.label {
	font-size: 28rpx;
	color: #495057;
}
.value {
	font-size: 28rpx;
	color: #212529;
}
.actions {
	margin-top: 8rpx;
	display: flex;
	gap: 8rpx;
}
.loading {
	font-size: 26rpx;
	color: #868E96;
	text-align: center;
}
</style>
