import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';
import { TooManyRequestsError } from '../utils/errors';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowSeconds?: number;
  maxRequests?: number;
}

export const rateLimiter = (options: RateLimitOptions = {}) => {
  const windowSeconds = options.windowSeconds || 60;
  const maxRequests = options.maxRequests || 100;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.user?.userId || req.ip || 'anonymous';
      const key = `ratelimit:${identifier}:${req.path}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      const ttl = await redis.ttl(key);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

      if (current > maxRequests) {
        logger.warn(`Rate limit exceeded for identifier: ${identifier} on path: ${req.path}`);
        throw new TooManyRequestsError(`Rate limit exceeded (${maxRequests} req / ${windowSeconds}s).`);
      }

      next();
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        return next(error);
      }
      // If redis is down, fallback grace to avoid breaking API calls
      logger.error('Rate limiter Redis error, failing open:', error);
      next();
    }
  };
};
