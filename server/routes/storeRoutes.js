// storeRoutes.js
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, storeController.getStores);
router.get('/:slug', storeController.getStoreBySlug);
router.post('/register', authenticate, storeController.registerStore);
router.put('/:storeId/status', authenticate, authorize(['ADMIN']), storeController.updateStoreStatus);

module.exports = router;
