<template>
	<view class="home-page">
		<text class="title">Home Page - Moments Feed</text>
		<text class="desc">This is the home page displaying food moments</text>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// TODO: 实现动态流功能
const moments = ref([])

onMounted(() => {
	console.log('Home page mounted')
})
</script>

<style lang="scss" scoped>
.home-page {
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
