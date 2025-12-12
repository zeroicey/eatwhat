<template>
	<view class="discover-page">
		<text class="title">Discover Page - Store List</text>
		<text class="desc">Browse and search stores</text>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// TODO: 实现店铺列表功能
const stores = ref([])

onMounted(() => {
	console.log('Discover page mounted')
})
</script>

<style lang="scss" scoped>
.discover-page {
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
