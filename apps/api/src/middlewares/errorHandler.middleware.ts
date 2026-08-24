import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const correlationId = (req.headers['x-request-id'] as string) || 'N/A';

  if (err instanceof ApiError) {
    logger.warn(`API Error [${req.method} ${req.path}] Status: ${err.statusCode} - ${err.message}`, {
      correlationId,
      details: err.details,
    });

    return res.status(err.statusCode).contentType('application/problem+json').json({
      type: err.type,
      title: err.title,
      status: err.statusCode,
      detail: err.message,
      instance: req.originalUrl,
      correlationId,
      errors: err.details || null,
    });
  }

  logger.error(`Unhandled Error [${req.method} ${req.path}]: ${err.message}`, {
    correlationId,
    stack: err.stack,
  });

  return res.status(500).contentType('application/problem+json').json({
    type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected internal error occurred.',
    instance: req.originalUrl,
    correlationId,
  });
};
