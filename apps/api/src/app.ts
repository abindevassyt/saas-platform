import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { authenticate } from './middlewares/auth.middleware';
import { requireTenant, requireRole } from './middlewares/rbac.middleware';
import { rateLimiter } from './middlewares/rateLimiter.middleware';

import { authController } from './controllers/auth.controller';
import { tenantController } from './controllers/tenant.controller';
import { resourceController } from './controllers/resource.controller';
import { metricsRegistry } from './utils/metrics';
import { Role } from '@saas/database';

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: [env.WEB_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant-slug', 'x-request-id'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(requestLogger);

// Health Probes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  res.json({ status: 'ready', uptime: process.uptime() });
});

// Prometheus Metrics Endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
});

// Public API v1 Auth Routes
const authRouter = express.Router();
authRouter.post('/register', rateLimiter({ maxRequests: 10 }), (req: Request, res: Response, next: NextFunction) =>
  authController.register(req, res, next)
);
authRouter.post('/login', rateLimiter({ maxRequests: 20 }), (req: Request, res: Response, next: NextFunction) =>
  authController.login(req, res, next)
);
authRouter.post('/refresh', (req: Request, res: Response, next: NextFunction) => authController.refresh(req, res, next));
authRouter.post('/logout', authenticate, (req: Request, res: Response, next: NextFunction) =>
  authController.logout(req, res, next)
);
authRouter.get('/me', authenticate, (req: Request, res: Response, next: NextFunction) => authController.me(req, res, next));
app.use('/api/v1/auth', authRouter);

// Tenant Management Routes
const tenantRouter = express.Router();
tenantRouter.use(authenticate);
tenantRouter.get('/user-tenants', (req: Request, res: Response, next: NextFunction) =>
  tenantController.getUserTenants(req, res, next)
);

// Tenant-scoped sub-routes
const tenantScopedRouter = express.Router();
tenantScopedRouter.use(requireTenant);
tenantScopedRouter.get('/members', (req: Request, res: Response, next: NextFunction) =>
  tenantController.getMembers(req, res, next)
);
tenantScopedRouter.post(
  '/members/invite',
  requireRole([Role.OWNER, Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => tenantController.inviteMember(req, res, next)
);
tenantScopedRouter.patch(
  '/members/:memberUserId/role',
  requireRole([Role.OWNER]),
  (req: Request, res: Response, next: NextFunction) => tenantController.updateRole(req, res, next)
);
tenantScopedRouter.delete(
  '/members/:memberUserId',
  requireRole([Role.OWNER, Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => tenantController.removeMember(req, res, next)
);

tenantRouter.use('/', tenantScopedRouter);
app.use('/api/v1/tenants', tenantRouter);

// Domain Resources Routes (Projects & Tasks)
const resourceRouter = express.Router();
resourceRouter.use(authenticate);
resourceRouter.use(requireTenant);
resourceRouter.use(rateLimiter({ maxRequests: 200 }));

resourceRouter.get('/projects', (req: Request, res: Response, next: NextFunction) =>
  resourceController.listProjects(req, res, next)
);
resourceRouter.post(
  '/projects',
  requireRole([Role.OWNER, Role.ADMIN, Role.MEMBER]),
  (req: Request, res: Response, next: NextFunction) => resourceController.createProject(req, res, next)
);
resourceRouter.get('/projects/:id', (req: Request, res: Response, next: NextFunction) =>
  resourceController.getProject(req, res, next)
);
resourceRouter.patch(
  '/projects/:id',
  requireRole([Role.OWNER, Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => resourceController.updateProject(req, res, next)
);
resourceRouter.delete(
  '/projects/:id',
  requireRole([Role.OWNER, Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => resourceController.deleteProject(req, res, next)
);
resourceRouter.post(
  '/projects/:id/tasks',
  requireRole([Role.OWNER, Role.ADMIN, Role.MEMBER]),
  (req: Request, res: Response, next: NextFunction) => resourceController.createTask(req, res, next)
);

app.use('/api/v1/resources', resourceRouter);

// Global RFC 7807 Error Handling Middleware
app.use(errorHandler);
