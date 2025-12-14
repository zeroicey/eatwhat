<template>
	<view class="settings-page">
		<view class="card">
			<text class="card-title">账号设置</text>
			<view class="form-item">
				<text class="label">头像</text>
				<view class="avatar-row">
					<image class="avatar" :src="avatarPreview" mode="aspectFill"></image>
					<button class="btn" @click="chooseAvatar"><uni-icons type="image" size="20"></uni-icons> 更换头像</button>
				</view>
			</view>
			<view class="form-item">
				<text class="label">昵称</text>
				<input class="input" type="text" v-model="nickname" placeholder="请输入昵称（2-16字符）" />
				<text class="hint" :class="{ error: !validNickname }">{{ nicknameHint }}</text>
			</view>
			<view class="actions">
				<button class="btn primary block" :disabled="!canSave" @click="saveProfile">保存</button>
			</view>
			<view class="actions">
				<button class="btn danger block" @click="handleLogout">退出登录</button>
			</view>
		</view>
	</view>
	</template>
	
	<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { getUploadUrl, uploadToMinio } from '@/api/storage'
import { updateProfile as updateProfileApi } from '@/api/user'
	
	const userStore = useUserStore()
	const appStore = useAppStore()
	
const nickname = ref(userStore.nickname || '')
const avatarPreview = computed(() => userStore.avatar || '/static/logo.png')
const validNickname = computed(() => {
  const v = (nickname.value || '').trim()
  return v.length >= 2 && v.length <= 16
})
const nicknameHint = computed(() => validNickname.value ? '昵称将公开显示' : '昵称需为2-16个字符')
const canSave = computed(() => {
  const v = (nickname.value || '').trim()
  const original = userStore.nickname || ''
  return validNickname.value && v !== original
})
	
	async function chooseAvatar() {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const filePath = res.tempFilePaths[0]
				try {
					appStore.showLoading('Uploading avatar...')
					const ext = (filePath.split('.').pop() || 'jpg').toLowerCase()
					const allowed = ['jpg', 'jpeg', 'png', 'webp']
					if (!allowed.includes(ext)) {
						throw new Error(`Invalid file type: ${ext}`)
					}
					const { uploadUrl, accessUrl } = await getUploadUrl({
						fileType: ext,
						bucket: 'avatars'
					})
					await uploadToMinio(uploadUrl, filePath)
					const updated = await updateProfileApi({ avatarUrl: accessUrl })
					userStore.updateProfile({
						id: updated?.id || userStore.userId,
						nickname: updated?.nickName || nickname.value,
						avatar: updated?.avatarUrl || accessUrl
					})
					appStore.hideLoading()
					appStore.showToast({ message: '头像已更新', type: 'success' })
				} catch (error) {
					console.error('Upload avatar failed:', error)
					appStore.hideLoading()
					appStore.showToast({ message: '头像上传失败', type: 'error' })
				}
			},
			fail: (err) => {
				console.error('Choose image failed:', err)
				appStore.showToast({ message: '选择图片失败', type: 'error' })
			}
		})
	}
	
async function saveProfile() {
	try {
		appStore.showLoading('Saving...')
		const updated = await updateProfileApi({ nickName: (nickname.value || '').trim() })
		userStore.updateProfile({
			id: updated?.id || userStore.userId,
			nickname: updated?.nickName || nickname.value,
			avatar: updated?.avatarUrl || userStore.avatar
		})
		appStore.hideLoading()
		appStore.showToast({ message: '资料已保存', type: 'success' })
	} catch (err) {
		console.error('Save profile failed:', err)
		appStore.hideLoading()
		appStore.showToast({ message: '资料保存失败', type: 'error' })
	}
}

function handleLogout() {
	userStore.logout()
	appStore.showToast({ message: '已退出登录', type: 'success' })
}
</script>
	
	<style lang="scss" scoped>
	.settings-page {
		padding: 32rpx;
	}
	.card {
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
	}
	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #212529;
		margin-bottom: 24rpx;
	}
	.form-item {
		margin-bottom: 24rpx;
	}
	.label {
		display: block;
		font-size: 26rpx;
		color: #495057;
		margin-bottom: 12rpx;
	}
	.avatar-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		background: #F1F3F5;
	}
.input {
		height: 80rpx;
		background: #F8F9FA;
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
	}
.hint { font-size: 22rpx; color: #868E96; margin-top: 8rpx; display: block; }
.hint.error { color: #E03131; }
.actions {
		display: flex;
		justify-content: flex-end;
	}
.btn {
		height: 72rpx;
		border-radius: 36rpx;
		font-size: 28rpx;
		padding: 0 28rpx;
		background: #F1F3F5;
		color: #343A40;
	}
.btn.primary {
	background: #FF6B6B;
	color: #FFFFFF;
}
.btn.danger {
	background: #FFF5F5;
	color: #E03131;
	border: 2rpx solid #ffe3e3;
}
	</style>
