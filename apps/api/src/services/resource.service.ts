import { resourceRepository, PaginationOptions } from '../repositories/resource.repository';
import { NotFoundError } from '../utils/errors';
import { redis } from '../utils/redis';

export class ResourceService {
  async listProjects(tenantId: string, options: PaginationOptions) {
    return resourceRepository.findProjects(tenantId, options);
  }

  async getProject(tenantId: string, projectId: string) {
    const project = await resourceRepository.findProjectById(tenantId, projectId);
    if (!project) {
      throw new NotFoundError('Project not found in current organization context');
    }
    return project;
  }

  async createProject(tenantId: string, name: string, description?: string) {
    const project = await resourceRepository.createProject(tenantId, name, description);

    // Publish event for real-time WebSockets
    await redis.publish(
      `tenant:${tenantId}:events`,
      JSON.stringify({
        type: 'PROJECT_CREATED',
        payload: project,
        timestamp: new Date().toISOString(),
      })
    );

    return project;
  }

  async updateProject(tenantId: string, projectId: string, data: { name?: string; description?: string }) {
    await this.getProject(tenantId, projectId);
    const updated = await resourceRepository.updateProject(tenantId, projectId, data);

    await redis.publish(
      `tenant:${tenantId}:events`,
      JSON.stringify({
        type: 'PROJECT_UPDATED',
        payload: updated,
        timestamp: new Date().toISOString(),
      })
    );

    return updated;
  }

  async deleteProject(tenantId: string, projectId: string) {
    await this.getProject(tenantId, projectId);
    const deleted = await resourceRepository.softDeleteProject(tenantId, projectId);

    await redis.publish(
      `tenant:${tenantId}:events`,
      JSON.stringify({
        type: 'PROJECT_DELETED',
        payload: { id: projectId },
        timestamp: new Date().toISOString(),
      })
    );

    return deleted;
  }

  async createTask(tenantId: string, projectId: string, title: string, description?: string) {
    await this.getProject(tenantId, projectId);
    const task = await resourceRepository.createTask(projectId, { title, description });

    await redis.publish(
      `tenant:${tenantId}:events`,
      JSON.stringify({
        type: 'TASK_CREATED',
        payload: task,
        timestamp: new Date().toISOString(),
      })
    );

    return task;
  }
}

export const resourceService = new ResourceService();
