// chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.get('/:targetUserId', chatController.getMessages);
router.post('/send', chatController.sendMessage);

module.exports = router;
