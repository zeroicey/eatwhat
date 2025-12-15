<template>
  <view class="profile-page">
    <view class="header" v-if="isLoggedIn">
      <image class="avatar" :src="userAvatar" mode="aspectFill" />
      <view class="info">
        <text class="nickname">{{ userNickname || '未设置昵称' }}</text>
        <text class="meta">最近登录：{{ lastLoginTime }}</text>
      </view>
    </view>

    <view class="header" v-else>
      <image class="avatar placeholder" src="/static/logo.png" mode="aspectFill" />
      <view class="info">
        <text class="nickname">未登录</text>
        <text class="meta">请先登录以使用个人功能</text>
      </view>
    </view>

    <view class="quick-actions" v-if="isLoggedIn">
      <view class="action-btn" @click="goContributions">
        <uni-icons type="flag" size="22" color="#3b82f6"></uni-icons>
        <text>我的贡献</text>
      </view>
      <view class="action-btn" @click="goSettings">
        <uni-icons type="gear" size="22" color="#8b5cf6"></uni-icons>
        <text>账号设置</text>
      </view>
      <view class="action-btn" @click="goPublishMoment">
        <uni-icons type="paperplane" size="22" color="#f59e0b"></uni-icons>
        <text>发布动态</text>
      </view>
    </view>

    <view class="stats-grid" v-if="isLoggedIn">
      <view class="stat-card">
        <view class="stat-icon"><uni-icons type="shop" size="26"></uni-icons></view>
        <text class="stat-value">{{ storeCount }}</text>
        <text class="stat-label">创建的店铺</text>
      </view>
      <view class="stat-card">
        <view class="stat-icon"><uni-icons type="list" size="26"></uni-icons></view>
        <text class="stat-value">{{ menuCount }}</text>
        <text class="stat-label">录入的菜品</text>
      </view>
    </view>

    <view class="actions" v-if="!isLoggedIn">
      <button class="btn primary" @click="goLogin">微信登录</button>
    </view>

    <view v-if="isLoggedIn" class="section">
      <view class="section-title-row">
        <image class="section-icon" src="/static/icons/list.svg" mode="aspectFit" />
        <text class="section-title">我的动态</text>
        <text class="section-desc">个人发布的时刻</text>
      </view>

      <view v-if="feed.length === 0 && !loadingFeed" class="empty-state">
        <uni-icons type="chat" size="40" color="#94a3b8"></uni-icons>
        <text class="empty-title">暂无动态</text>
        <text class="empty-desc">去分享你的美食时刻吧</text>
      </view>

      <view v-else class="moment-list">
        <view class="moment-card" v-for="(item, idx) in feed" :key="item._id" @click="goMomentDetail(item._id)">
          <view class="card-header">
            <image class="avatar small" :src="item.userId?.avatarUrl || userAvatar" mode="aspectFill" />
            <view class="user-info">
              <text class="nickname small">{{ item.userId?.nickName || userNickname || '匿名用户' }}</text>
              <text class="time">{{ formattedTime(item.createdAt) }}</text>
            </view>
            <view class="like-action" @click.stop="toggleLike(item, idx)">
              <uni-icons :type="item._likedByMe ? 'heart-filled' : 'heart'" :color="item._likedByMe ? '#FF6B6B' : '#64748b'" size="22" />
              <text class="like-count">{{ item.likeCount || 0 }}</text>
            </view>
          </view>
          <view class="card-content">
            <text class="content-text">{{ item.content }}</text>
          </view>
          <view v-if="item.images && item.images.length" class="image-grid">
            <image v-for="(img, i) in item.images" :key="i" :src="img" class="grid-image" mode="aspectFill" @click.stop="preview(item.images, i)" />
          </view>
          <view v-if="item.storeId && item.storeId.name" class="store-info" @click.stop="goStoreDetail(item.storeId._id)">
            <uni-icons type="shop" size="16" color="#64748b"></uni-icons>
            <text class="store-name">{{ item.storeId.name }}</text>
            <uni-icons type="right" size="14" color="#94a3b8"></uni-icons>
          </view>
        </view>

        <view v-if="loadingFeed" class="loading-more">
          <text>加载中...</text>
        </view>
        <view v-else-if="noMoreFeed" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { getMe, getMyStores, getMyMenuItems, getMyMoments } from '@/api/user'
import { likeMoment } from '@/api/moment'
import { formatTime } from '@/utils/formatters'
import { previewImage } from '@/utils/helpers'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userNickname = computed(() => userStore.nickname)
const userAvatar = computed(() => userStore.avatar || '/static/logo.png')
const storeCount = ref(0)
const menuCount = ref(0)
const feed = ref([])
const page = ref(1)
const limit = ref(10)
const loadingFeed = ref(false)
const noMoreFeed = ref(false)
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

  Promise.all([
    getMyStores({ page: 1, limit: 1 }),
    getMyMenuItems({ page: 1, limit: 1 })
  ]).then(([stores, menus]) => {
    storeCount.value = Array.isArray(stores) ? stores.length : (stores?.total || 0)
    menuCount.value = Array.isArray(menus) ? menus.length : (menus?.total || 0)
  }).catch(() => {})

  resetFeed()
  loadMyMoments(true)
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

function goPublishMoment() {
  uni.navigateTo({ url: '/pages/moment/publish' })
}

function formattedTime(t) {
  return formatTime(t)
}

function resetFeed() {
  feed.value = []
  page.value = 1
  noMoreFeed.value = false
}

async function loadMyMoments(reset = false) {
  if (noMoreFeed.value && !reset) return
  loadingFeed.value = true
  try {
    const data = await getMyMoments({ page: page.value, limit: limit.value })
    const list = Array.isArray(data) ? data : []
    const mapped = list.map(m => ({ ...m, _likedByMe: !!m.likedByMe }))
    if (reset) {
      feed.value = mapped
    } else {
      feed.value = feed.value.concat(mapped)
    }
    if (mapped.length < limit.value) {
      noMoreFeed.value = true
    } else {
      page.value += 1
    }
  } catch (e) {
    console.error('Failed to load my moments:', e)
  } finally {
    loadingFeed.value = false
  }
}

async function toggleLike(item, idx) {
  try {
    const res = await likeMoment(item._id)
    const liked = !!res?.liked
    feed.value[idx]._likedByMe = liked
    feed.value[idx].likeCount = Math.max(0, (feed.value[idx].likeCount || 0) + (liked ? 1 : -1))
  } catch (e) {
    console.error('Failed to toggle like:', e)
  }
}

function preview(images, current) {
  previewImage(images, current)
}

function goStoreDetail(id) {
  uni.navigateTo({ url: `/pages/store/detail?id=${id}` })
}

function goMomentDetail(id) {
  uni.navigateTo({ url: `/pages/moment/detail?id=${id}` })
}

onReachBottom(() => {
  loadMyMoments()
})

</script>

<style lang="scss" scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  gap: 24rpx;
  background: #f8fafc;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #eef2ff;
}
.avatar.small {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
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
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}
.nickname.small {
  font-size: 28rpx;
}
.meta {
  font-size: 26rpx;
  color: #64748b;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 72rpx;
  border-radius: 12rpx;
  background: #ffffff;
  color: #334155;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 12rpx rgba(0,0,0,0.06);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}
.stat-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: flex-start;
}
.stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: #f1f5f9;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}
.stat-label {
  font-size: 24rpx;
  color: #64748b;
}

.actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16rpx;
}
.btn.primary {
  height: 80rpx;
  border-radius: 12rpx;
  background: #3b82f6;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.section-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.section-icon {
  width: 36rpx;
  height: 36rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1e293b;
}
.section-desc {
  margin-left: auto;
  font-size: 24rpx;
  color: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 40rpx 0;
  color: #64748b;
}
.empty-title {
  font-size: 28rpx;
  font-weight: 600;
}
.empty-desc {
  font-size: 24rpx;
}

.moment-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.moment-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}
.time {
  font-size: 24rpx;
  color: #94a3b8;
}
.like-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.like-count {
  font-size: 24rpx;
  color: #64748b;
}
.card-content {
  display: flex;
  flex-direction: column;
}
.content-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #334155;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
}
.grid-image {
  width: 100%;
  height: 180rpx;
  border-radius: 8rpx;
}
.store-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.store-name {
  font-size: 26rpx;
  color: #475569;
}
.loading-more,
.no-more {
  text-align: center;
  color: #94a3b8;
  padding: 16rpx 0;
}
</style>
