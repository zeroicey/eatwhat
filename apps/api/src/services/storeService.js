const Store = require('../models/Store');
const { STORE_SORT, PAGINATION } = require('../utils/constants');

class StoreService {
  /**
   * Create a new store
   */
  async createStore(storeData, userId) {
    const store = await Store.create({
      ...storeData,
      creator: userId,
    });
    return store;
  }

  /**
   * Get store list with pagination and sorting
   */
  async getStores(options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = STORE_SORT.UPDATED,
      longitude,
      latitude,
      maxDistance = 10000, // 10km default
    } = options;

    const skip = (page - 1) * limit;
    let query = {};
    let sort = {};

    if (sortBy === STORE_SORT.DISTANCE && longitude && latitude) {
      // Geospatial query for distance sorting
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance,
        },
      };
    } else {
      // Default: sort by updated time
      sort = { updatedAt: -1 };
    }

    const [stores, total] = await Promise.all([
      Store.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('creator', 'nickName avatarUrl')
        .lean(),
      Store.countDocuments(query),
    ]);

    return {
      stores,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Search stores by keyword with optional distance/update sort
   */
  async searchStores(keyword = '', options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = STORE_SORT.UPDATED,
      longitude,
      latitude,
      maxDistance = 10000,
    } = options;

    const skip = (page - 1) * limit;
    const regex = new RegExp(keyword, 'i');
    let query = {
      $or: [{ name: regex }, { description: regex }],
    };
    let sort = {};

    if (sortBy === STORE_SORT.DISTANCE && longitude && latitude) {
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: maxDistance,
        },
      };
    } else {
      sort = { updatedAt: -1 };
    }

    const [stores, total] = await Promise.all([
      Store.find(query).sort(sort).skip(skip).limit(limit).populate('creator', 'nickName avatarUrl').lean(),
      Store.countDocuments(query),
    ]);

    return {
      stores,
      pagination: { page, limit, total },
    };
  }
  /**
   * Get store by ID
   */
  async getStoreById(storeId) {
    const store = await Store.findById(storeId)
      .populate('creator', 'nickName avatarUrl')
      .lean();
    return store;
  }

  /**
   * Update store
   */
  async updateStore(storeId, userId, updateData) {
    const store = await Store.findOne({ _id: storeId, creator: userId });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    Object.assign(store, updateData);
    await store.save();
    return store;
  }

  /**
   * Delete store
   */
  async deleteStore(storeId, userId) {
    const store = await Store.findOneAndDelete({ _id: storeId, creator: userId });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    return store;
  }
}

module.exports = new StoreService();
