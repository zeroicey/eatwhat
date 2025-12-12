<template>
	<view class="profile-page">
		<view class="header" v-if="isLoggedIn">
			<image class="avatar" :src="userAvatar" mode="aspectFill"></image>
			<view class="info">
				<text class="nickname">{{ userNickname || '未设置昵称' }}</text>
				<text class="meta">最近登录：{{ lastLoginTime }}</text>
			</view>
		</view>

		<view class="header" v-else>
			<image class="avatar placeholder" src="/static/logo.png" mode="aspectFill"></image>
			<view class="info">
				<text class="nickname">未登录</text>
				<text class="meta">请先登录以使用个人功能</text>
			</view>
		</view>

		<view class="actions" v-if="!isLoggedIn">
			<button class="btn primary" @click="goLogin">微信登录</button>
		</view>
		<view v-else>
			<view class="stats-grid">
				<view class="stat-card">
					<view class="stat-icon"><uni-icons type="shop" size="28"></uni-icons></view>
					<text class="stat-value">{{ storeCount }}</text>
					<text class="stat-label">创建的店铺</text>
				</view>
				<view class="stat-card">
					<view class="stat-icon"><uni-icons type="list" size="28"></uni-icons></view>
					<text class="stat-value">{{ menuCount }}</text>
					<text class="stat-label">录入的菜品</text>
				</view>
			</view>
			<view class="actions">
				<view class="chip-btn" @click="goContributions">我的贡献</view>
				<view class="chip-btn" @click="goSettings">资料设置</view>
				<view class="cta-btn" @click="handleLogout">退出登录</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { getMe, getMyStores, getMyMenuItems } from '@/api/user'

const userStore = useUserStore()
const appStore = useAppStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userNickname = computed(() => userStore.nickname)
const userAvatar = computed(() => userStore.avatar || '/static/logo.png')
const storeCount = ref(0)
const menuCount = ref(0)
const lastLoginTime = computed(() => {
	if (!userStore.loginTime) return '—'
	const d = new Date(userStore.loginTime)
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	const hh = String(d.getHours()).padStart(2, '0')
	const mm = String(d.getMinutes()).padStart(2, '0')
	return `${y}-${m}-${day} ${hh}:${mm}`
})

onShow(() => {
	// 恢复 Token 并检查认证
	userStore.restoreToken()
	if (!userStore.checkAuth()) return
	getMe().then((me) => {
		const mapped = {
			id: me.id || me._id || null,
			nickname: me.nickName || me.nickname || '',
			avatar: me.avatarUrl || me.avatar || ''
		}
		userStore.updateProfile(mapped)
	}).catch(() => {})

	Promise.all([
		getMyStores({ page: 1, limit: 1 }),
		getMyMenuItems({ page: 1, limit: 1 })
	]).then(([stores, menus]) => {
		storeCount.value = Array.isArray(stores) ? stores.length : (stores?.total || 0)
		menuCount.value = Array.isArray(menus) ? menus.length : (menus?.total || 0)
	}).catch(() => {})
})

function goLogin() {
	uni.navigateTo({ url: '/pages/auth/login' })
}

function goContributions() {
	uni.navigateTo({ url: '/pages/profile/contributions' })
}

function goSettings() {
	uni.navigateTo({ url: '/pages/profile/settings' })
}

function handleLogout() {
	userStore.logout()
	appStore.showToast({ message: '已退出登录', type: 'success' })
}
</script>

<style lang="scss" scoped>
.profile-page {
	display: flex;
	flex-direction: column;
	padding: 32rpx;
	gap: 24rpx;
}

.header {
	display: flex;
	align-items: center;
	gap: 24rpx;
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	background: #F1F3F5;
}
.avatar.placeholder {
	opacity: 0.8;
}

.info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.nickname {
	font-size: 34rpx;
	font-weight: 600;
	color: #212529;
}
.meta {
	font-size: 26rpx;
	color: #868E96;
}

.actions {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-top: 24rpx;
}
.actions .btn.block { grid-column: span 2; }
.chip-btn { display: flex; align-items: center; justify-content: center; height: 72rpx; border-radius: 36rpx; background: #F8F9FA; color: #343A40; font-size: 28rpx; font-weight: 600; box-shadow: 0 6rpx 12rpx rgba(0,0,0,0.06); }
.cta-btn { display: flex; align-items: center; justify-content: center; height: 80rpx; border-radius: 40rpx; background: #FFF5F5; color: #E03131; font-size: 30rpx; font-weight: 700; box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.08); grid-column: span 2; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.stat-card { background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 8rpx; align-items: flex-start; }
.stat-icon { width: 56rpx; height: 56rpx; border-radius: 12rpx; background: #FFF5F5; color: #FF6B6B; display: flex; align-items: center; justify-content: center; }
.stat-value { font-size: 40rpx; font-weight: 700; color: #212529; }
.stat-label { font-size: 24rpx; color: #868E96; }
</style>
