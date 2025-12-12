"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
const stores_app = require("./stores/app.js");
if (!Math) {
  "./pages/home/index.js";
  "./pages/discover/index.js";
  "./pages/cart/index.js";
  "./pages/profile/index.js";
  "./pages/cart/preview.js";
  "./pages/profile/contributions.js";
  "./pages/profile/settings.js";
  "./pages/auth/login.js";
  "./pages/store/detail.js";
  "./pages/store/create.js";
  "./pages/menu/digitize.js";
  "./pages/menu/item-detail.js";
  "./pages/moment/publish.js";
  "./pages/moment/detail.js";
  "./pages/share/generate.js";
  "./pages/share/result.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const appStore = stores_app.useAppStore();
    common_vendor.onLaunch(() => {
      common_vendor.index.__f__("log", "at App.vue:10", "App Launch");
      appStore.getSystemInfo();
      appStore.watchNetworkStatus();
      userStore.restoreToken();
      if (!userStore.checkAuth()) {
        common_vendor.index.__f__("log", "at App.vue:25", "User not authenticated");
      }
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:30", "App Show");
      if (userStore.isLoggedIn && userStore.isTokenExpired) {
        userStore.logout();
        common_vendor.index.showToast({
          title: "Login expired, please login again",
          icon: "none"
        });
      }
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:43", "App Hide");
    });
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  app.use(common_vendor.VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1e3,
          // 5分钟
          cacheTime: 10 * 60 * 1e3,
          // 10分钟
          refetchOnWindowFocus: true,
          retry: 3,
          retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4)
        }
      }
    }
  });
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
