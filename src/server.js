const app = require('./app');
const { testConnection } = require('./config/db');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to PostgreSQL
    await testConnection();

    // Connect to Redis (non-blocking — server runs even if Redis is down)
    await connectRedis();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`\n Media Matrix Server running on port ${PORT}`);
      console.log(` API Base URL: http://localhost:${PORT}/api`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error(' Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
