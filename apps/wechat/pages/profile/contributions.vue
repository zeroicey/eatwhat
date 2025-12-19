<template>
	<view class="contributions-page">
		<text class="title">我的贡献</text>
		<view v-if="!isLoggedIn" class="empty">
			<uni-icons type="person" size="36"></uni-icons>
			<text class="empty-text">请先登录后查看你的贡献</text>
			<button class="primary-btn" @click="goLogin">去登录</button>
		</view>
	<view v-else class="grid">
			<view class="card">
				<text class="card-title">我创建的店铺</text>
				<text class="card-desc">共 {{ storeTotal }} 条最近贡献</text>
				<view class="list">
					<view class="item" v-for="s in myStores" :key="s._id">
						<uni-icons type="shop" size="22"></uni-icons>
						<text class="item-text ellipsis">{{ s.name }}</text>
					</view>
				</view>
				<button class="outline-btn" @click="goDiscover">浏览店铺</button>
			</view>
			<view class="card">
				<text class="card-title">我录入的菜品</text>
				<text class="card-desc">共 {{ menuTotal }} 条最近贡献</text>
				<view class="list">
					<view class="item" v-for="m in myMenuItems" :key="m._id">
						<uni-icons type="list" size="22"></uni-icons>
						<text class="item-text ellipsis">{{ m.name }} · ¥{{ m.price }}</text>
					</view>
				</view>
				<button class="outline-btn" @click="goHome">浏览首页</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getMyStores, getMyMenuItems } from '@/api/user'

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const myStores = ref([])
const myMenuItems = ref([])
const storeTotal = ref(0)
const menuTotal = ref(0)

onMounted(async () => {
	if (!isLoggedIn.value) return
	try {
		const storesRes = await getMyStores({ page: 1, limit: 5 })
		myStores.value = storesRes || []
		storeTotal.value = (storesRes && storesRes.length) || 0
	} catch {}
	try {
		const menuRes = await getMyMenuItems({ page: 1, limit: 5 })
		myMenuItems.value = menuRes || []
		menuTotal.value = (menuRes && menuRes.length) || 0
	} catch {}
})

function goLogin() {
	uni.navigateTo({ url: '/pages/auth/login' })
}
function goDiscover() {
	uni.switchTab({ url: '/pages/discover/index' })
}
function goHome() {
	uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
.contributions-page {
	padding: 32rpx;
}
.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #212529;
	margin-bottom: 24rpx;
}
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}
.empty-text {
	font-size: 28rpx;
	color: #868E96;
}
.grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 16rpx;
}
.card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}
.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #212529;
}
.card-desc {
	font-size: 26rpx;
	color: #868E96;
	margin-bottom: 8rpx;
}
.list {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin-bottom: 12rpx;
}
.item { display: flex; align-items: center; gap: 8rpx; padding: 12rpx; background: #F8F9FA; border-radius: 12rpx; }
.item-text { font-size: 26rpx; color: #495057; }
.primary-btn {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%);
	color: #FFFFFF;
	font-size: 28rpx;
	font-weight: 600;
	border: none;
	box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
	margin-top: 12rpx;

	&:active {
		opacity: 0.9;
		transform: scale(0.98);
	}
}
.outline-btn {
	width: 100%;
	height: 80rpx;
	line-height: 76rpx;
	border-radius: 40rpx;
	background: #FFFFFF;
	color: #FF6B6B;
	font-size: 28rpx;
	font-weight: 600;
	border: 2rpx solid #FF6B6B;
	margin-top: 12rpx;

	&:active {
		background: #FFF5F5;
	}
}
</style>
