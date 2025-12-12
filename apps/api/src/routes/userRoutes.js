const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.get('/me', auth, userController.me.bind(userController));
router.put('/profile', auth, userController.updateProfile.bind(userController));
router.get('/me/contributions/stores', auth, userController.myStores.bind(userController));
router.get('/me/contributions/menu-items', auth, userController.myMenuItems.bind(userController));

module.exports = router;

