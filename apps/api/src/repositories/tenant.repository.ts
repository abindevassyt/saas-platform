import { db, Tenant, Membership, Role } from '@saas/database';

export class TenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    return db.tenant.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return db.tenant.findUnique({
      where: { slug, deletedAt: null },
    });
  }

  async createTenantWithOwner(name: string, slug: string, ownerUserId: string): Promise<Tenant> {
    return db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name, slug },
      });

      await tx.membership.create({
        data: {
          tenantId: tenant.id,
          userId: ownerUserId,
          role: Role.OWNER,
        },
      });

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          status: 'TRIALING',
        },
      });

      return tenant;
    });
  }

  async getUserTenants(userId: string) {
    return db.membership.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
    });
  }

  async getMembers(tenantId: string) {
    return db.membership.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async addMember(tenantId: string, userId: string, role: Role): Promise<Membership> {
    return db.membership.create({
      data: { tenantId, userId, role },
    });
  }

  async updateMemberRole(tenantId: string, userId: string, role: Role): Promise<Membership> {
    return db.membership.update({
      where: {
        tenantId_userId: { tenantId, userId },
      },
      data: { role },
    });
  }

  async removeMember(tenantId: string, userId: string): Promise<Membership> {
    return db.membership.delete({
      where: {
        tenantId_userId: { tenantId, userId },
      },
    });
  }
}

export const tenantRepository = new TenantRepository();
