const MenuItem = require('../models/MenuItem');
const MenuInteraction = require('../models/MenuInteraction');
const { INTERACTION_TYPE, PAGINATION, REPORT_THRESHOLD } = require('../utils/constants');

class MenuService {
  /**
   * Create menu item
   */
  async createMenuItem(menuData, userId) {
    const menuItem = await MenuItem.create({
      ...menuData,
      creator: userId,
    });
    return menuItem;
  }

  /**
   * Get menu items by store
   */
  async getMenuItems(storeId, options = {}) {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MenuItem.find({ storeId, status: 'active' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creator', 'nickName')
        .lean(),
      MenuItem.countDocuments({ storeId, status: 'active' }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Like a menu item
   */
  async likeMenuItem(menuItemId, userId) {
    // Check if already liked
    const existingLike = await MenuInteraction.findOne({
      menuItemId,
      userId,
      type: INTERACTION_TYPE.LIKE,
    });

    if (existingLike) {
      // Unlike: remove the like
      await MenuInteraction.deleteOne({ _id: existingLike._id });
      await MenuItem.findByIdAndUpdate(menuItemId, { $inc: { likeCount: -1 } });
      return { liked: false };
    } else {
      // Like: add the like
      await MenuInteraction.create({
        menuItemId,
        userId,
        type: INTERACTION_TYPE.LIKE,
      });
      await MenuItem.findByIdAndUpdate(menuItemId, { $inc: { likeCount: 1 } });
      return { liked: true };
    }
  }

  /**
   * Report a menu item
   */
  async reportMenuItem(menuItemId, userId) {
    // Check if already reported
    const existingReport = await MenuInteraction.findOne({
      menuItemId,
      userId,
      type: INTERACTION_TYPE.REPORT,
    });

    if (existingReport) {
      throw new Error('Already reported this item');
    }

    // Create report
    await MenuInteraction.create({
      menuItemId,
      userId,
      type: INTERACTION_TYPE.REPORT,
    });

    // Increment report count
    const menuItem = await MenuItem.findByIdAndUpdate(
      menuItemId,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    // Check if report threshold exceeded
    if (menuItem.reportCount >= REPORT_THRESHOLD) {
      menuItem.status = 'pending';
      await menuItem.save();
    }

    return menuItem;
  }
}

module.exports = new MenuService();
