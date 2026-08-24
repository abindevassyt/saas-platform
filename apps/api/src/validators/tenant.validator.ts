import { z } from 'zod';
import { Role } from '@saas/database';

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role).default(Role.MEMBER),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});
