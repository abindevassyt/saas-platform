import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { tenantRepository } from '../repositories/tenant.repository';
import { redis } from '../utils/redis';
import { env } from '../config/env';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';

export class AuthService {
  async register(data: { email: string; password: string; name: string; organizationName: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('User with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
      emailVerified: true,
    });

    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tenant = await tenantRepository.createTenantWithOwner(data.organizationName, slug, user.id);

    const tokens = this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tenant, tokens };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tenants = await tenantRepository.getUserTenants(user.id);
    const tokens = this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      tenants: tenants.map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        slug: m.tenant.slug,
        role: m.role,
      })),
      tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; email: string };
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('User no longer exists');
      }

      const tokens = this.generateTokens(user.id, user.email);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await redis.del(`refresh_token:${userId}`);
  }

  private generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign({ userId, email }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign({ userId, email }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    // 7 days TTL
    await redis.set(`refresh_token:${userId}`, token, 'EX', 7 * 24 * 60 * 60);
  }
}

export const authService = new AuthService();
