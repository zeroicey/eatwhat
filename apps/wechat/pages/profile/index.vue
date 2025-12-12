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
		<view class="actions" v-else>
			<button class="btn secondary" @click="goContributions">我的贡献</button>
			<button class="btn secondary" @click="goSettings">资料设置</button>
			<button class="btn danger" @click="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { getMe } from '@/api/user'

const userStore = useUserStore()
const appStore = useAppStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userNickname = computed(() => userStore.nickname)
const userAvatar = computed(() => userStore.avatar || '/static/logo.png')
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
}
.actions .btn.primary { grid-column: span 2; }
</style>
