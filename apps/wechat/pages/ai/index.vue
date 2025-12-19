<template>
  <view class="main">
    <scroll-view direction="vertical" class="chat-container" id="chat-container" scroll-y="true"
      :scroll-into-view="scrollIntoView" :scroll-with-animation="true">
      <view class="chat-wrapper">
        <!-- welcome -->
        <view v-if="chatStore.getShowWelcome" class="welcome">
          <view class="welcome-text">
            👋&nbsp;你好，我是吃什么的AI食物科学家助手。我可以为你分析今天吃什么、推荐搭配与不建议的食物，并制定更专业的饮食习惯。直接告诉我你的口味、预算或健康目标，开始吧！
          </view>
        </view>
        <YmBubble v-for="(msg, index) in chatStore.getMessages" :key="index" :is-markdown="msg.isMarkdown"
          :message="msg.content" :position="msg.position" :resources="msg.resources" :files="msg.files"
          :is-error="msg.isError" :loading="msg.loading">
          <template #footer>
            <view class="footer-content" v-if="msg.position === 'left'">
              <view class="footer-content-item" @click="handleCopy(msg.content)">
                <text class="ym-icon i-Copy-1"></text>
                <text>复制原文</text>
              </view>
            </view>
          </template>
        </YmBubble>
        <view style="height: 35px;" id="last-msg"></view>
      </view>
    </scroll-view>

    <!-- 消息发送组件 -->
    <view class="sender-container">
      <YmSender :show-online="true" :placeholder="chatFlowConfig.placeholder" @send="handleSend"
        :loading="chatStore.getIsSending">
        <template #header>
          <view class="header-content" style="padding:20rpx 20rpx 0;">
            <YmAttachments :items="chatStore.getAttachmentFiles" @update:items="onItemsUpdate" />
          </view>
        </template>
      </YmSender>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useChatStore } from "@/stores/chat";
import YmBubble from "@/uni_modules/ym-chat-ai/components/YmBubble/index.vue";
import YmSender from "@/uni_modules/ym-chat-ai/components/YmSender/index.vue";
import YmAttachments from "@/uni_modules/ym-chat-ai/components/YmAttachments/index.vue";
import { sendChat } from "@/api/ai";


const chatFlowConfig = {
  placeholder: '请输入消息...'
}

const scrollIntoView = ref<string>('')

const chatStore = useChatStore();


// 处理复制原文
const handleCopy = (content: string) => {
  uni.setClipboardData({
    data: content,
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'success' });
    }
  })
}

// 滚动到聊天底部
const scrollToBottom = async () => {
  scrollIntoView.value = ""
  await nextTick();
  scrollIntoView.value = "last-msg"
};


// 生成AI回复
const generateAiResponse = () => {
  return `<think>用户提出了一个关于的问题，我查看了所有知识库均未查询到用户所提问题的相关信息，提示词中提到查询不到用户相关问题时，请根据用户所提问题给出回答。</think>### 你好！👋

我是AI助手，很高兴为您服务。有什么我可以帮助您的吗？

#### 我可以帮您：
- 📝 **写作和编辑**
- 💡 **创意和灵感** 
- 🔍 **信息查询**
- 📊 **数据分析**

> 💡 **提示**: 请直接发送消息开始对话！`;
};

// 处理消息发送
const handleSend = async (event: any) => {
  const message = event.message?.trim();
  if (!message) {
    uni.showToast({ title: '请输入消息内容', icon: 'none' });
    return;
  }

  scrollToBottom();

  // 处理文件上传（模拟）
  if (chatStore.getAttachmentFiles.length > 0) {
    await handleFileUpload();
  }

  // 添加用户消息
  chatStore.addUserMessage(message, chatStore.getAttachmentFiles);
  chatStore.addAiMessage();

  // 调用真实接口
  await realAiResponse(message);
  chatStore.clearAttachments();
}

// 实际AI回复（打字机效果展示返回内容）
const realAiResponse = async (userMessage: string) => {
  try {
    chatStore.setSending(true);
    const data = await sendChat({
      messages: [
        { role: 'system', content: '你是顶级食物科学家与营养顾问。你的任务是根据用户的场景、口味偏好、预算与健康目标，分析他们可以吃什么、建议吃什么、不建议吃什么，并给出科学依据与可执行建议。回答要求：用中文；先给结论，后给理由；分点清晰；兼顾性价比与可获得性；如用户提供食材/菜单，给出合理搭配与替代方案；提醒潜在过敏、慢性病与饮食禁忌；可给一天/一周饮食习惯规划与注意事项。' },
        { role: 'user', content: userMessage }
      ],
      model: 'openai/gpt-4o'
    });
    const response: string = (data?.content ?? '').toString();
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < response.length) {
        chatStore.updateLastMessage(response[index]);
        index++;
        scrollToBottom();
      } else {
        clearInterval(typeInterval);
        chatStore.setSending(false);
        chatStore.setLastAiMessageLoading(false);
      }
    }, 30);
  } catch (e: any) {
    chatStore.setLastMessageError(e?.message || 'AI接口调用失败');
    chatStore.setSending(false);
    chatStore.setLastAiMessageLoading(false);
  }
}

// 模拟文件上传
const handleFileUpload = async () => {
  const files = chatStore.getAttachmentFiles;
  if (files.length === 0) return [];

  uni.showLoading({ title: '正在上传文件...' });

  // 模拟上传延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  uni.hideLoading();
  uni.showToast({ title: `成功上传${files.length}个文件`, icon: 'success' });

  return files;
}

// 文件处理函数
const onItemsUpdate = (items: any[]) => {
  chatStore.setAttachmentFiles(items);
};

</script>

<style lang="less">
// 简化CSS变量
page {
  --primary-color: #007bff;
  --bg-primary: #ffffff;
  --bg-gradient: linear-gradient(135deg, #e2fcfd 0%, #ced6fc 100%);
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --radius-large: 12rpx;
  --font-base: 28rpx;
  --space-sm: 10rpx;
  --space-md: 20rpx;
  --space-lg: 32rpx;
  --shadow-sm: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  --transition-base: 0.3s ease;
  background: var(--bg-gradient) !important;
}


.main {
  display: flex;
  height: 100vh;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
}

.welcome {
  padding: var(--space-lg);
  line-height: 1.6;
  background: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-sm);
}

.chat-container {
  flex: 1;
  overflow-x: hidden;

  .chat-wrapper {
    padding: var(--space-md);
    width: 100%;
    box-sizing: border-box;
  }
}

.sender-container {
  padding: var(--space-md);
}

.footer-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-sm);

  .footer-content-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    font-size: var(--font-base);
    padding: 10rpx var(--space-md);
    color: var(--text-secondary);
    border-radius: var(--radius-large);
    background-color: var(--bg-primary);
    transition: var(--transition-base);
  }
}
</style>
