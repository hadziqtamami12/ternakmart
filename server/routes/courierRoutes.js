// courierRoutes.js
const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courierController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/register-fleet', courierController.registerFleet);
router.get('/fleets', courierController.getFleets);
router.post('/accept', authorize(['COURIER', 'ADMIN']), courierController.acceptDelivery);
router.post('/tracking-gps', authorize(['COURIER', 'ADMIN']), courierController.updateTrackingGps);
router.post('/finish-handover', authorize(['COURIER', 'ADMIN']), courierController.finishHandover);

module.exports = router;
