<template>
	<view class="contributions-page">
		<text class="title">我的贡献</text>
		<view v-if="!isLoggedIn" class="empty">
			<uni-icons type="person" size="36"></uni-icons>
			<text class="empty-text">请先登录后查看你的贡献</text>
			<button class="btn primary" @click="goLogin">去登录</button>
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
				<button class="btn" @click="goDiscover">浏览店铺</button>
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
				<button class="btn" @click="goHome">浏览首页</button>
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
.btn {
	height: 72rpx;
	border-radius: 36rpx;
	font-size: 28rpx;
	padding: 0 28rpx;
	background: #F1F3F5;
	color: #343A40;
}
.btn.primary {
	background: #FF6B6B;
	color: #FFFFFF;
}
</style>
