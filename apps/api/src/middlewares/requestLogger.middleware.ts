import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';
import { httpRequestDurationMicroseconds, httpRequestsTotal } from '../utils/metrics';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-request-id'] as string) || randomUUID();
  req.headers['x-request-id'] = correlationId;
  res.setHeader('x-request-id', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      duration
    );

    logger.info(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration.toFixed(3)}s`, {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });

  next();
};
