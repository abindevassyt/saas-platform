import { Request, Response, NextFunction } from 'express';
import { tenantService } from '../services/tenant.service';
import { inviteMemberSchema, updateRoleSchema } from '../validators/tenant.validator';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class TenantController {
  async getUserTenants(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) throw new UnauthorizedError();
      const memberships = await tenantService.getUserTenants(req.user.userId);

      const tenants = memberships.map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        slug: m.tenant.slug,
        role: m.role,
        createdAt: m.tenant.createdAt,
      }));

      res.json({ data: tenants });
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const members = await tenantService.getMembers(req.tenantId);
      res.json({ data: members });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const parsed = inviteMemberSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError('Validation failed', parsed.error.format());

      const membership = await tenantService.inviteMember(req.tenantId, parsed.data.email, parsed.data.role);

      res.status(201).json({
        message: 'Member invited successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const { memberUserId } = req.params;
      const parsed = updateRoleSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError('Validation failed', parsed.error.format());

      const updated = await tenantService.updateMemberRole(req.tenantId, memberUserId, parsed.data.role);
      res.json({ message: 'Role updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const { memberUserId } = req.params;
      await tenantService.removeMember(req.tenantId, memberUserId);
      res.json({ message: 'Member removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const tenantController = new TenantController();
