try {
  require('dotenv').config();
} catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/adapter');

const app = express();

// Lazy Database Initialization: Non-blocking graceful startup
if (db && typeof db.connect === 'function') {
  db.connect().catch(err => {
    console.warn('⚠️ [DB Warning] Lazy DB connection deferred, running in resilient fallback mode:', err.message);
  });
}

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Defensive body parsing (prevents hanging in Vercel Serverless if body is pre-parsed)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    return next();
  }
  return express.json({ limit: '15mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  return express.urlencoded({ extended: true, limit: '15mb' })(req, res, next);
});

// Static uploads directory serving
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isServerless 
  ? path.join('/tmp', 'uploads') 
  : path.join(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');
app.use('/uploads', express.static(uploadDir));

// Route Imports
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const animalRoutes = require('./routes/animalRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const courierRoutes = require('./routes/courierRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const settingRoutes = require('./routes/settingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const addressRoutes = require('./routes/addressRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const shippingSettingRoutes = require('./routes/shippingSettingRoutes');
const heroBannerRoutes = require('./routes/heroBannerRoutes');

// API Mounts
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);

// Stores (plural & singular aliases)
apiRouter.use('/stores', storeRoutes);
apiRouter.use('/store', storeRoutes);

// Animals (plural & singular aliases)
apiRouter.use('/animals', animalRoutes);
apiRouter.use('/animal', animalRoutes);

// Carts (plural & singular aliases)
apiRouter.use('/carts', cartRoutes);
apiRouter.use('/cart', cartRoutes);

// Orders (plural & singular aliases)
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/order', orderRoutes);

// Payments (plural & singular aliases)
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/payment', paymentRoutes);

// Courier
apiRouter.use('/courier', courierRoutes);
apiRouter.use('/couriers', courierRoutes);

// Chats
apiRouter.use('/chats', chatRoutes);
apiRouter.use('/chat', chatRoutes);

// Reviews (plural & singular aliases)
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/review', reviewRoutes);

// Vouchers
apiRouter.use('/vouchers', voucherRoutes);
apiRouter.use('/voucher', voucherRoutes);

// Settings (plural & singular aliases)
apiRouter.use('/settings', settingRoutes);
apiRouter.use('/setting', settingRoutes);

// Hero Banners (plural & singular aliases)
apiRouter.use('/hero-banners', heroBannerRoutes);
apiRouter.use('/hero-banner', heroBannerRoutes);

apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/address', addressRoutes);
apiRouter.use('/badges', badgeRoutes);
apiRouter.use('/badge', badgeRoutes);
apiRouter.use('/shipping-settings', shippingSettingRoutes);

// Admin Portal Specific Aliases
apiRouter.use('/admin/users', authRoutes);
apiRouter.use('/admin/badges', badgeRoutes);
apiRouter.use('/admin/settings', settingRoutes);
apiRouter.use('/admin/shipping-settings', shippingSettingRoutes);
apiRouter.use('/admin/hero-banners', heroBannerRoutes);
apiRouter.use('/admin/hero-banner', heroBannerRoutes);
apiRouter.use('/admin/orders', orderRoutes);
apiRouter.use('/admin/stores', storeRoutes);
apiRouter.use('/admin/animals', animalRoutes);
apiRouter.use('/admin/reviews', reviewRoutes);
apiRouter.use('/admin/audit-logs', auditRoutes);

// Health check
apiRouter.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Ternakmart Unified API Server',
    database_driver: process.env.DB_DRIVER || 'mock',
    storage_driver: process.env.STORAGE_DRIVER || 'local'
  });
});

app.use('/api/v1', apiRouter);
app.use('/api', apiRouter); // Alias for root api compatibility
app.use('/v1', apiRouter);  // Resilient fallback if /api prefix is stripped
app.use('/', apiRouter);   // Resilient fallback for direct sub-routing

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Server Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Kesalahan upload: ${err.message}`
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server Ternakmart.'
  });
});

module.exports = app;
