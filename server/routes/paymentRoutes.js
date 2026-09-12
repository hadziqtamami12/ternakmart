// paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/upload-proof', authenticate, paymentController.uploadTransferProof);
router.post('/review-proof', authenticate, paymentController.reviewPaymentProof);
router.post('/webhook', paymentController.gatewayWebhook);

module.exports = router;
