// auth.js - JWT Authentication & Role-Based Access Control Middleware
const jwt = require('jsonwebtoken');
const db = require('../database/adapter');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret-ternakmart-jwt-key-2026-production-ready';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Sesi kedaluwarsa atau pengguna tidak lagi terdaftar.'
      });
    }

    // Attach user to req (strip password hash)
    const { password_hash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token otentikasi tidak valid atau telah berakhir masa berlakunya.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.findById('users', decoded.id);
      if (user) {
        const { password_hash, ...safeUser } = user;
        req.user = safeUser;
      }
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Harap masuk (login) terlebih dahulu.'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini.`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  authorizeRole: (role) => authorize(Array.isArray(role) ? role : [role])
};
