// addressRoutes.js
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', addressController.getMyAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.put('/:id/default', addressController.setDefaultAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
