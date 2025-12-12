<template>
	<view class="login-page">
		<view class="login-container">
			<text class="title">Welcome to EatWhat</text>
			<text class="subtitle">Login to continue</text>
			<input class="text-input" type="text" v-model="username" placeholder="用户名" />
			<input class="text-input" type="password" v-model="password" placeholder="密码" />
			<button class="login-btn" :disabled="isLogging" @click="handleLogin">登录</button>
			<button class="register-btn" :disabled="isLogging" @click="handleRegister">注册</button>
		</view>
	</view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { login as loginApi, register as registerApi } from '@/api/auth'
import { ref } from 'vue'

const userStore = useUserStore()
const appStore = useAppStore()
const isLogging = ref(false)
const username = ref('')
const password = ref('')

const handleLogin = () => {
	if (isLogging.value) return
	if (isLogging.value) return
	isLogging.value = true
	appStore.showLoading('Logging in...')
	loginApi({ username: username.value, password: password.value })
		.then((result) => {
			const { token, user } = result || {}
			if (!token || !user) throw new Error('Invalid login response')
			userStore.login({
				token,
				userInfo: {
					id: user.id || user._id || user.userId || null,
					nickname: user.nickName || user.nickname || '',
					avatar: user.avatarUrl || user.avatar || '',
					username: user.username || username.value
				}
			})
			appStore.hideLoading()
			isLogging.value = false
			appStore.showToast({ message: '登录成功', type: 'success' })
			uni.reLaunch({ url: '/pages/profile/index' })
		})
		.catch((err) => {
			console.error('Login failed:', err)
			appStore.hideLoading()
			isLogging.value = false
			appStore.showToast({ message: '登录失败', type: 'error' })
		})
}

const handleRegister = () => {
	if (isLogging.value) return
	isLogging.value = true
	appStore.showLoading('Registering...')
	registerApi({ username: username.value, password: password.value })
		.then((result) => {
			const { token, user } = result || {}
			if (!token || !user) throw new Error('Invalid register response')
			userStore.login({
				token,
				userInfo: {
					id: user.id || user._id || user.userId || null,
					nickname: user.nickName || user.nickname || '',
					avatar: user.avatarUrl || user.avatar || '',
					username: user.username || username.value
				}
			})
			appStore.hideLoading()
			isLogging.value = false
			appStore.showToast({ message: '注册并登录成功', type: 'success' })
			uni.reLaunch({ url: '/pages/profile/index' })
		})
		.catch((err) => {
			console.error('Register failed:', err)
			appStore.hideLoading()
			isLogging.value = false
			appStore.showToast({ message: '注册失败', type: 'error' })
		})
}
</script>

<style lang="scss" scoped>
.login-page {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background: linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%);
	padding: 32rpx;

	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 64rpx 48rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);

		.title {
			font-size: 40rpx;
			font-weight: 600;
			color: #212529;
			margin-bottom: 16rpx;
		}

		.subtitle {
			font-size: 28rpx;
			color: #868E96;
			margin-bottom: 48rpx;
		}
		.text-input {
			width: 400rpx;
			height: 72rpx;
			background: #F8F9FA;
			border-radius: 12rpx;
			padding: 0 24rpx;
			font-size: 28rpx;
			margin-bottom: 16rpx;
		}

		.login-btn {
			width: 400rpx;
			height: 88rpx;
			background: #FF6B6B;
			color: #FFFFFF;
			border: none;
			border-radius: 44rpx;
			font-size: 32rpx;
			font-weight: 500;
		}
		.register-btn {
			width: 400rpx;
			height: 72rpx;
			background: #F1F3F5;
			color: #343A40;
			border: none;
			border-radius: 36rpx;
			font-size: 28rpx;
			font-weight: 500;
			margin-top: 12rpx;
		}
	}
}
</style>
