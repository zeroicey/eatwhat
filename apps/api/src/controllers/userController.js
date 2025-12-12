const User = require('../models/User');
const Store = require('../models/Store');
const MenuItem = require('../models/MenuItem');
const { success, error, paginated } = require('../utils/response');

class UserController {
  async me(req, res, next) {
    try {
      const user = await User.findById(req.userId).lean();
      if (!user) {
        return error(res, 'User not found', 404);
      }
      const data = {
        id: user._id,
        nickName: user.nickName || '',
        avatarUrl: user.avatarUrl || '',
      };
      return success(res, data, 'OK');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { nickName, avatarUrl } = req.body || {};
      const update = {};
      if (typeof nickName === 'string') update.nickName = nickName;
      if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl;
      const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).lean();
      if (!user) {
        return error(res, 'User not found', 404);
      }
      const data = {
        id: user._id,
        nickName: user.nickName || '',
        avatarUrl: user.avatarUrl || '',
      };
      return success(res, data, 'Profile updated');
    } catch (err) {
      next(err);
    }
  }

  async myStores(req, res, next) {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Store.find({ creator: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Store.countDocuments({ creator: req.userId }),
      ]);
      return paginated(res, items, { page, limit, total }, 'OK');
    } catch (err) {
      next(err);
    }
  }

  async myMenuItems(req, res, next) {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
      const skip = (page - 1) * limit;
      const query = { creator: req.userId, status: 'active' };
      const [items, total] = await Promise.all([
        MenuItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        MenuItem.countDocuments(query),
      ]);
      return paginated(res, items, { page, limit, total }, 'OK');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();

