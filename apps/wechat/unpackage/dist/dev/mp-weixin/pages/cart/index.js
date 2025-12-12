"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_cart = require("../../stores/cart.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const cartStore = stores_cart.useCartStore();
    common_vendor.computed(() => cartStore.totalItemCount);
    common_vendor.computed(() => cartStore.totalPrice);
    return (_ctx, _cache) => {
      return {};
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8039fbf1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cart/index.js.map
