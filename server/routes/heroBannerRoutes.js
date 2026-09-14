// heroBannerRoutes.js
const express = require('express');
const router = express.Router();
const heroBannerController = require('../controllers/heroBannerController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route to view active hero banners
router.get('/', heroBannerController.getBanners);

// Protected admin CRUD routes
router.post('/', authenticate, authorize('ADMIN'), heroBannerController.createBanner);
router.put('/:id', authenticate, authorize('ADMIN'), heroBannerController.updateBanner);
router.delete('/:id', authenticate, authorize('ADMIN'), heroBannerController.deleteBanner);

module.exports = router;
