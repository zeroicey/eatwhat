<template>
	<view class="login-page">
		<view class="login-container">
			<text class="title">Welcome to EatWhat</text>
			<text class="subtitle">Login to continue</text>
			<button class="login-btn" @click="handleLogin">Login with WeChat</button>
		</view>
	</view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const userStore = useUserStore()
const appStore = useAppStore()

// TODO: 实现微信登录
const handleLogin = () => {
	uni.login({
		provider: 'weixin',
		success: (loginRes) => {
			console.log('Login code:', loginRes.code)
			// TODO: 调用后端接口进行登录
			appStore.showToast({
				message: 'Login feature coming soon',
				type: 'info'
			})
		},
		fail: (err) => {
			console.error('Login failed:', err)
			appStore.showToast({
				message: 'Login failed',
				type: 'error'
			})
		}
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
	}
}
</style>
