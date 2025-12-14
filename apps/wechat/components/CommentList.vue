<template>
  <view class="comment-list-wrapper">
    <view class="section-title">评论</view>
    <view v-if="comments.length === 0" class="empty-comments">
      <text>还没有评论，快来抢沙发吧！</text>
    </view>
    <view v-else>
      <view v-for="comment in comments" :key="comment._id" class="comment-item">
        <image class="avatar" :src="comment.userId?.avatarUrl || '/static/logo.png'" mode="aspectFill" />
        <view class="comment-main">
          <view class="nickname">{{ comment.userId?.nickName || '匿名用户' }}</view>
          <text class="content">{{ comment.content }}</text>
          <view class="footer">
            <text class="time">{{ formattedTime(comment.createdAt) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'
import { formatTime } from '../utils/formatters.js'

defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
})

function formattedTime(time) {
  return formatTime(time)
}
</script>

<style lang="scss" scoped>
.comment-list-wrapper {
  margin-top: 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.empty-comments {
  text-align: center;
  color: #868e96;
  padding: 32rpx 0;
}

.comment-item {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F1F3F5;

  &:last-child {
    border-bottom: none;
  }
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
}

.comment-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.nickname {
  font-size: 28rpx;
  font-weight: 600;
  color: #212529;
}

.content {
  font-size: 28rpx;
  color: #343A40;
  line-height: 1.5;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.time {
  font-size: 24rpx;
  color: #868E96;
}
</style>
