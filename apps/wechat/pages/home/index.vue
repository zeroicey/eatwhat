<template>
	<view class="home-page">
		<view class="hero">
			<image class="hero-logo" src="/static/logo.png" mode="aspectFill" />
			<view class="hero-info">
				<text class="title">吃什么</text>
				<text class="subtitle">众包美食地图 · 拼单带饭</text>
			</view>
		</view>

		<view class="section">
			<text class="section-title">快捷入口</text>
			<view class="actions-grid">
				<view class="action-card" @click="goDiscover">
					<view class="icon"><uni-icons type="discover" size="28"></uni-icons></view>
					<text class="label">发现好店</text>
				</view>
				<view class="action-card" @click="goCart">
					<view class="icon"><uni-icons type="cart" size="28"></uni-icons></view>
					<text class="label">我的清单</text>
				</view>
				<view class="action-card" @click="goPublishMoment">
					<view class="icon"><uni-icons type="paperplane" size="28"></uni-icons></view>
					<text class="label">发布动态</text>
				</view>
				<view class="action-card" @click="goDigitize">
					<view class="icon"><uni-icons type="compose" size="28"></uni-icons></view>
					<text class="label">菜单数字化</text>
				</view>
			</view>
		</view>

		<view class="section">
			<text class="section-title">为你推荐</text>
			<view class="placeholder-card">
				<text class="placeholder-text">敬请期待～</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onPullDownRefresh } from '@dcloudio/uni-app'

function goDiscover() { uni.switchTab({ url: '/pages/discover/index' }) }
function goCart() { uni.switchTab({ url: '/pages/cart/index' }) }
function goPublishMoment() { uni.navigateTo({ url: '/pages/moment/publish' }) }
function goDigitize() { uni.navigateTo({ url: '/pages/menu/digitize' }) }

onPullDownRefresh(() => { uni.stopPullDownRefresh() })
</script>

<style lang="scss" scoped>
.home-page { display: flex; flex-direction: column; gap: 24rpx; padding: 32rpx; }
.hero { display: flex; align-items: center; gap: 16rpx; background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); }
.hero-logo { width: 120rpx; height: 120rpx; border-radius: 16rpx; background: #F1F3F5; }
.hero-info { display: flex; flex-direction: column; gap: 8rpx; }
.title { font-size: 40rpx; font-weight: 700; color: #212529; }
.subtitle { font-size: 26rpx; color: #868E96; }
.section { display: flex; flex-direction: column; gap: 12rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #212529; }
.actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.action-card { background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); display: flex; align-items: center; gap: 12rpx; }
.icon { width: 56rpx; height: 56rpx; border-radius: 12rpx; background: #FFF5F5; color: #FF6B6B; display: flex; align-items: center; justify-content: center; }
.label { font-size: 28rpx; color: #212529; font-weight: 600; }
.placeholder-card { background: #FFFFFF; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; }
.placeholder-text { font-size: 26rpx; color: #868E96; }
</style>
