// Vercel Serverless Function Bridge
let app;
let initError = null;

try {
  app = require('../server/app');
} catch (err) {
  initError = err;
  console.error('❌ [Vercel Function Init Error]:', err);
}

module.exports = (req, res) => {
  // Safe CORS preflight fallback
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (initError || !app) {
    try {
      app = require('../server/app');
      initError = null;
    } catch (retryErr) {
      console.error('❌ [Vercel Serverless Fatal Init Error]:', retryErr);
      return res.status(500).json({
        success: false,
        error: 'SERVERLESS_INITIALIZATION_ERROR',
        message: retryErr.message,
        details: 'Serverless initialization failed while loading application dependencies.'
      });
    }
  }

  try {
    return app(req, res);
  } catch (handlerErr) {
    console.error('❌ [Vercel Request Handler Error]:', handlerErr);
    return res.status(500).json({
      success: false,
      error: 'SERVERLESS_REQUEST_ERROR',
      message: handlerErr.message
    });
  }
};
