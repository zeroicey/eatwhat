const menuService = require('../services/menuService');
const { success, error, paginated } = require('../utils/response');

class MenuController {
  /**
   * POST /api/menus
   */
  async createMenuItem(req, res, next) {
    try {
      const { storeId, name, price } = req.body;

      if (!storeId || !name || price === undefined) {
        return error(res, 'StoreId, name, and price are required', 400);
      }

      const menuItem = await menuService.createMenuItem({ storeId, name, price }, req.userId);

      return success(res, menuItem, 'Menu item created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/menus?storeId=xxx
   */
  async getMenuItems(req, res, next) {
    try {
      const { storeId, page, limit } = req.query;

      if (!storeId) {
        return error(res, 'StoreId is required', 400);
      }

      const result = await menuService.getMenuItems(storeId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return paginated(res, result.items, result.pagination, 'Menu items retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/menus/:id
   */
  async getMenuItemById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await menuService.getMenuItemById(id);
      if (!item) {
        return error(res, 'Menu item not found', 404);
      }
      return success(res, item, 'Menu item retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/menus/:id/like
   */
  async likeMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      const result = await menuService.likeMenuItem(id, req.userId);

      return success(res, result, result.liked ? 'Item liked' : 'Item unliked');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/menus/:id/report
   */
  async reportMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      const result = await menuService.reportMenuItem(id, req.userId);

      return success(res, result, 'Item reported successfully');
    } catch (err) {
      if (err.message === 'Already reported this item') {
        return error(res, err.message, 400);
      }
      next(err);
    }
  }
}

module.exports = new MenuController();
