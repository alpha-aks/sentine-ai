import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import foundationRouter from './routes/vision-foundation.routes';
import visionRouter from './routes/vision.routes';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { errorMiddleware } from './middleware/error.middleware';

export const app = express();

// Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// CORS & Body Parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Tracing Middleware
app.use(requestIdMiddleware);

// Routes
app.use('/', foundationRouter);
app.use('/', visionRouter);

// Error Middleware
app.use(errorMiddleware);
