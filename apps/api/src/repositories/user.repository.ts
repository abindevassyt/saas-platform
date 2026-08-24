import { db, User, Prisma } from '@saas/database';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return db.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
