import { Request, Response, NextFunction } from 'express';
import { resourceService } from '../services/resource.service';
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  paginationQuerySchema,
} from '../validators/resource.validator';
import { BadRequestError } from '../utils/errors';

export class ResourceController {
  async listProjects(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const query = paginationQuerySchema.parse(req.query);

      const result = await resourceService.listProjects(req.tenantId, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const { id } = req.params;

      const project = await resourceService.getProject(req.tenantId, id);
      res.json({ data: project });
    } catch (error) {
      next(error);
    }
  }

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError('Validation failed', parsed.error.format());

      const project = await resourceService.createProject(req.tenantId, parsed.data.name, parsed.data.description);
      res.status(201).json({ message: 'Project created successfully', data: project });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const { id } = req.params;
      const parsed = updateProjectSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError('Validation failed', parsed.error.format());

      const project = await resourceService.updateProject(req.tenantId, id, parsed.data);
      res.json({ message: 'Project updated successfully', data: project });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const { id } = req.params;

      await resourceService.deleteProject(req.tenantId, id);
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) throw new BadRequestError('Tenant context required');
      const { id: projectId } = req.params;
      const parsed = createTaskSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError('Validation failed', parsed.error.format());

      const task = await resourceService.createTask(req.tenantId, projectId, parsed.data.title, parsed.data.description);
      res.status(201).json({ message: 'Task created successfully', data: task });
    } catch (error) {
      next(error);
    }
  }
}

export const resourceController = new ResourceController();
