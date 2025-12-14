<template>
  <view class="moment-detail-page">
    <!-- Loading State -->
    <view v-if="loading" class="loading-placeholder">
      <text>加载中...</text>
    </view>

    <!-- Error State -->
    <view v-else-if="!moment && !loading" class="error-placeholder">
      <text>动态不存在或已被删除</text>
    </view>

    <!-- Content -->
    <template v-else>
      <!-- Moment Card -->
      <view class="moment-card">
        <view class="header">
          <image class="avatar" :src="moment.userId?.avatarUrl || '/static/logo.png'" mode="aspectFill" />
          <view class="user-info">
            <text class="nickname">{{ moment.userId?.nickName || '匿名用户' }}</text>
            <text class="time">{{ formattedTime(moment.createdAt) }}</text>
          </view>
          <view class="like-action" @click="toggleLike">
            <uni-icons :type="moment._likedByMe ? 'heart-filled' : 'heart'" :color="moment._likedByMe ? '#FF6B6B' : '#495057'" size="24" />
            <text class="like-count">{{ moment.likeCount || 0 }}</text>
          </view>
        </view>

        <view class="content">
          <text class="content-text">{{ moment.content }}</text>
        </view>

        <view v-if="moment.images && moment.images.length" class="image-grid">
          <image v-for="(img, idx) in moment.images" :key="idx" :src="img" class="grid-image" mode="aspectFill" @click="preview(moment.images, idx)" />
        </view>

        <view v-if="moment.storeId && moment.storeId.name" class="store-info" @click="goStoreDetail(moment.storeId._id)">
          <uni-icons type="shop" size="16" color="#495057"></uni-icons>
          <text class="store-name">{{ moment.storeId.name }}</text>
          <uni-icons type="right" size="14" color="#ADB5BD"></uni-icons>
        </view>
      </view>

      <!-- Comment List -->
      <CommentList :comments="comments" class="comment-section" />
    </template>

    <!-- Fixed Comment Input Bar -->
    <view class="comment-input-bar">
      <input class="input-field" v-model="newCommentContent" placeholder="留下你的精彩评论..." />
      <button class="submit-btn" @click="submitComment" :disabled="!newCommentContent.trim()">发布</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getMomentDetail, likeMoment, getMomentComments, commentMoment } from '../../api/moment.js'
import CommentList from '../../components/CommentList.vue'
import { formatTime } from '../../utils/formatters.js'
import { previewImage } from '../../utils/helpers.js'

const moment = ref(null)
const loading = ref(true)
const momentId = ref('')
const comments = ref([])
const commentPage = ref(1)
const commentLimit = ref(10)
const noMoreComments = ref(false)
const newCommentContent = ref('')

onLoad(async (options) => {
  if (options.id) {
    momentId.value = options.id
    await fetchMomentDetails()
    await fetchComments(true)
  }
})

async function fetchMomentDetails() {
  loading.value = true
  try {
    const data = await getMomentDetail(momentId.value)
    moment.value = { ...data, _likedByMe: !!data.likedByMe }
  } catch (e) {
    console.error('Failed to fetch moment details:', e)
  } finally {
    loading.value = false
  }
}

async function fetchComments(reset = false) {
  if (noMoreComments.value && !reset) return
  try {
    const data = await getMomentComments(momentId.value, { page: commentPage.value, limit: commentLimit.value })
    const newComments = data || []
    if (reset) {
      comments.value = newComments
    } else {
      comments.value = comments.value.concat(newComments)
    }
    if (newComments.length < commentLimit.value) {
      noMoreComments.value = true
    } else {
      commentPage.value += 1
    }
  } catch (e) {
    console.error('Failed to fetch comments:', e)
  }
}

async function submitComment() {
  if (!newCommentContent.value.trim()) return
  try {
    await commentMoment(momentId.value, newCommentContent.value)
    newCommentContent.value = ''
    // Refresh comments
    commentPage.value = 1
    noMoreComments.value = false
    await fetchComments(true)
  } catch (e) {
    console.error('Failed to submit comment:', e)
    uni.showToast({ title: '评论失败', icon: 'none' })
  }
}

async function toggleLike() {
  if (!moment.value) return
  try {
    const res = await likeMoment(moment.value._id)
    const liked = !!res?.liked
    moment.value._likedByMe = liked
    moment.value.likeCount = Math.max(0, (moment.value.likeCount || 0) + (liked ? 1 : -1))
  } catch (e) {
    console.error('Failed to toggle like:', e)
  }
}

function formattedTime(time) {
  return formatTime(time)
}

function preview(images, current) {
  previewImage(images, current)
}

function goStoreDetail(id) {
  uni.navigateTo({ url: `/pages/store/detail?id=${id}` })
}

onReachBottom(() => {
  fetchComments()
})
</script>

<style lang="scss" scoped>
.moment-detail-page {
  padding: 24rpx;
  background-color: #F8F9FA;
  min-height: 100vh;
  padding-bottom: 120rpx; // Add padding to avoid overlap
}

.moment-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}

.nickname {
  font-size: 30rpx;
  font-weight: 600;
  color: #212529;
}

.time {
  font-size: 24rpx;
  color: #868E96;
}

.content-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #343A40;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
}

.grid-image {
  width: 100%;
  height: 220rpx;
  border-radius: 12rpx;
}

.store-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: #F1F3F5;
  padding: 16rpx;
  border-radius: 12rpx;
}

.store-name {
  flex: 1;
  font-size: 26rpx;
  color: #495057;
  font-weight: 500;
}



.like-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.like-count {
  font-size: 26rpx;
  color: #495057;
  font-weight: 500;
}

.comment-section {
  margin-top: 24rpx;
}

.loading-placeholder,
.error-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  color: #868e96;
}

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background-color: #FFFFFF;
  border-top: 1rpx solid #E9ECEF;
}

.input-field {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #F8F9FA;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.submit-btn {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 32rpx;
  background-color: #FF6B6B;
  color: #FFFFFF;
  border-radius: 36rpx;
  font-size: 28rpx;

  &[disabled] {
    background-color: #FAB0B0;
    color: #FFFFFF;
  }
}
</style>
