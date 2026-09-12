// cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/quantity', cartController.updateQuantity);
router.post('/bulk-delete', cartController.bulkDelete);
router.delete('/item/:animal_id', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;
