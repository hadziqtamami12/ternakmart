// settingRoutes.js
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Public route to fetch platform branding & settings
router.get('/', settingController.getSettings);

// Route to update branding & configs
router.put('/', optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses khusus administrator.' });
  }
  return settingController.updateSettings(req, res, next);
});

module.exports = router;
