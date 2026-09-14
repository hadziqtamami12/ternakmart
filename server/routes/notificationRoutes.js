// notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/my', notificationController.getMyNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:notifId/read', notificationController.markAsRead);
router.post('/demo-trigger', notificationController.triggerDemoNotification);
router.post('/subscribe-push', notificationController.subscribePush);

module.exports = router;
