import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../logger/logger';
import { env } from '../../config';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    logger.warn(`Operational error: ${error.message}`, {
      statusCode: error.statusCode,
    });

    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        ...(env.nodeEnv === 'development' && { stack: error.stack }),
      },
    });
    return;
  }

  logger.error('Unexpected error', error);

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
    },
  });
}
