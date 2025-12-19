import App from './App'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'


// 导入公共样式
import './styles/common.scss'
import './styles/theme.scss'

export function createApp() {
  const app = createSSRApp(App)

  // 配置 Pinia
  const pinia = createPinia()
  app.use(pinia)



  return {
    app,
    pinia
  }
}
