const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimit');

router.post('/login', authLimiter, authController.login.bind(authController));
router.post('/refresh', authLimiter, authController.refresh.bind(authController));

module.exports = router;
