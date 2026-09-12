// reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, reviewController.createReview);
router.get('/store/:storeId', reviewController.getStoreReviews);
router.get('/', reviewController.getAllReviews);
router.post('/admin', authenticate, reviewController.createAdminReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
