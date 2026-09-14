// badgeRoutes.js
const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { authenticate, authorize } = require('../middleware/auth');

// Public view
router.get('/', badgeController.getAllBadges);

// Admin operations
router.post('/', authenticate, authorize(['ADMIN']), badgeController.createBadge);
router.put('/:id', authenticate, authorize(['ADMIN']), badgeController.updateBadge);
router.delete('/:id', authenticate, authorize(['ADMIN']), badgeController.deleteBadge);
router.post('/assign', authenticate, authorize(['ADMIN']), badgeController.assignUserBadge);
router.post('/assign-user', authenticate, authorize(['ADMIN']), badgeController.assignUserBadge);

module.exports = router;
