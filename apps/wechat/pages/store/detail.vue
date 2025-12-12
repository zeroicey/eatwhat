<template>
	<view class="store-detail-page">
		<text class="title">Store Detail</text>
		<text class="desc">Store information and menu</text>
	</view>
</template>

<script setup>
import { ref } from 'vue'

// TODO: 实现店铺详情功能
const storeInfo = ref(null)
</script>

<style lang="scss" scoped>
.store-detail-page {
	padding: 32rpx;

	.title {
		font-size: 36rpx;
		font-weight: 600;
		margin-bottom: 16rpx;
	}

	.desc {
		font-size: 28rpx;
		color: #868E96;
	}
}
</style>
