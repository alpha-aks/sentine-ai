import { Logger } from '@sentinel-ai/logger';
import { createApp } from './app';
import { getSubmissionServiceConfig } from './config/submission-config';

const logger = new Logger({ serviceName: 'submission-service' });
const config = getSubmissionServiceConfig();
const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Submission Service running on port ${config.port} [env=${process.env.NODE_ENV || 'development'}]`);
});

const handleShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down Submission Service...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
