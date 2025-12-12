<template>
	<view class="cart-page">
		<text class="title">Cart Page - Order List</text>
		<text class="desc">Manage your cross-store cart</text>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

// TODO: 实现购物车功能
const totalItems = computed(() => cartStore.totalItemCount)
const totalPrice = computed(() => cartStore.totalPrice)
</script>

<style lang="scss" scoped>
.cart-page {
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
