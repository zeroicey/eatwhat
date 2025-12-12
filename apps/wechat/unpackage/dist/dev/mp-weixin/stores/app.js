"use strict";
const common_vendor = require("../common/vendor.js");
const useAppStore = common_vendor.defineStore("app", {
  state: () => ({
    // 全局加载状态
    loading: false,
    // 加载文本
    loadingText: "Loading...",
    // Toast 消息队列
    toasts: [],
    // Modal 显示状态
    modal: {
      visible: false,
      title: "",
      content: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: null,
      onCancel: null
    },
    // 网络状态
    networkType: "unknown",
    isOnline: true,
    // 系统信息
    systemInfo: null,
    // 当前页面路径
    currentPage: ""
  }),
  getters: {
    /**
     * 是否有 Toast 消息
     */
    hasToast: (state) => state.toasts.length > 0,
    /**
     * 获取最新的 Toast 消息
     */
    latestToast: (state) => {
      return state.toasts.length > 0 ? state.toasts[0] : null;
    }
  },
  actions: {
    /**
     * 显示全局加载
     * @param {String} text - 加载提示文本
     */
    showLoading(text = "Loading...") {
      this.loading = true;
      this.loadingText = text;
      common_vendor.index.showLoading({
        title: text,
        mask: true
      });
    },
    /**
     * 隐藏全局加载
     */
    hideLoading() {
      this.loading = false;
      common_vendor.index.hideLoading();
    },
    /**
     * 显示 Toast 提示
     * @param {Object} options - { message, type, duration }
     */
    showToast({ message, type = "none", duration = 2e3 }) {
      const toast = {
        id: Date.now(),
        message,
        type,
        // success, error, warning, info, none
        duration
      };
      this.toasts.push(toast);
      common_vendor.index.showToast({
        title: message,
        icon: type === "success" ? "success" : type === "error" ? "error" : "none",
        duration
      });
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    },
    /**
     * 移除 Toast
     * @param {Number} id - Toast ID
     */
    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
    /**
     * 显示确认对话框
     * @param {Object} options - { title, content, confirmText, cancelText, onConfirm, onCancel }
     */
    showModal(options) {
      this.modal = {
        visible: true,
        title: options.title || "",
        content: options.content || "",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        onConfirm: options.onConfirm || null,
        onCancel: options.onCancel || null
      };
      common_vendor.index.showModal({
        title: this.modal.title,
        content: this.modal.content,
        confirmText: this.modal.confirmText,
        cancelText: this.modal.cancelText,
        success: (res) => {
          if (res.confirm && this.modal.onConfirm) {
            this.modal.onConfirm();
          } else if (res.cancel && this.modal.onCancel) {
            this.modal.onCancel();
          }
          this.hideModal();
        }
      });
    },
    /**
     * 隐藏对话框
     */
    hideModal() {
      this.modal.visible = false;
    },
    /**
     * 更新网络状态
     * @param {Object} info - { networkType, isConnected }
     */
    updateNetworkStatus(info) {
      this.networkType = info.networkType;
      this.isOnline = info.isConnected;
    },
    /**
     * 监听网络状态变化
     */
    watchNetworkStatus() {
      common_vendor.index.getNetworkType({
        success: (res) => {
          this.updateNetworkStatus({
            networkType: res.networkType,
            isConnected: res.networkType !== "none"
          });
        }
      });
      common_vendor.index.onNetworkStatusChange((res) => {
        this.updateNetworkStatus({
          networkType: res.networkType,
          isConnected: res.isConnected
        });
        if (!res.isConnected) {
          this.showToast({
            message: "Network disconnected",
            type: "error"
          });
        }
      });
    },
    /**
     * 获取系统信息
     */
    getSystemInfo() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.systemInfo = res;
        }
      });
    },
    /**
     * 更新当前页面路径
     * @param {String} path - 页面路径
     */
    setCurrentPage(path) {
      this.currentPage = path;
    }
  }
});
exports.useAppStore = useAppStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/app.js.map
