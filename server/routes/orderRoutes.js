// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/estimate', orderController.calculateEstimate);
router.post('/create', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/discount', authorize(['ADMIN', 'SELLER']), orderController.updateOrderDiscount);

module.exports = router;
