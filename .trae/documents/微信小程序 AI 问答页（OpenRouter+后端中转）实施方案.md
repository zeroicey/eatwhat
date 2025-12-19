## 背景与约束
- 微信小程序环境不支持直接使用 `@openrouter/sdk` 与 Node 原生流；需后端中转。
- 小程序不支持 SSE；流式最稳妥的传输方案是 WebSocket（`uni.connectSocket`）。
- OpenRouter SDK 支持类型安全、流式迭代（`stream: true`）；应在后端使用并通过 WebSocket转发增量。

## 总体方案
- 后端 `apps/api` 新增 WebSocket 服务：接收前端发来的消息，调用 OpenRouter 流式接口，将增量 token 通过 WS 推送回前端。
- 前端 `apps/wechat` 新建 AI 聊天页面与 Pinia Store：维护会话、消息列表与流式渲染；通过 `uni.connectSocket` 与后端交互。
- 安全：OpenRouter API Key 仅保存在后端 `.env`；前端绝不直连 OpenRouter。

## 后端实现（apps/api）
- 依赖：新增 `@openrouter/sdk` 与 `ws`。
- 配置：新增 `OPENROUTER_API_KEY`、可选 `HTTP-Referer`、`X-Title` 于 `.env`；新增 `src/config/openrouter.js` 封装客户端初始化。
- WebSocket 服务：在 `src/app.js` 创建 HTTP Server 并挂载 `ws`，路径例如 `/ws/ai`。
- 消息协议：
  - 客户端→服务端：`{"type":"chat", "model":"openai/gpt-4o", "messages":[...], "sessionId":"..."}`
  - 服务端→客户端：
    - 流增量：`{"event":"delta", "content":"..."}`
    - 结束：`{"event":"done"}`
    - 错误：`{"event":"error", "message":"..."}`
- 控制器/服务：
  - 新建 `src/services/aiService.js`：封装 OpenRouter 流式调用，返回异步迭代器。
  - 在 `src/app.js` 的 WS 连接回调中消费迭代器并转发增量。
- HTTP 回退接口（非必需）：`POST /api/tools/ai-chat` 支持非流式一次性返回，便于调试或兼容。
- 错误处理：
  - 超时/中止：WS 接收 `type: abort` 时取消后端请求。
  - 统一 `errorHandler`：捕获 SDK 异常并转为前端友好消息。

### 后端示例（核心逻辑）
```js
// src/config/openrouter.js
import OpenRouter from '@openrouter/sdk';
export const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.HTTP_REFERER || '',
    'X-Title': process.env.X_TITLE || ''
  }
});

// src/services/aiService.js
import { openRouter } from '../config/openrouter.js';
export async function streamChat({ model, messages }) {
  return openRouter.chat.send({ model, messages, stream: true });
}

// src/app.js（片段）
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { streamChat } from './services/aiService.js';
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/ai' });
wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    const payload = JSON.parse(raw);
    if (payload.type !== 'chat') return;
    try {
      const stream = await streamChat({ model: payload.model, messages: payload.messages });
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) ws.send(JSON.stringify({ event: 'delta', content: delta }));
      }
      ws.send(JSON.stringify({ event: 'done' }));
    } catch (e) {
      ws.send(JSON.stringify({ event: 'error', message: e.message || 'AI错误' }));
    }
  });
});
server.listen(process.env.PORT || 3000);
```

## 前端实现（apps/wechat）
- 页面：新增 `pages/ai-chat/index.vue`（消息列表 + 底部输入框 + 发送按钮）。
- 路由注册：在 `pages.json` 的 `pages` 数组新增 `pages/ai-chat/index`。
- Store：新增 `stores/chat.js` 管理消息与 WS 连接。
- 连接流程：
  - 初始化：`uni.connectSocket({ url: 'wss://<域名>/ws/ai' })`；监听 `onOpen/onMessage/onError/onClose`。
  - 发送：构造 `messages`（包含历史）发送 `{type:'chat', model, messages}`。
  - 渲染：收到 `event: 'delta'` 事件时将内容累计到当前助手消息；`done` 后落库并结束加载。
- 本地持久化：使用 `pinia-plugin-persistedstate` 保存会话（与现有 store 风格一致）。

### 前端示例（核心逻辑）
```js
// stores/chat.js
import { defineStore } from 'pinia';
export const useChatStore = defineStore('chat', {
  state: () => ({ messages: [], ws: null, loading: false }),
  actions: {
    connect() {
      if (this.ws) return;
      this.ws = uni.connectSocket({ url: 'wss://<域名>/ws/ai' });
      this.ws.onMessage(({ data }) => {
        const msg = JSON.parse(data);
        if (msg.event === 'delta') this.appendDelta(msg.content);
        if (msg.event === 'done') this.loading = false;
      });
    },
    async send(text) {
      this.loading = true;
      this.messages.push({ role: 'user', content: text });
      const payload = { type: 'chat', model: 'openai/gpt-4o', messages: this.messages };
      this.ws.send({ data: JSON.stringify(payload) });
      this.messages.push({ role: 'assistant', content: '' });
    },
    appendDelta(delta) {
      const last = this.messages[this.messages.length - 1];
      if (last?.role === 'assistant') last.content += delta;
    }
  },
  persist: true
});
```

## 域名与安全
- 小程序后台：在「开发设置 → 服务器域名」中配置 `wss://<域名>` 与 `https://<域名>`。
- 后端：仅从环境变量读取 `OPENROUTER_API_KEY`，禁止在前端暴露。
- 速率限制与风控：可在 WS 层按 `sessionId` 与 `userId` 限流。

## 备选方案与取舍
- 纯 HTTP 非流式：`POST /api/tools/ai-chat` 返回完整文本；实现最快，但无法流式体验。
- SSE：微信小程序不支持，弃用。
- Socket.io：开发体验好，但引入额外依赖；`ws` 更轻量，足够满足需求。

## 交付物清单
- `apps/api/package.json`：新增依赖 `@openrouter/sdk`、`ws`。
- `apps/api/src/config/openrouter.js`、`apps/api/src/services/aiService.js`、修改 `src/app.js` 挂载 WS。
- `apps/api/.env`：新增 `OPENROUTER_API_KEY`，可选 `HTTP_REFERER`、`X_TITLE`。
- `apps/wechat/pages/ai-chat/index.vue`、`apps/wechat/stores/chat.js`、修改 `pages.json` 注册页面。

## 验证步骤
- 后端本地启动：确认 WS 路径 `/ws/ai` 可连接；日志输出流增量。
- 前端页面：输入后实时逐字输出，结束后可滚动查看历史；刷新后会话可恢复。
- 异常场景：断网/超时/WS断开均有提示与重连逻辑。

## 下一步
- 如确认此方案，我将按以上文件结构与代码框架落地，并在本地验证流式效果。