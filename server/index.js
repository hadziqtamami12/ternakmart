/**
 * server/index.js
 * Unified Modular Express & Vercel Serverless Entry Point
 * 
 * Works seamlessly in two environments:
 * 1. Local Development / Traditional VPS: starts app.listen(port)
 * 2. Vercel Serverless Functions: exports handler for edge/serverless execution
 */

const app = require('./app');

const PORT = process.env.PORT || 5000;

// If executed directly (e.g. `node server/index.js` or `npm run start`), listen on port
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
======================================================
🚀 [Ternakmart Backend Server] Running on port ${PORT}
📦 Environment: ${process.env.NODE_ENV || 'development'}
💾 Database Driver: ${process.env.DB_DRIVER || 'supabase'}
☁️  Storage Driver: ${process.env.STORAGE_PROVIDER || 'supabase'}
🌐 API Base: http://localhost:${PORT}/api/v1
======================================================
    `);
  });
}

// Export app for Vercel Serverless Function handler
module.exports = app;
