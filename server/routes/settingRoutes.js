// settingRoutes.js
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route to fetch platform branding & settings
router.get('/', settingController.getSettings);

// Admin-only route to update branding & configs
router.put('/', authenticate, authorize(['ADMIN']), settingController.updateSettings);

module.exports = router;
