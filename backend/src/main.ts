import { createApp } from './app';
import { env } from './config';
import { logger } from './shared/logger/logger';
import { getRedis, disconnectRedis } from './shared/redis/redis.client';
import { disconnectKafka } from './shared/kafka/kafka.client';
import { disconnectDatabase, initializeDatabase } from './shared/database/typeorm';

async function main(): Promise<void> {
  const app = createApp();

  // Initialize database
  try {
    await initializeDatabase();
  } catch (error) {
    logger.error('Database connection failed', error as Error);
    process.exit(1);
  }

  // Initialize Redis connection
  try {
    getRedis();
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache');
  }

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    logger.info(`Health check: http://localhost:${env.port}/health`);
    logger.info(`API: http://localhost:${env.port}/api/v1`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      await Promise.allSettled([disconnectRedis(), disconnectKafka(), disconnectDatabase()]);

      logger.info('All connections closed. Goodbye.');
      process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Failed to start server', error as Error);
  process.exit(1);
});
