import { Request, Response, NextFunction } from 'express';
import { db, Role } from '@saas/database';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const requireTenant = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User authentication required');
    }

    const tenantIdHeader = req.headers['x-tenant-id'] as string;
    const tenantSlugHeader = req.headers['x-tenant-slug'] as string;
    const tenantIdQuery = req.query.tenantId as string;

    const targetTenantIdentifier = tenantIdHeader || tenantSlugHeader || tenantIdQuery;

    if (!targetTenantIdentifier) {
      throw new ForbiddenError('Tenant context header (x-tenant-id or x-tenant-slug) is required');
    }

    // Resolve tenant & user membership
    const membership = await db.membership.findFirst({
      where: {
        userId: req.user.userId,
        tenant: {
          OR: [{ id: targetTenantIdentifier }, { slug: targetTenantIdentifier }],
        },
      },
      include: {
        tenant: true,
      },
    });

    if (!membership) {
      throw new ForbiddenError('User is not a member of the specified organization');
    }

    req.tenantId = membership.tenantId;
    req.tenantRole = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.tenantRole) {
      return next(new ForbiddenError('Tenant membership role context missing'));
    }

    if (!allowedRoles.includes(req.tenantRole)) {
      return next(
        new ForbiddenError(
          `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.tenantRole}`
        )
      );
    }

    next();
  };
};
