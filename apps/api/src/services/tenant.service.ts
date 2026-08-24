import { tenantRepository } from '../repositories/tenant.repository';
import { userRepository } from '../repositories/user.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import { Role } from '@saas/database';

export class TenantService {
  async getTenant(tenantId: string) {
    const tenant = await tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Organization not found');
    }
    return tenant;
  }

  async getUserTenants(userId: string) {
    return tenantRepository.getUserTenants(userId);
  }

  async getMembers(tenantId: string) {
    return tenantRepository.getMembers(tenantId);
  }

  async inviteMember(tenantId: string, email: string, role: Role) {
    let user = await userRepository.findByEmail(email);

    if (!user) {
      // Create user placeholder for invitation
      user = await userRepository.create({
        email,
        name: email.split('@')[0],
        emailVerified: false,
      });
    }

    try {
      const membership = await tenantRepository.addMember(tenantId, user.id, role);
      return membership;
    } catch {
      throw new ConflictError('User is already a member of this organization');
    }
  }

  async updateMemberRole(tenantId: string, userId: string, role: Role) {
    return tenantRepository.updateMemberRole(tenantId, userId, role);
  }

  async removeMember(tenantId: string, userId: string) {
    return tenantRepository.removeMember(tenantId, userId);
  }
}

export const tenantService = new TenantService();
