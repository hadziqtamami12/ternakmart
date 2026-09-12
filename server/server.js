// server.js - Standalone Listener for Local Development
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
======================================================
🚀 [Ternakmart Backend Server] Running on port ${PORT}
📦 Environment: ${process.env.NODE_ENV || 'development'}
💾 Database Driver: ${process.env.DB_DRIVER || 'mock'}
☁️  Storage Driver: ${process.env.STORAGE_DRIVER || 'local'}
🌐 API Base: http://localhost:${PORT}/api/v1
======================================================
  `);
});
