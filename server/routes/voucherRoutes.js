// voucherRoutes.js
const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, voucherController.getVouchers);
router.post('/check', voucherController.checkVoucher);
router.post('/', authenticate, authorize(['ADMIN', 'SELLER']), voucherController.createVoucher);

module.exports = router;
