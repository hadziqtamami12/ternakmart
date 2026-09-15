// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', optionalAuth, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/resolve-location', authController.resolveLocation);

// Admin User Management routes (accessible via /auth/users or /admin/users)
router.get(['/users', '/'], optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Perlu hak akses Administrator.' });
  }
  next();
}, authController.getAllUsers);
router.post(['/users', '/'], optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  next();
}, authController.createAdminUser);
router.put(['/users/:id', '/:id'], optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  next();
}, authController.updateAdminUser);
router.delete(['/users/:id', '/:id'], optionalAuth, (req, res, next) => {
  if (req.user && req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  next();
}, authController.deleteAdminUser);

module.exports = router;
