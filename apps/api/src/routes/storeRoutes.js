const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/auth');

// Public routes
router.get('/', storeController.getStores.bind(storeController));
router.get('/:id', storeController.getStoreById.bind(storeController));

// Protected routes
router.post('/', authMiddleware, storeController.createStore.bind(storeController));
router.put('/:id', authMiddleware, storeController.updateStore.bind(storeController));
router.delete('/:id', authMiddleware, storeController.deleteStore.bind(storeController));

module.exports = router;
