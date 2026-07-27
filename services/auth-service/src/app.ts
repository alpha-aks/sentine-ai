import express, { Express, Request, Response } from 'express';
import { AuthController } from './controllers/AuthController';
import { errorHandler } from './middleware/error-middleware';
import { createAuthRouter } from './routes/auth-routes';

export function createApp(authController?: AuthController): Express {
  const app: Express = express();

  // Security & CORS Headers Middleware (Must be before body parsers)
  app.use((req: Request, res: Response, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-institution-id, x-request-id, X-Requested-With');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Basic body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'sentinel-ai-auth-service',
      timestamp: new Date().toISOString()
    });
  });

  // Mount Auth Router under /v1/auth and /auth
  const router = createAuthRouter(authController);
  app.use('/v1/auth', router);
  app.use('/auth', router);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
