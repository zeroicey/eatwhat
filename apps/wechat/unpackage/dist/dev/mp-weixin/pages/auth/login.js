"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_app = require("../../stores/app.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    stores_user.useUserStore();
    const appStore = stores_app.useAppStore();
    const handleLogin = () => {
      common_vendor.index.login({
        provider: "weixin",
        success: (loginRes) => {
          common_vendor.index.__f__("log", "at pages/auth/login.vue:23", "Login code:", loginRes.code);
          appStore.showToast({
            message: "Login feature coming soon",
            type: "info"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/auth/login.vue:31", "Login failed:", err);
          appStore.showToast({
            message: "Login failed",
            type: "error"
          });
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleLogin)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2cc9f8c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/login.js.map
