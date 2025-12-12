const Moment = require('../models/Moment');
const MomentLike = require('../models/MomentLike');
const MomentComment = require('../models/MomentComment');
const { PAGINATION } = require('../utils/constants');

class MomentService {
  /**
   * Create a moment
   */
  async createMoment(momentData, userId) {
    const moment = await Moment.create({
      ...momentData,
      userId,
    });
    return moment;
  }

  /**
   * Get moments feed
   */
  async getMoments(options = {}) {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, storeId } = options;

    const skip = (page - 1) * limit;
    const query = storeId ? { storeId } : {};

    const [moments, total] = await Promise.all([
      Moment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'nickName avatarUrl')
        .populate('storeId', 'name')
        .lean(),
      Moment.countDocuments(query),
    ]);

    return {
      moments,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get moment by ID
   */
  async getMomentById(momentId) {
    const moment = await Moment.findById(momentId)
      .populate('userId', 'nickName avatarUrl')
      .populate('storeId', 'name')
      .lean();
    return moment;
  }

  /**
   * Like a moment
   */
  async likeMoment(momentId, userId) {
    const existingLike = await MomentLike.findOne({ momentId, userId });

    if (existingLike) {
      // Unlike
      await MomentLike.deleteOne({ _id: existingLike._id });
      await Moment.findByIdAndUpdate(momentId, { $inc: { likeCount: -1 } });
      return { liked: false };
    } else {
      // Like
      await MomentLike.create({ momentId, userId });
      await Moment.findByIdAndUpdate(momentId, { $inc: { likeCount: 1 } });
      return { liked: true };
    }
  }

  /**
   * Add comment to moment
   */
  async addComment(momentId, userId, content, replyTo = null) {
    const comment = await MomentComment.create({
      momentId,
      userId,
      content,
      replyTo,
    });

    await Moment.findByIdAndUpdate(momentId, { $inc: { commentCount: 1 } });

    return comment;
  }

  /**
   * Get comments for a moment
   */
  async getComments(momentId, options = {}) {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = options;

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      MomentComment.find({ momentId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'nickName avatarUrl')
        .populate('replyTo', 'nickName')
        .lean(),
      MomentComment.countDocuments({ momentId }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }
}

module.exports = new MomentService();
