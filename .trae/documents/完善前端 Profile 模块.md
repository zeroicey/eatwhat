## 目标
- 完成「个人中心」三页：`Profile`（信息展示与登录/退出）、`Contributions`（我的贡献列表）、`Settings`（资料与头像管理）。
- 对齐现有后端能力，先实现前端功能与登录流程；缺失的用户资料查询/更新端点留作后续增补。

## 页面与交互
### Profile（pages/profile/index.vue）
- 顶部展示：头像、昵称、最近登录时间；未登录时显示登录引导与按钮。
- 功能入口：`My Contributions`、`Settings`、`Logout`。
- 生命周期：`onShow` 检查登录状态与 Token 过期；已登录时从 `userStore.userInfo` 读取并展示（当前后端缺少 `/user/me`，暂不调用远端）。
- 登录流程：
  1. 调用 `uni.login({ provider: 'weixin' })` 获取 `code`。
  2. 可选调用 `uni.getUserProfile` 取得 `nickName`、`avatarUrl`。
  3. 请求后端 `POST /api/auth/login`（携带 `code` 与可选 `userInfo`）。
  4. 成功后写入 `userStore.login({ token, userInfo })` 并跳转回 Profile。
- 退出：调用 `userStore.logout()`，清理状态与本地存储。

### Contributions（pages/profile/contributions.vue）
- 列表区分：`我创建的店铺`、`我录入的菜品`。
- 首版数据源：占位与空态展示；点击跳转到店铺/菜品详情（后端未提供按用户过滤端点）。
- 后续对齐：新增端点后改为调用：
  - `GET /api/users/me/contributions/stores`（或 `GET /api/stores?creator=me`）
  - `GET /api/users/me/contributions/menu-items`（或 `GET /api/menus?creator=me`）

### Settings（pages/profile/settings.vue）
- 字段：昵称、头像。
- 头像上传：
  1. 选择图片（`uni.chooseImage`）。
  2. 请求 `POST /api/storage/upload-url`（`bucket=avatars`，`fileType=image/jpeg|png`）。
  3. 使用返回的 `uploadUrl` 执行 `uni.uploadFile`。
  4. 成功后取返回的公共 `accessUrl`，更新本地 `userStore.updateProfile({ avatarUrl: accessUrl })` 并即时刷新展示。
- 昵称更新：本地表单更新 `userStore.updateProfile({ nickName })`；后续后端提供 `/api/user/profile` 再接入远端更新。

## 状态与请求封装
- Pinia：沿用 `stores/user.js`（`login/logout/updateProfile/restoreToken/checkAuth`）。
- 请求封装：在 `api/request.js` 接入拦截器（`interceptors.js`）：
  - 请求前：自动附加 `Authorization: Bearer <token>` 与通用头。
  - 响应后：统一错误处理（含 401 重定向至登录页）。

## 后端对齐与扩展（后续迭代）
- 新增：`GET /api/user/me`（返回当前用户信息）。
- 新增：`PUT /api/user/profile`（更新昵称、头像等）。
- 新增：
  - `GET /api/users/me/contributions/stores` 或在 `/api/stores` 支持 `creator=me`。
  - `GET /api/users/me/contributions/menu-items` 或在 `/api/menus` 支持 `creator=me`。
- 头像上传已具备：继续使用 `POST /api/storage/upload-url` 与 `buckets.avatars` 配置。

## 验证与交付
- 交互验证：
  - 未登录 → 登录 → 回显头像/昵称 → 退出登录流程。
  - 头像上传并立即更新本地展示。
  - Contributions/Settings 导航与空态正确。
- 代码一致性：遵循 UniApp + Vue3 + Setup 语法与现有样式规范；不引入额外库。

请确认以上方案；确认后我将开始具体实现（页面结构、请求封装、登录与头像上传流程、状态管理接入），并在后端端点缺失处以本地状态占位，随后提交后端改动以完全打通。