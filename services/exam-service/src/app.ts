import express, { Express, Request, Response } from 'express';
import { ExamController } from './controllers/ExamController';
import { errorHandler } from './middleware/error-middleware';
import { createExamRouter } from './routes/exam-routes';

export function createApp(controller?: ExamController): Express {
  const app: Express = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Security & CORS Headers
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

  // Healthcheck
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'sentinel-ai-exam-service',
      timestamp: new Date().toISOString()
    });
  });

  // Mount Router under /v1/exams and /exams
  const router = createExamRouter(controller);
  app.use('/v1/exams', router);
  app.use('/exams', router);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
