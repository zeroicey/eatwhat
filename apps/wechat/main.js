import App from './App'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

// 导入公共样式
import './styles/common.scss'
import './styles/theme.scss'

export function createApp() {
  const app = createSSRApp(App)

  // 配置 Pinia
  const pinia = createPinia()
  app.use(pinia)

  // 配置 Vue Query - 暂时注释，需要先安装依赖
  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5分钟
          cacheTime: 10 * 60 * 1000, // 10分钟
          refetchOnWindowFocus: true,
          retry: 3,
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
        }
      }
    }
  })

  return {
    app,
    pinia
  }
}
