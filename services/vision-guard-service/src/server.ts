import { app } from './app';
import { visionConfig } from './config/vision.config';
import { visionGuardService } from './services/vision-guard.service';
import { createLogger } from '@sentinel-ai/logger';

const logger = createLogger('vision-guard-service');
let server: any = null;

async function bootstrap() {
  try {
    await visionGuardService.start();

    server = app.listen(visionConfig.port, () => {
      logger.info(`Vision Guard AI Service Foundation running on port ${visionConfig.port} [env=${visionConfig.environment}]`);
    });
  } catch (err: any) {
    logger.error(`Fatal startup error in Vision Guard Service: ${err.message || err}`);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down Vision Guard Service gracefully...`);
  if (server) {
    server.close(async () => {
      await visionGuardService.stop();
      logger.info('Vision Guard Service stopped gracefully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Exception & Signal Traps
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection at Vision Guard Service: ${reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception at Vision Guard Service: ${err.message || err}`);
  process.exit(1);
});

if (require.main === module) {
  bootstrap();
}
