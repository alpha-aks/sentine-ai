import { Logger } from '@sentinel-ai/logger';
import { createApp } from './app';
import { getUserServiceConfig } from './config/user-config';

const logger = new Logger({ serviceName: 'user-service' });
const config = getUserServiceConfig();
const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`User Service running on port ${config.port} [env=${process.env.NODE_ENV || 'development'}]`);
});

const handleShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down User Service...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
