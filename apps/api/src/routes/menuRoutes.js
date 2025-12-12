const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middlewares/auth');

// Public routes
router.get('/', menuController.getMenuItems.bind(menuController));

// Protected routes
router.post('/', authMiddleware, menuController.createMenuItem.bind(menuController));
router.post('/:id/like', authMiddleware, menuController.likeMenuItem.bind(menuController));
router.post('/:id/report', authMiddleware, menuController.reportMenuItem.bind(menuController));

module.exports = router;
