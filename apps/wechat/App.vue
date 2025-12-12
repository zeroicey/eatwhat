<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { getMe } from '@/api/user'

const userStore = useUserStore()
const appStore = useAppStore()

onLaunch(() => {
  console.log('App Launch')
  
  // 获取系统信息
  appStore.getSystemInfo()
  
  // 监听网络状态
  appStore.watchNetworkStatus()
  
  // 恢复用户 Token
  userStore.restoreToken()
  
  // 检查认证状态
  if (!userStore.checkAuth()) {
    // 未登录，跳转到登录页
    // 注意：小程序首次启动可能需要先进入首页再引导登录
    console.log('User not authenticated')
  } else {
    getMe().then((me) => {
      const mapped = {
        id: me.id || me._id || null,
        nickname: me.nickName || me.nickname || '',
        avatar: me.avatarUrl || me.avatar || ''
      }
      userStore.updateProfile(mapped)
    }).catch(() => {})
  }
})

onShow(() => {
  console.log('App Show')
  
  // 检查 Token 是否过期
  if (userStore.isLoggedIn && userStore.isTokenExpired) {
    userStore.logout()
    uni.showToast({
      title: 'Login expired, please login again',
      icon: 'none'
    })
  }
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './styles/common.scss';
@import './styles/theme.scss';

/* 每个页面公共 CSS */
page {
  height: 100%;
}
</style>
