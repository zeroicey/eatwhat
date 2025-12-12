const express = require('express');
const router = express.Router();
const momentController = require('../controllers/momentController');
const authMiddleware = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');

// Public routes
router.get('/', optionalAuth, momentController.getMoments.bind(momentController));
router.get('/:id', momentController.getMomentById.bind(momentController));
router.get('/:id/comments', momentController.getComments.bind(momentController));

// Protected routes
router.post('/', authMiddleware, momentController.createMoment.bind(momentController));
router.post('/:id/like', authMiddleware, momentController.likeMoment.bind(momentController));
router.post('/:id/comments', authMiddleware, momentController.addComment.bind(momentController));

module.exports = router;
