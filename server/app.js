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
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');
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
apiRouter.use('/stores', storeRoutes);
apiRouter.use('/animals', animalRoutes);
apiRouter.use('/carts', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/courier', courierRoutes);
apiRouter.use('/chats', chatRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/vouchers', voucherRoutes);
apiRouter.use('/settings', settingRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/badges', badgeRoutes);
apiRouter.use('/shipping-settings', shippingSettingRoutes);
apiRouter.use('/hero-banners', heroBannerRoutes);

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
