import { db, Project, Task, Prisma } from '@saas/database';

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ResourceRepository {
  // Tenant-scoped Project queries
  async findProjects(tenantId: string, options: PaginationOptions) {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      db.project.count({ where }),
      db.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findProjectById(tenantId: string, id: string): Promise<Project | null> {
    return db.project.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { tasks: true },
    });
  }

  async createProject(tenantId: string, name: string, description?: string): Promise<Project> {
    return db.project.create({
      data: { tenantId, name, description },
    });
  }

  async updateProject(tenantId: string, id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return db.project.update({
      where: { id },
      data,
    });
  }

  async softDeleteProject(tenantId: string, id: string): Promise<Project> {
    return db.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Tenant-scoped Task queries
  async createTask(projectId: string, data: Prisma.TaskCreateWithoutProjectInput): Promise<Task> {
    return db.task.create({
      data: { ...data, projectId },
    });
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return db.task.update({
      where: { id },
      data,
    });
  }

  async deleteTask(id: string): Promise<Task> {
    return db.task.delete({
      where: { id },
    });
  }
}

export const resourceRepository = new ResourceRepository();
