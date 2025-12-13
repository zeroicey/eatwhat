<template>
	<view class="create-store-page">
		<text class="title"><uni-icons type="home" size="22"></uni-icons> 创建店铺</text>
		<view class="form">
			<input class="input" type="text" v-model="name" placeholder="店铺名称（必填）" />
			<textarea class="textarea" v-model="description" placeholder="店铺简介（选填）" auto-height />
			<view class="location-row">
				<input class="input" type="text" v-model="address" placeholder="地址（选填）" />
				<button class="btn" @click="chooseLocation"><uni-icons type="location" size="22"></uni-icons> 选择位置</button>
			</view>
			<view class="coords">
				<text class="coord">经度：{{ longitude ?? '—' }}</text>
				<text class="coord">纬度：{{ latitude ?? '—' }}</text>
			</view>
			<view class="section">
				<text class="section-title">门头图（封面）</text>
				<view class="cover">
					<image v-if="coverImage" :src="coverImage" class="cover-img" mode="aspectFill" />
					<button class="btn" @click="selectCover"><uni-icons type="image" size="22"></uni-icons> 选择图片</button>
				</view>
			</view>
			<view class="section">
				<text class="section-title">菜单图片（可多张）</text>
				<view class="images">
					<image v-for="(img, idx) in menuImages" :key="idx" :src="img" class="menu-img" mode="aspectFill" />
					<button class="btn" @click="selectMenuImages"><uni-icons type="image" size="22"></uni-icons> 选择图片</button>
				</view>
			</view>
			<button class="btn primary" :disabled="submitting" @click="submitStore"><uni-icons type="checkmarkempty" size="22"></uni-icons> 提交创建</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { createStore } from '@/api/store'
import { getUploadUrl, uploadToMinio } from '@/api/storage'

const appStore = useAppStore()
const name = ref('')
const description = ref('')
const address = ref('')
const longitude = ref(null)
const latitude = ref(null)
const coverImage = ref('')
const menuImages = ref([])
const submitting = ref(false)

onMounted(() => {
	uni.getLocation({
		type: 'wgs84',
		success: (res) => {
			longitude.value = res.longitude
			latitude.value = res.latitude
		}
	})
})

function chooseLocation() {
	uni.chooseLocation({
		success: (res) => {
			address.value = res.address || res.name || ''
			longitude.value = res.longitude
			latitude.value = res.latitude
		},
		fail: (err) => {
			console.error('Choose location failed:', err)
			appStore.showToast({ message: '选择位置失败', type: 'error' })
		}
	})
}

async function selectCover() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const filePath = res.tempFilePaths[0]
			await uploadImageToBucket(filePath, (url) => coverImage.value = url)
		}
	})
}

async function selectMenuImages() {
	uni.chooseImage({
		count: 9,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			for (const filePath of res.tempFilePaths) {
				await uploadImageToBucket(filePath, (url) => menuImages.value = [...menuImages.value, url])
			}
		}
	})
}

async function uploadImageToBucket(filePath, onDone) {
	try {
		appStore.showLoading('Uploading...')
		const ext = (filePath.split('.').pop() || 'jpg').toLowerCase()
		const allowed = ['jpg', 'jpeg', 'png', 'webp']
		if (!allowed.includes(ext)) {
			throw new Error(`Invalid file type: ${ext}`)
		}
		const { uploadUrl, accessUrl } = await getUploadUrl({
			fileType: ext,
			bucket: 'store-images'
		})
		await uploadToMinio(uploadUrl, filePath)
		onDone(accessUrl)
	} catch (err) {
		console.error('Upload image failed:', err)
		appStore.showToast({ message: '图片上传失败', type: 'error' })
	} finally {
		appStore.hideLoading()
	}
}

function validate() {
	if (!name.value || !name.value.trim()) {
		appStore.showToast({ message: '请输入店铺名称', type: 'error' })
		return false
	}
	if (longitude.value == null || latitude.value == null) {
		appStore.showToast({ message: '请提供地理位置', type: 'error' })
		return false
	}
	return true
}

async function submitStore() {
	if (submitting.value) return
	if (!validate()) return
	try {
		submitting.value = true
		appStore.showLoading('提交中...')
		const payload = {
			name: name.value.trim(),
			description: description.value.trim(),
			coverImage: coverImage.value,
			menuImages: menuImages.value,
			location: {
				type: 'Point',
				coordinates: [Number(longitude.value), Number(latitude.value)],
				address: address.value.trim()
			}
		}
		const created = await createStore(payload)
		appStore.hideLoading()
		appStore.showToast({ message: '创建成功', type: 'success' })
		uni.redirectTo({ url: `/pages/store/detail?id=${created?._id || created?.id}` })
	} catch (err) {
		console.error('Create store failed:', err)
		appStore.hideLoading()
		appStore.showToast({ message: '创建失败', type: 'error' })
	} finally {
		submitting.value = false
	}
}
</script>

<style lang="scss" scoped>
.create-store-page {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.input {
  height: 72rpx;
  background: #f3f4f6;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}
.textarea {
  min-height: 120rpx;
  background: #f3f4f6;
  border-radius: 12rpx;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
}
.location-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8rpx;
}
.coords {
  display: flex;
  gap: 16rpx;
  font-size: 26rpx;
  color: #94a3b8;
}
.section {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8rpx;
}
.cover {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.cover-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: #eef2f7;
}
.images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;
  align-items: start;
}
.menu-img {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
  background: #eef2f7;
}
.btn {
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  color: #374151;
  border: 2rpx solid #e5e7eb;
}
.btn.primary {
  background: #6b7280;
  color: #ffffff;
  border-color: transparent;
}
</style>
