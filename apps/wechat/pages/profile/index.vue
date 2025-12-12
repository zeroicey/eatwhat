<template>
	<view class="profile-page">
		<text class="title">Profile Page - Personal Center</text>
		<text class="desc">View your profile and settings</text>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// TODO: 实现个人中心功能
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
</script>

<style lang="scss" scoped>
.profile-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 32rpx;

	.title {
		font-size: 36rpx;
		font-weight: 600;
		color: #212529;
		margin-bottom: 16rpx;
	}

	.desc {
		font-size: 28rpx;
		color: #868E96;
	}
}
</style>
