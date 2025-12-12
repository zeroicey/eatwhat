const momentService = require('../services/momentService');
const { success, error, paginated } = require('../utils/response');

class MomentController {
  /**
   * POST /api/moments
   */
  async createMoment(req, res, next) {
    try {
      const { content, images, storeId } = req.body;

      if (!content) {
        return error(res, 'Content is required', 400);
      }

      const moment = await momentService.createMoment({ content, images, storeId }, req.userId);

      return success(res, moment, 'Moment created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/moments
   */
  async getMoments(req, res, next) {
    try {
      const { page, limit, storeId } = req.query;

      const result = await momentService.getMoments({
        page: parseInt(page),
        limit: parseInt(limit),
        storeId,
        userId: req.userId,
      });

      return paginated(res, result.moments, result.pagination, 'Moments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/moments/:id
   */
  async getMomentById(req, res, next) {
    try {
      const { id } = req.params;
      const moment = await momentService.getMomentById(id);

      if (!moment) {
        return error(res, 'Moment not found', 404);
      }

      return success(res, moment, 'Moment retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/moments/:id/like
   */
  async likeMoment(req, res, next) {
    try {
      const { id } = req.params;
      const result = await momentService.likeMoment(id, req.userId);

      return success(res, result, result.liked ? 'Moment liked' : 'Moment unliked');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/moments/:id/comments
   */
  async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const { content, replyTo } = req.body;

      if (!content) {
        return error(res, 'Content is required', 400);
      }

      const comment = await momentService.addComment(id, req.userId, content, replyTo);

      return success(res, comment, 'Comment added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/moments/:id/comments
   */
  async getComments(req, res, next) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;

      const result = await momentService.getComments(id, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return paginated(res, result.comments, result.pagination, 'Comments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MomentController();
