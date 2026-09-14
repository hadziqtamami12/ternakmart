// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/resolve-location', authController.resolveLocation);

// Admin User Management routes
router.get('/users', authenticate, authorize(['ADMIN']), authController.getAllUsers);
router.post('/users', authenticate, authorize(['ADMIN']), authController.createAdminUser);
router.put('/users/:id', authenticate, authorize(['ADMIN']), authController.updateAdminUser);
router.delete('/users/:id', authenticate, authorize(['ADMIN']), authController.deleteAdminUser);

module.exports = router;
