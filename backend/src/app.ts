import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './shared/middleware/error.middleware';
import { logger } from './shared/logger/logger';
import { env } from './config';

import { authModule } from './modules/auth/auth.module';
import { subjectModule } from './modules/subject/subject.module';
import { experienceModule } from './modules/experience/experience.module';
import { requestModule } from './modules/request/request.module';
import { dashboardModule } from './modules/dashboard/dashboard.module';

export function createApp(): Express {
  const app = express();

  // CORS — must come before helmet to handle preflight properly
  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { message: 'Too many requests, please try again later' } },
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API v1 routes
  const apiRouter = express.Router();
  apiRouter.use(authModule);
  apiRouter.use(subjectModule);
  apiRouter.use(experienceModule);
  apiRouter.use(requestModule);
  apiRouter.use(dashboardModule);

  app.use('/api/v1', apiRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { message: 'Route not found' } });
  });

  // Error handler
  app.use(errorMiddleware);

  logger.info('Express app initialized');
  return app;
}
