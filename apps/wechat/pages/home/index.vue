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
            <view class="section-title-row">
                <uni-icons type="list" size="20"></uni-icons>
                <text class="section-title">快捷入口</text>
            </view>
			<view class="actions-grid">
                <view class="action-card" @click="goDiscover">
                    <view class="icon"><uni-icons type="search" size="28"></uni-icons></view>
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
			<view class="section-title-row">
				<uni-icons type="chat" size="20"></uni-icons>
				<text class="section-title">动态圈子</text>
			</view>
			<view v-if="initialLoading" class="placeholder-card">
				<text class="placeholder-text">加载中...</text>
			</view>
			<view v-else>
				<view v-if="feed.length === 0" class="placeholder-card">
					<text class="placeholder-text">暂时还没有动态，去发布一条吧～</text>
				</view>
				<view v-else class="feed-list">
                    <view class="moment-card" v-for="(item, idx) in feed" :key="item._id" @click="goMomentDetail(item._id)">
                        <image v-if="item.images && item.images.length" class="cover" :src="item.images[0]" mode="widthFix" />
                        <view class="moment-content">
                            <text class="content-text ellipsis-2">{{ displayContent(item) }}</text>
                        </view>
                        <view class="row-bottom">
                            <view class="user">
                                <image class="avatar" :src="item.userId?.avatarUrl || defaultAvatar" mode="aspectFill" />
                                <text class="nickname ellipsis">{{ displayName(item) }}</text>
                            </view>
                            <view class="like" @click.stop="toggleLike(item, idx)">
                                <uni-icons :type="item._likedByMe ? 'heart-filled' : 'heart'" :color="item._likedByMe ? '#FF6B6B' : '#868E96'" size="20" />
                                <text class="count">{{ item.likeCount || 0 }}</text>
                            </view>
                        </view>
                    </view>
                
            </view>
        </view>
    </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onLoad } from '@dcloudio/uni-app'
import { getMomentsFeed, likeMoment } from '../../api/moment.js'
import { previewImage } from '../../utils/helpers.js'
import { formatTime, truncate } from '../../utils/formatters.js'

const feed = ref([])
const page = ref(1)
const limit = ref(10)
const initialLoading = ref(true)
const listLoading = ref(false)
const noMore = ref(false)
const defaultAvatar = '/static/logo.png'

async function loadFeed(reset = false) {
  if (listLoading.value) return
  listLoading.value = true
  try {
    const data = await getMomentsFeed({ page: page.value, limit: limit.value })
    const normalized = (Array.isArray(data) ? data : [])
      .map(m => ({ ...m, _likedByMe: !!m.likedByMe }))
    if (reset) {
      feed.value = normalized
    } else {
      feed.value = feed.value.concat(normalized)
    }
    if (normalized.length < limit.value) {
      noMore.value = true
    } else {
      page.value += 1
    }
  } catch (e) {
  } finally {
    listLoading.value = false
    initialLoading.value = false
  }
}

function preview(images, currentIdx) {
  previewImage(images, currentIdx)
}

async function toggleLike(item, idx) {
  try {
    const res = await likeMoment(item._id)
    const liked = !!res?.liked
    item._likedByMe = liked
    item.likeCount = Math.max(0, (item.likeCount || 0) + (liked ? 1 : -1))
    feed.value.splice(idx, 1, { ...item })
  } catch (e) {
  }
}

function goDiscover() { uni.switchTab({ url: '/pages/discover/index' }) }
function goCart() { uni.switchTab({ url: '/pages/cart/index' }) }
function goPublishMoment() { uni.navigateTo({ url: '/pages/moment/publish' }) }
function goDigitize() { uni.navigateTo({ url: '/pages/menu/digitize' }) }
function goMomentDetail(id) { uni.navigateTo({ url: `/pages/moment/detail?id=${id}` }) }

onLoad(() => {
  page.value = 1
  noMore.value = false
  loadFeed(true)
})

onPullDownRefresh(async () => {
  page.value = 1
  noMore.value = false
  await loadFeed(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!noMore.value) {
    loadFeed()
  }
})

function coverOf(item) {
  const imgs = Array.isArray(item?.images) ? item.images : []
  return imgs.length > 0 ? imgs[0] : ''
}

function displayContent(item) {
  const text = (item?.content || '').trim()
  const hasCover = !!coverOf(item)
  const maxLen = hasCover ? 60 : 90
  return truncate(text, maxLen)
}

function displayName(item) {
  const name = (item?.userId?.nickName || '匿名用户').trim()
  return truncate(name, 10)
}
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
.section-title-row { display: flex; align-items: center; gap: 8rpx; }
.actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.action-card { background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); display: flex; align-items: center; gap: 12rpx; }
.icon { width: 56rpx; height: 56rpx; border-radius: 12rpx; background: #FFF5F5; color: #FF6B6B; display: flex; align-items: center; justify-content: center; }
.label { font-size: 28rpx; color: #212529; font-weight: 600; }
.placeholder-card { background: #FFFFFF; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; }
.placeholder-text { font-size: 26rpx; color: #868E96; }

/* 动态列表 */
.feed-list { column-count: 2; column-gap: 12rpx; }
.moment-card { break-inside: avoid; margin-bottom: 12rpx; background: #FFFFFF; border-radius: 16rpx; padding: 16rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 12rpx; overflow: hidden; }
.cover { width: 100%; background: #F1F3F5; border-radius: 12rpx; }
.moment-header { display: flex; align-items: center; gap: 12rpx; }
.avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: #F1F3F5; }
.header-info { display: flex; flex-direction: column; }
.nickname { font-size: 28rpx; font-weight: 600; color: #212529; }
.time { font-size: 24rpx; color: #ADB5BD; }
.moment-content { display: flex; flex-direction: column; gap: 12rpx; }
.content-text { font-size: 28rpx; color: #343A40; line-height: 1.6; }
.ellipsis-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.row-bottom { display: flex; align-items: center; justify-content: space-between; }
.user { display: flex; align-items: center; gap: 8rpx; }
.like { display: flex; align-items: center; gap: 6rpx; color: #495057; }
.count { font-size: 24rpx; color: #495057; }
</style>
