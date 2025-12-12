"use strict";
const common_vendor = require("../common/vendor.js");
const useCartStore = common_vendor.defineStore("cart", {
  state: () => ({
    // 购物车项目，按店铺分组
    // 数据结构: { storeId: { storeInfo: {}, items: [] } }
    items: {},
    // 最后更新时间
    lastUpdated: null
  }),
  getters: {
    /**
     * 获取所有店铺列表
     */
    storeList: (state) => {
      return Object.values(state.items).map((store) => store.storeInfo);
    },
    /**
     * 获取总商品数量
     */
    totalItemCount: (state) => {
      return Object.values(state.items).reduce((total, store) => {
        return total + store.items.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);
    },
    /**
     * 按店铺分组计算价格
     */
    priceByStore: (state) => {
      const result = {};
      Object.keys(state.items).forEach((storeId) => {
        const store = state.items[storeId];
        result[storeId] = {
          storeName: store.storeInfo.name,
          subtotal: store.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
          }, 0),
          itemCount: store.items.length
        };
      });
      return result;
    },
    /**
     * 计算总价
     */
    totalPrice: (state) => {
      return Object.values(state.items).reduce((total, store) => {
        return total + store.items.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);
      }, 0);
    },
    /**
     * 检查购物车是否为空
     */
    isEmpty: (state) => {
      return Object.keys(state.items).length === 0;
    }
  },
  actions: {
    /**
     * 添加商品到购物车
     * @param {Object} storeInfo - 店铺信息 { id, name, ... }
     * @param {Object} item - 商品信息 { id, name, price, ... }
     * @param {Number} quantity - 数量
     */
    addItem(storeInfo, item, quantity = 1) {
      const storeId = storeInfo.id;
      if (!this.items[storeId]) {
        this.items[storeId] = {
          storeInfo,
          items: []
        };
      }
      const existingItem = this.items[storeId].items.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items[storeId].items.push({
          ...item,
          quantity,
          note: ""
          // 备注
        });
      }
      this.lastUpdated = Date.now();
    },
    /**
     * 删除商品
     * @param {String} storeId - 店铺ID
     * @param {String} itemId - 商品ID
     */
    removeItem(storeId, itemId) {
      if (!this.items[storeId])
        return;
      this.items[storeId].items = this.items[storeId].items.filter(
        (item) => item.id !== itemId
      );
      if (this.items[storeId].items.length === 0) {
        delete this.items[storeId];
      }
      this.lastUpdated = Date.now();
    },
    /**
     * 更新商品数量
     * @param {String} storeId - 店铺ID
     * @param {String} itemId - 商品ID
     * @param {Number} quantity - 新数量
     */
    updateQuantity(storeId, itemId, quantity) {
      if (!this.items[storeId])
        return;
      const item = this.items[storeId].items.find((i) => i.id === itemId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(storeId, itemId);
        } else {
          item.quantity = quantity;
          this.lastUpdated = Date.now();
        }
      }
    },
    /**
     * 更新商品备注
     * @param {String} storeId - 店铺ID
     * @param {String} itemId - 商品ID
     * @param {String} note - 备注内容
     */
    updateNote(storeId, itemId, note) {
      if (!this.items[storeId])
        return;
      const item = this.items[storeId].items.find((i) => i.id === itemId);
      if (item) {
        item.note = note;
        this.lastUpdated = Date.now();
      }
    },
    /**
     * 清空整个购物车
     */
    clearCart() {
      this.items = {};
      this.lastUpdated = Date.now();
    },
    /**
     * 清空指定店铺的商品
     * @param {String} storeId - 店铺ID
     */
    clearStore(storeId) {
      delete this.items[storeId];
      this.lastUpdated = Date.now();
    },
    /**
     * 获取指定店铺的商品列表
     * @param {String} storeId - 店铺ID
     * @returns {Array} 商品列表
     */
    getStoreItems(storeId) {
      var _a;
      return ((_a = this.items[storeId]) == null ? void 0 : _a.items) || [];
    }
  },
  // 持久化配置 - 使用 UniApp 本地存储
  // 注意：需要在 store 初始化时手动恢复状态
  persist: false
  // 暂时关闭自动持久化，使用手动方式
});
exports.useCartStore = useCartStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/cart.js.map
