// animalRoutes.js
const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', animalController.getAnimals);
router.get('/detail/:id', animalController.getAnimalById);
router.get('/:slug', animalController.getAnimalBySlug);

router.post('/', authenticate, authorize(['SELLER', 'ADMIN']), animalController.createAnimal);
router.put('/:id', authenticate, authorize(['SELLER', 'ADMIN']), animalController.updateAnimal);
router.delete('/:id', authenticate, authorize(['SELLER', 'ADMIN']), animalController.deleteAnimal);

// SKKH Verification endpoint (ADMIN only)
router.put('/:id/verify-skkh', authenticate, authorize(['ADMIN']), animalController.verifySKKH);

module.exports = router;
