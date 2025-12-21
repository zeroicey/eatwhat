# 吃什么 · EatWhat

大学生众包美食地图 + 跨店拼单带饭神器（微信小程序）。本仓库采用前后端分离架构：前端基于 UniApp（Vue3），后端基于 Express + MongoDB，并使用 Minio 进行对象存储。

## 项目简介
- 平台：微信小程序
- 核心理念：用户发现并创建店铺，大家共同“数字化菜单”，支持跨店清单与长图分享，配套社交动态圈子
- 开发模式：前后端分离

## 技术栈
- 前端：UniApp（Vue3 + Composition API + `<script setup>`）、JavaScript、SCSS、Pinia（持久化）、Vue-Query、uni-icons
- 后端：Node.js、Express、MongoDB（Mongoose）、Minio、JWT、微信登录（code2Session）
- 关键 API：Canvas 2D（分享图生成，现由后端生成）、`uni.uploadFile`（直传 Minio）

## 目录结构
```
apps/
├── api/        # 后端服务（Express）
│   ├── src/
│   │   ├── app.js
│   │   ├── config/        # 数据库/JWT/Minio/微信配置
│   │   ├── controllers/   # 业务控制器（店铺/菜单/动态/工具等）
│   │   ├── middlewares/   # 鉴权/错误处理
│   │   ├── models/        # Mongoose 模型
│   │   ├── routes/        # 路由（auth/store/menu/moment/storage/tools/user）
│   │   └── utils/         # 通用工具、订单图片生成
│   ├── .env.example
│   └── package.json
├── wechat/     # 前端小程序（UniApp）
│   ├── pages/            # 页面（TabBar：home/discover/cart/profile 等）
│   ├── api/              # 前端接口封装与拦截器
│   ├── stores/           # Pinia（cart/user/app/chat）
│   ├── components/       # 复用组件
│   ├── styles/           # SCSS 样式体系
│   └── package.json
└── test/       # 订单图片生成测试（用于验证绘图）
```

## 核心功能模块
- 店铺模块：店铺列表瀑布流、创建店铺（UGC）、店铺详情（原始菜单图 + 电子化菜单）
- 菜单众包模块：参照原始菜单图录入菜品（名称、价格）、点赞/报错互动
- 跨店清单模块：跨多店加购、数量与备注、分项与总价计算、生成分享卡片
- 社交分享模块：后端生成分享长图，前端显示与保存到相册
- 动态圈子模块：发布带图动态、关联店铺，首页动态流浏览与互动

## 前端页面规划（摘要）
- TabBar：`/pages/home/index`、`/pages/discover/index`、`/pages/cart/index`、`/pages/profile/index`
- 店铺：`/pages/store/detail`、`/pages/store/create`
- 菜单众包：`/pages/menu/digitize`、`/pages/menu/item-detail`
- 清单：`/pages/cart/index`、`/pages/cart/preview`
- 分享：`/pages/share/generate`、`/pages/share/result`
- 动态：`/pages/moment/publish`、`/pages/moment/detail`
- 认证：`/pages/auth/login`

详细页面与组件规划见：`.qoder/quests/front-end-page-planning.md`

## 后端能力（摘要）
- 鉴权与用户：`authRoutes.js`、`userRoutes.js`（JWT + 微信登录）
- 店铺与菜单：`storeRoutes.js`、`menuRoutes.js`（菜单录入、点赞、报错）
- 动态与互动：`momentRoutes.js`
- 存储：`storageRoutes.js`（获取 Minio 预签名上传 URL，前端直传）
- 工具：`toolsRoutes.js`（订单图片生成）
- 订单图片生成：`utils/orderImage.js` 使用 `node-canvas` 将清单渲染为 PNG/Base64

## 快速开始
### 环境准备
- Node.js ≥ 16（前端） / 建议 ≥ 18（后端）
- MongoDB 实例
- Minio 对象存储（本地或远端）
- 微信开发者工具（前端调试）

### 后端（apps/api）
1. 复制环境：将 `apps/api/.env.example` 复制为 `.env`，配置以下变量：
   - `MONGODB_URI`、`JWT_SECRET`
   - Minio：`MINIO_ENDPOINT`、`MINIO_ACCESS_KEY`、`MINIO_SECRET_KEY`、`MINIO_BUCKET_*`
   - 可选：`OPENROUTER_API_KEY`（AI 问答页功能，后端中转）
2. 安装依赖：
   - 使用 pnpm：`pnpm install`
   - 或使用 npm：`npm install`
3. 启动开发：`pnpm dev` 或 `npm run dev`（默认端口见 `apps/api/src/app.js`）

### 前端（apps/wechat）
1. 安装依赖：`npm install`
2. 本地开发：`npm run dev`（编译到微信小程序，需微信开发者工具导入运行）
3. 配置后端地址：在前端 `api/request.js`/`api/interceptors.js` 中设置服务器域名；在小程序后台配置合法 `https://` 与 `wss://` 服务器域名

## 文档导航
- PRD（需求规格）：`requirements.md`
- 初始需求与愿景：`prompts/init-requirement.md`
- 前端页面规划：`.qoder/quests/front-end-page-planning.md`
- 方案文档（.trae/documents）：
  - 后端生成订单图片并前端接入重构方案：`.trae/documents/后端生成订单图片并前端接入重构方案.md`
  - 实现菜单众包模块（录入/点赞/报错）：`.trae/documents/实现菜单众包模块（录入_点赞_报错）.md`
  - 完善前端 Profile 模块：`.trae/documents/完善前端 Profile 模块.md`
  - 微信小程序 AI 问答页（OpenRouter+后端中转）实施方案：`.trae/documents/微信小程序 AI 问答页（OpenRouter+后端中转）实施方案.md`

## 关键实现参考
- 后端订单图片生成：`apps/api/src/utils/orderImage.js`
- 订单图片接口：`apps/api/src/controllers/toolsController.js`、`apps/api/src/routes/toolsRoutes.js`
- 前端订单预览：`apps/wechat/pages/cart/preview.vue`
- 前端请求封装与拦截器：`apps/wechat/api/request.js`、`apps/wechat/api/interceptors.js`
- 菜单众包前端页面：`apps/wechat/pages/menu/digitize.vue`、`apps/wechat/pages/menu/item-detail.vue`
- AI 问答页：`apps/wechat/pages/ai/index.vue`、`apps/wechat/stores/chat.ts`

## 路线图
- 菜单众包模块端到端打通（录入/点赞/报错）
- 分享卡片生成后端化并完成前端接入与保存
- Profile 模块完善（头像上传、本地资料更新；后续补齐 `/api/user/me` 与 `/api/user/profile`）
- AI 问答页后端中转（WS 流式），前端对话持久化

## 许可
- 后端（`@eatwhat/api`）：ISC
- 其余未明确部分以仓库根许可为准（如未设置则视为保留所有权利）

## 致谢
感谢所有参与众包与贡献菜单的同学，以及开源生态（UniApp/Vue/Express/Minio 等）。

