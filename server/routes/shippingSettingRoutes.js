// shippingSettingRoutes.js
const express = require('express');
const router = express.Router();
const shippingSettingController = require('../controllers/shippingSettingController');
const { authenticate, authorize } = require('../middleware/auth');

// Public/Authenticated can read settings (needed for checkout calculations)
router.get('/', shippingSettingController.getShippingSettings);

// Admin only update
router.put('/', authenticate, authorize(['ADMIN']), shippingSettingController.updateShippingSettings);

module.exports = router;
