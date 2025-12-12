🎓 项目开发规格说明书 (PRD)

    项目名称：吃什么 (EatWhat)

    平台：微信小程序

    核心理念：大学生众包美食地图 + 跨店拼单带饭神器

    开发模式：前后端分离

1. 技术栈架构 (Tech Stack)
前端 (Client)

    框架：UniApp (Vue3 + Setup Syntax + Composition API)

    语言：JavaScript

    样式：SCSS (Sass)

    UI库：uni-icons (轻量级), 自定义组件

    状态管理：Pinia (持久化存储购物车、用户信息)

    数据请求：Vue-Query (TanStack Query) - 用于处理服务端数据的缓存、自动刷新

    核心API：Canvas 2D (生成分享图), uni.uploadFile (图片上传)

后端 (Server)

    运行环境：Node.js

    框架：Express.js

    数据库：MongoDB (Mongoose ODM)

    对象存储：Minio (自建OSS，存储店铺图、菜单图)

    鉴权：JWT (Json Web Token) + 微信登录 (wx.login code2Session)

2. 核心功能模块 (Feature Modules)
2.1 🏛️ 店铺模块 (Store & Discovery)

    店铺列表：瀑布流展示，按“最近更新”或“距离”排序。

    创建店铺 (UGC)：用户上传店铺名、简介、门头照片、墙面菜单照片。

    店铺详情：展示店铺信息、原始菜单图、电子化菜单列表。

2.2 📝 菜单众包模块 (Menu Crowdsourcing)

    菜单数字化：用户在店铺详情页，参照“原始菜单图”，手动录入菜品（名称、价格）。

    点赞/报错：用户可以对某个菜品点赞（确认价格正确/好吃），防止乱录入。

2.3 🛒 跨店清单模块 (Cross-Store Cart)

    多店选择：购物车不限制单店，支持同时添加 A店的猪脚饭 + B店的奶茶。

    本地存储：使用 Pinia 存储选中状态，杀掉进程重进依然保留。

    清单管理：增加/减少数量、删除条目、备注（如：不要香菜）。

2.4 🖼️ 社交分享模块 (Share & Generate)

    带饭卡片生成：将当前清单渲染为长图（Canvas）。

    内容包含：店铺名、菜品明细、各分项价格、总价、备注、小程序二维码。

    保存分享：保存到相册，用于发微信群或朋友圈。

2.5 🌟 动态圈子模块 (Moments)

    好吃时刻：用户发布带图动态，关联具体店铺。

    动态流：首页或发现页展示大家的推荐动态。