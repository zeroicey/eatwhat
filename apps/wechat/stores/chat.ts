import { defineStore } from 'pinia'

export interface ChatMessage {
  content: string
  position: 'left' | 'right'
  files: any[]
  isMarkdown: boolean
  resources: any[]
  isError: boolean
  loading?: boolean
}

export interface ChatState {
  messages: ChatMessage[]
  chatUUID: string | null
  isSending: boolean
  attachmentFiles: any[]
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: [],
    chatUUID: null,
    isSending: false,
    attachmentFiles: []
  }),

  getters: {
    getMessages: (state) => state.messages,
    getChatUUID: (state) => state.chatUUID,
    getIsSending: (state) => state.isSending,
    getAttachmentFiles: (state) => state.attachmentFiles,
    getShowWelcome: (state) => state.messages.length === 0
  },

  actions: {
    // 添加用户消息
    addUserMessage(content: string, files: any[] = []) {
      this.messages.push({
        content,
        position: 'right',
        files,
        isMarkdown: false,
        resources: [],
        isError: false
      })
    },

    // 添加AI消息
    addAiMessage(content: string = '', isMarkdown: boolean = true, resources: any[] = []) {
      this.messages.push({
        content,
        position: 'left',
        files: [],
        isMarkdown,
        resources,
        loading: true,
        isError: false
      })
    },

    // 更新最后一条消息内容
    updateLastMessage(content: string) {
      if (this.messages.length > 0) {
        this.messages[this.messages.length - 1].content += content
      }
    },
 
    // 设置最后一条AI消息的加载状态
    setLastAiMessageLoading(loading: boolean) {
      if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1]
        if (lastMessage.position === 'left') {
          lastMessage.loading = loading
        }
      }
    },

    // 更新最后一条消息的资源
    updateLastMessageResources(resources: any[]) {
      if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1]
        if (lastMessage.position === 'left') {
          lastMessage.resources = resources
        }
      }
    },

    // 设置最后一条消息为错误状态
    setLastMessageError(error: string) {
      if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1]
        if (lastMessage.position === 'left') {
          lastMessage.content = error
          lastMessage.isError = true
        }
      }
    },

    // 设置发送状态
    setSending(sending: boolean) {
      this.isSending = sending
    },

    // 设置聊天UUID
    setChatUUID(uuid: string | null) {
      this.chatUUID = uuid
    },

    // 设置附件文件
    setAttachmentFiles(files: any[]) {
      this.attachmentFiles = files
    },

    // 清空聊天记录
    clearMessages() {
      this.messages = []
      this.chatUUID = null
    },

    // 清空附件
    clearAttachments() {
      this.attachmentFiles = []
    }
  }
})
