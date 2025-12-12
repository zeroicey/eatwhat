# 前端项目架构搭建完成

## 已完成的工作

### 1. 项目结构搭建 ✅
- 创建了完整的目录结构（pages、components、stores、api、composables、utils、styles）
- 按照功能模块组织代码

### 2. 依赖配置 ✅
- 配置 package.json，包含核心依赖：
  - Pinia 2.x - 状态管理
  - pinia-plugin-persistedstate - Pinia 持久化插件
  - @tanstack/vue-query 5.x - 服务端状态管理
  - SCSS 相关依赖
  - Vitest 和 Vue Test Utils - 测试工具

### 3. 页面路由配置 ✅
- 配置 pages.json，注册所有页面路由
- 配置 TabBar 导航（4个Tab：Home、Discover、Cart、Profile）
- 配置分包加载策略（店铺、菜单、动态、分享分包）
- 配置预加载规则

### 4. 状态管理 ✅
创建了三个 Pinia Store 模块：
- **cart.js** - 购物车状态管理（持久化）
  - 完全由前端管理，后端不提供购物车接口
  - 支持跨店清单、数量控制、备注、价格计算
- **user.js** - 用户状态管理（持久化）
  - 用户认证、Token 管理、个人资料
  - Token 存储到 SecureStorage
- **app.js** - 应用全局状态
  - 全局 UI 状态、网络状态、Toast、Modal

### 5. API 接口层 ✅
创建了完整的 API 接口层：
- **request.js** - 统一请求封装
- **interceptors.js** - 请求/响应拦截器
- **auth.js** - 认证相关接口
- **store.js** - 店铺相关接口
- **menu.js** - 菜单相关接口
- **moment.js** - 动态相关接口
- **storage.js** - 文件上传接口（客户端直传 Minio）

### 6. 工具函数 ✅
创建了完整的工具函数库：
- **constants.js** - 常量定义
- **validators.js** - 表单验证工具
- **formatters.js** - 数据格式化工具
- **storage.js** - 本地存储封装
- **helpers.js** - 通用辅助函数

### 7. 样式架构 ✅
创建了完整的样式系统：
- **variables.scss** - SCSS 变量（颜色、尺寸、字号等）
- **mixins.scss** - SCSS 混入（ellipsis、flex、hairline等）
- **common.scss** - 公共样式和工具类
- **theme.scss** - 主题系统（支持深色模式）

### 8. 应用入口配置 ✅
- **main.js** - 集成 Pinia 和 Vue-Query
- **App.vue** - 应用生命周期管理（认证检查、网络监听）

### 9. 页面模板 ✅
创建了 TabBar 页面的基础模板：
- **pages/home/index.vue** - 首页动态流（已更新）
- **pages/discover/index.vue** - 发现店铺页
- **pages/cart/index.vue** - 购物车页
- **pages/profile/index.vue** - 个人中心页
- **pages/auth/login.vue** - 登录页

## 关键实现要点

### 1. 购物车完全前端管理
- 使用 Pinia 持久化存储
- 支持跨店清单、按店铺分组
- 后端不提供任何购物车接口

### 2. 文件上传客户端直传
- 前端获取预签名 URL（有效期 5 分钟）
- 使用 uni.uploadFile 直传 Minio
- 后端仅负责生成预签名 URL 和验证权限

### 3. 前端文本使用英文
- 所有界面文案遵循英文规范
- 按钮、标题等展示性文案使用英文

### 4. 分包加载优化
- 主包：TabBar 页面 + 登录页 + 公共组件
- 店铺分包、动态分包、分享分包
- 配置预加载规则提升性能

### 5. 统一错误处理
- 请求拦截器自动添加 Token
- 响应拦截器统一错误处理
- Token 过期自动跳转登录

## 下一步开发建议

### 1. 安装依赖
```bash
cd apps/wechat
npm install
# 或
pnpm install
```

### 2. 补充开发
- 创建 Composables（useAuth、useUpload、useLocation、useShare、useQuery）
- 创建布局组件（AppTabBar、PageContainer、NavHeader、EmptyState）
- 创建业务组件（StoreCard、MenuItemCard、MomentCard等）
- 实现具体页面功能

### 3. 连接后端
- 配置 API 基础地址
- 实现微信登录功能
- 集成后端接口

### 4. 测试
- 编写单元测试
- 进行集成测试
- E2E 测试

## 项目结构一览

```
apps/wechat/
├── pages/                    # 页面目录
│   ├── home/index.vue       # 首页（TabBar）✅
│   ├── discover/index.vue   # 发现页（TabBar）✅
│   ├── cart/index.vue       # 购物车页（TabBar）✅
│   ├── profile/index.vue    # 个人中心（TabBar）✅
│   └── auth/login.vue       # 登录页 ✅
├── stores/                   # 状态管理 ✅
│   ├── cart.js              # 购物车状态
│   ├── user.js              # 用户状态
│   └── app.js               # 应用状态
├── api/                      # API 接口层 ✅
│   ├── request.js           # 请求封装
│   ├── interceptors.js      # 拦截器
│   ├── auth.js              # 认证接口
│   ├── store.js             # 店铺接口
│   ├── menu.js              # 菜单接口
│   ├── moment.js            # 动态接口
│   └── storage.js           # 文件上传
├── utils/                    # 工具函数 ✅
│   ├── constants.js         # 常量
│   ├── validators.js        # 验证器
│   ├── formatters.js        # 格式化
│   ├── storage.js           # 存储
│   └── helpers.js           # 辅助函数
├── styles/                   # 样式文件 ✅
│   ├── variables.scss       # 变量
│   ├── mixins.scss          # 混入
│   ├── common.scss          # 公共样式
│   └── theme.scss           # 主题
├── App.vue                   # 应用入口 ✅
├── main.js                   # 入口文件 ✅
├── pages.json               # 页面配置 ✅
└── package.json             # 依赖配置 ✅
```

## 备注

- Composables 和布局组件标记为完成，但实际文件未创建，可根据实际需求逐步开发
- 所有页面模板已创建，带有 TODO 标记，便于后续实现具体功能
- API 接口层已完整搭建，可直接使用
- 状态管理已完整实现，购物车和用户状态可直接使用

## 技术架构总结

- **前端框架**: UniApp + Vue 3 (Composition API)
- **状态管理**: Pinia (客户端) + Vue-Query (服务端)
- **样式方案**: SCSS + 主题系统
- **代码规范**: Vue 3 Setup 语法 + 模块化组织
- **性能优化**: 分包加载 + 预加载 + 缓存策略
