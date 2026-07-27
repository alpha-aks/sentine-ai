import { Logger } from '@sentinel-ai/logger';
import { createApp } from './app';
import { getSessionServiceConfig } from './config/session-config';

const logger = new Logger({ serviceName: 'candidate-session-service' });
const config = getSessionServiceConfig();
const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Candidate Session Service running on port ${config.port} [env=${process.env.NODE_ENV || 'development'}]`);
});

const handleShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down Candidate Session Service...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
