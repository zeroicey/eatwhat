<template>
  <view class="main">
    <scroll-view direction="vertical" class="chat-container" id="chat-container" scroll-y="true"
      :scroll-into-view="scrollIntoView" :scroll-with-animation="true">
      <view class="chat-wrapper">
        <!-- welcome -->
        <view v-if="chatStore.getShowWelcome" class="welcome">
          <view class="welcome-text">
            👋&nbsp;你好，我是AI问答助手，我可以帮助你回答问题。请直接发送消息开始对话！
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

  // 模拟AI回复
  simulateAiResponse();
  chatStore.clearAttachments();
}

// 模拟AI回复
const simulateAiResponse = () => {
  chatStore.setSending(true);
  const response = generateAiResponse();
  let index = 0;

  // 逐字符输出，每100ms输出一个字符
  const typeInterval = setInterval(() => {
    if (index < response.length) {
      chatStore.updateLastMessage(response[index]);
      index++;
      scrollToBottom();
    } else {
      // 输出完成
      clearInterval(typeInterval);
      chatStore.setSending(false);
    }
  }, 100);
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

.index-top {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 200rpx;
  padding: 0 var(--space-md);
  box-shadow: var(--shadow-sm);

  .top-title {
    display: flex;
    align-items: center;
    padding: 0 var(--space-md);
    height: 65rpx;

    .title {
      font-size: var(--font-base);
      font-weight: 500;
      color: var(--text-primary);
    }
  }
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