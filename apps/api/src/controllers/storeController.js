const storeService = require('../services/storeService');
const { success, error, paginated } = require('../utils/response');

class StoreController {
  /**
   * POST /api/stores
   */
  async createStore(req, res, next) {
    try {
      const { name, description, coverImage, menuImages, location } = req.body;

      if (!name || !location || !location.coordinates) {
        return error(res, 'Name and location are required', 400);
      }

      const store = await storeService.createStore(
        { name, description, coverImage, menuImages, location },
        req.userId
      );

      return success(res, store, 'Store created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/stores
   */
  async getStores(req, res, next) {
    try {
      const { page, limit, sortBy, longitude, latitude, maxDistance } = req.query;

      const result = await storeService.getStores({
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        longitude,
        latitude,
        maxDistance: parseInt(maxDistance),
      });

      return paginated(res, result.stores, result.pagination, 'Stores retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/stores/search
   */
  async searchStores(req, res, next) {
    try {
      const { keyword, page, limit, sortBy, longitude, latitude, maxDistance } = req.query;
      const result = await storeService.searchStores(keyword || '', {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        longitude,
        latitude,
        maxDistance: parseInt(maxDistance),
      });
      return paginated(res, result.stores, result.pagination, 'Stores search results');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/stores/:id
   */
  async getStoreById(req, res, next) {
    try {
      const { id } = req.params;
      const store = await storeService.getStoreById(id);

      if (!store) {
        return error(res, 'Store not found', 404);
      }

      return success(res, store, 'Store retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/stores/:id
   */
  async updateStore(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const store = await storeService.updateStore(id, req.userId, updateData);

      return success(res, store, 'Store updated successfully');
    } catch (err) {
      if (err.message === 'Store not found or unauthorized') {
        return error(res, err.message, 404);
      }
      next(err);
    }
  }

  /**
   * DELETE /api/stores/:id
   */
  async deleteStore(req, res, next) {
    try {
      const { id } = req.params;
      await storeService.deleteStore(id, req.userId);

      return success(res, null, 'Store deleted successfully');
    } catch (err) {
      if (err.message === 'Store not found or unauthorized') {
        return error(res, err.message, 404);
      }
      next(err);
    }
  }
}

module.exports = new StoreController();
