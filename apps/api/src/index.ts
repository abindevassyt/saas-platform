import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { redis } from './utils/redis';
import { setupWebsocketServer } from './websocket/server';
import { db } from '@saas/database';

const server = http.createServer(app);
setupWebsocketServer(server);

server.listen(env.PORT, () => {
  logger.info(`🚀 SaaS API Server running on ${env.API_URL} [Env: ${env.NODE_ENV}]`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down server gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await redis.quit();
      logger.info('Redis connection closed.');

      await db.$disconnect();
      logger.info('Database connection closed.');

      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  });

  // Force exit after 10s if shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
