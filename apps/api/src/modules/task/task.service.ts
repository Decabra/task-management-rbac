import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Task } from '../../database/entities/task/task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
} from './task.dto';
import { PermissionsService } from '../permission/permission.service';
import { TaskStatus } from '@libs/data';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly permissionsService: PermissionsService
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // If orgId is not provided, get the user's first accessible organization
    let orgId = createTaskDto.orgId;
    if (!orgId) {
      const accessibleOrgIds = await this.permissionsService.getUserOrganizations(userId);
      if (accessibleOrgIds.length === 0) {
        throw new ForbiddenException('User has no accessible organizations');
      }
      orgId = accessibleOrgIds[0]; // Use the first accessible organization
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      orgId,
      ownerUserId: userId,
      status: createTaskDto.status || TaskStatus.TODO,
      orderIndex: createTaskDto.orderIndex || 0,
      description: createTaskDto.description || '',
    });

    return this.taskRepository.save(task);
  }

  async findAll(filterDto: TaskFilterDto, userId: string) {
    const {
      orgId,
      orgIds,
      status,
      category,
      categories,
      q,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      limit = 5,
      offset = 0,
    } = filterDto;

    // Get all organizations user has access to
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(
      userId
    );

    if (accessibleOrgIds.length === 0) {
      return { tasks: [], total: 0 };
    }

    // Determine which organizations to filter by
    let filterOrgIds = accessibleOrgIds;
    if (orgIds && orgIds.length > 0) {
      // Filter to only include accessible organizations
      filterOrgIds = orgIds.filter(id => accessibleOrgIds.includes(id));
    } else if (orgId) {
      // Single organization filter
      filterOrgIds = accessibleOrgIds.includes(orgId) ? [orgId] : [];
    }

    if (filterOrgIds.length === 0) {
      return { tasks: [], total: 0 };
    }

    // Build query
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.owner', 'owner')
      .leftJoinAndSelect('task.organization', 'organization')
      .where('task.orgId IN (:...orgIds)', { orgIds: filterOrgIds });

    // Apply filters

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (categories && categories.length > 0) {
      queryBuilder.andWhere('task.category IN (:...categories)', { categories });
    } else if (category) {
      queryBuilder.andWhere('task.category = :category', { category });
    }

    if (q) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${q}%` }
      );
    }

    // Apply sorting - always sort by orderIndex first, then by the specified field
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'orderIndex'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    // Primary sort: orderIndex ASC (lowest values first)
    queryBuilder.orderBy('task.orderIndex', 'ASC');
    // Secondary sort: specified field
    if (sortField !== 'orderIndex') {
      queryBuilder.addOrderBy(`task.${sortField}`, sortOrder);
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      tasks,
      total,
      limit,
      offset,
      hasMore: offset + tasks.length < total,
    };
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['owner', 'organization'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has access to this task's organization
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(
      userId
    );

    if (!accessibleOrgIds.includes(task.orgId)) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Update fields
    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
  }

  async getCategories(userId: string): Promise<string[]> {
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(
      userId
    );

    if (accessibleOrgIds.length === 0) {
      return [];
    }

    const result = await this.taskRepository
      .createQueryBuilder('task')
      .select('DISTINCT task.category', 'category')
      .where('task.orgId IN (:...orgIds)', { orgIds: accessibleOrgIds })
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  async getTasksByStatus(filterDto: TaskFilterDto, userId: string) {
    const {
      status,
      orgId,
      orgIds,
      category,
      categories,
      q,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      limit = 5,
      offset = 0,
    } = filterDto;

    // Get all organizations user has access to
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(
      userId
    );

    if (accessibleOrgIds.length === 0) {
      return status ? { tasks: [], total: 0, hasMore: false } : {
        TODO: { tasks: [], total: 0, hasMore: false },
        IN_PROGRESS: { tasks: [], total: 0, hasMore: false },
        DONE: { tasks: [], total: 0, hasMore: false }
      };
    }

    // Determine which organizations to filter by
    let filterOrgIds = accessibleOrgIds;
    if (orgIds && orgIds.length > 0) {
      // Filter to only include accessible organizations
      filterOrgIds = orgIds.filter(id => accessibleOrgIds.includes(id));
    } else if (orgId) {
      // Single organization filter
      filterOrgIds = accessibleOrgIds.includes(orgId) ? [orgId] : [];
    }

    if (filterOrgIds.length === 0) {
      return status ? { tasks: [], total: 0, hasMore: false } : {
        TODO: { tasks: [], total: 0, hasMore: false },
        IN_PROGRESS: { tasks: [], total: 0, hasMore: false },
        DONE: { tasks: [], total: 0, hasMore: false }
      };
    }

    // If specific status requested, return only that status
    if (status) {
      return this.getTasksForStatus(status, {
        orgId,
        category,
        q,
        sortBy,
        sortOrder,
        limit,
        offset,
      }, filterOrgIds);
    }

    // If no status specified, return 5 tasks for each status
    // For initial load, use offset 0 for all statuses
    const [todoResult, inProgressResult, doneResult] = await Promise.all([
      this.getTasksForStatus('TODO', { orgId, category, categories, q, sortBy, sortOrder, limit, offset: 0 }, filterOrgIds),
      this.getTasksForStatus('IN_PROGRESS', { orgId, category, categories, q, sortBy, sortOrder, limit, offset: 0 }, filterOrgIds),
      this.getTasksForStatus('DONE', { orgId, category, categories, q, sortBy, sortOrder, limit, offset: 0 }, filterOrgIds),
    ]);

    return {
      TODO: todoResult,
      IN_PROGRESS: inProgressResult,
      DONE: doneResult,
    };
  }

  /**
   * Get tasks with search functionality - returns total counts and searched tasks
   * This method is used when searching to get actual totals and filtered results
   */
  async getTasksWithSearch(filterDto: TaskFilterDto, userId: string) {
    const {
      orgId,
      orgIds,
      category,
      categories,
      q,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      limit = 5,
      offset = 0,
    } = filterDto;

    // Get all organizations user has access to
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(
      userId
    );

    if (accessibleOrgIds.length === 0) {
      return {
        TODO: { tasks: [], total: 0, hasMore: false },
        IN_PROGRESS: { tasks: [], total: 0, hasMore: false },
        DONE: { tasks: [], total: 0, hasMore: false }
      };
    }

    // Determine which organizations to filter by
    let filterOrgIds = accessibleOrgIds;
    if (orgIds && orgIds.length > 0) {
      // Filter to only include accessible organizations
      filterOrgIds = orgIds.filter(id => accessibleOrgIds.includes(id));
    } else if (orgId) {
      // Single organization filter
      filterOrgIds = accessibleOrgIds.includes(orgId) ? [orgId] : [];
    }

    if (filterOrgIds.length === 0) {
      return {
        TODO: { tasks: [], total: 0, hasMore: false },
        IN_PROGRESS: { tasks: [], total: 0, hasMore: false },
        DONE: { tasks: [], total: 0, hasMore: false }
      };
    }

    // Get total counts for each status (without search filters)
    const [todoTotal, inProgressTotal, doneTotal] = await Promise.all([
      this.getTotalCountForStatus('TODO', { orgId, category, categories }, filterOrgIds),
      this.getTotalCountForStatus('IN_PROGRESS', { orgId, category, categories }, filterOrgIds),
      this.getTotalCountForStatus('DONE', { orgId, category, categories }, filterOrgIds),
    ]);

    // Get searched tasks for each status (with search filters)
    const [todoResult, inProgressResult, doneResult] = await Promise.all([
      this.getTasksForStatus('TODO', { orgId, category, categories, q, sortBy, sortOrder, limit, offset: 0 }, filterOrgIds),
      this.getTasksForStatus('IN_PROGRESS', { orgId, category, categories, q, sortBy, sortOrder, limit, offset: 0 }, filterOrgIds),
      this.getTasksForStatus('DONE', { orgId, category, categories, q, sortBy, sortOrder, limit, offset: 0 }, filterOrgIds),
    ]);

    return {
      TODO: { ...todoResult, total: todoTotal },
      IN_PROGRESS: { ...inProgressResult, total: inProgressTotal },
      DONE: { ...doneResult, total: doneTotal },
    };
  }

  private async getTasksForStatus(
    status: string,
    filters: any,
    accessibleOrgIds: string[]
  ) {
    const { orgId, category, categories, q, sortBy, sortOrder, limit, offset } = filters;

    // Build query
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.owner', 'owner')
      .leftJoinAndSelect('task.organization', 'organization')
      .where('task.orgId IN (:...orgIds)', { orgIds: accessibleOrgIds })
      .andWhere('task.status = :status', { status });

    // Note: orgId filter is already handled by accessibleOrgIds parameter
    // No need to apply additional orgId filter here

    if (categories && categories.length > 0) {
      queryBuilder.andWhere('task.category IN (:...categories)', { categories });
    } else if (category) {
      queryBuilder.andWhere('task.category = :category', { category });
    }

    if (q) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${q}%` }
      );
    }

    // Apply sorting - always sort by orderIndex first, then by the specified field
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'orderIndex'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    // Primary sort: orderIndex ASC (lowest values first)
    queryBuilder.orderBy('task.orderIndex', 'ASC');
    // Secondary sort: specified field
    if (sortField !== 'orderIndex') {
      queryBuilder.addOrderBy(`task.${sortField}`, sortOrder);
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      tasks,
      total,
      limit,
      offset,
      hasMore: offset + tasks.length < total,
    };
  }

  /**
   * Get total count for a specific status without search filters
   */
  private async getTotalCountForStatus(
    status: string,
    filters: any,
    accessibleOrgIds: string[]
  ): Promise<number> {
    const { category, categories } = filters;

    // Build query for count only
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.orgId IN (:...orgIds)', { orgIds: accessibleOrgIds })
      .andWhere('task.status = :status', { status });

    // Note: orgId filter is already handled by accessibleOrgIds parameter
    // No need to apply additional orgId filter here

    if (categories && categories.length > 0) {
      queryBuilder.andWhere('task.category IN (:...categories)', { categories });
    } else if (category) {
      queryBuilder.andWhere('task.category = :category', { category });
    }

    // Get count
    return await queryBuilder.getCount();
  }

  /**
   * Get total counts for all statuses without any filters
   * This is used for stats display to show actual database totals
   */
  async getTotalCounts(userId: string): Promise<{
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    TOTAL: number;
  }> {
    // Get all organizations user has access to
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(
      userId
    );

    if (accessibleOrgIds.length === 0) {
      return {
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
        TOTAL: 0
      };
    }

    // Get counts for each status without any filters
    const [todoCount, inProgressCount, doneCount] = await Promise.all([
      this.taskRepository.count({
        where: {
          orgId: In(accessibleOrgIds),
          status: TaskStatus.TODO
        }
      }),
      this.taskRepository.count({
        where: {
          orgId: In(accessibleOrgIds),
          status: TaskStatus.IN_PROGRESS
        }
      }),
      this.taskRepository.count({
        where: {
          orgId: In(accessibleOrgIds),
          status: TaskStatus.DONE
        }
      })
    ]);

    return {
      TODO: todoCount,
      IN_PROGRESS: inProgressCount,
      DONE: doneCount,
      TOTAL: todoCount + inProgressCount + doneCount
    };
  }

  async updateTaskOrder(
    taskId: string,
    newOrderIndex: number,
    newStatus: TaskStatus,
    userId: string
  ): Promise<Task> {
    // Get user's accessible organizations
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(userId);
    if (accessibleOrgIds.length === 0) {
      throw new ForbiddenException('User has no accessible organizations');
    }

    // Find the task
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        orgId: In(accessibleOrgIds)
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Get all tasks in the target status to recalculate order indices
    const tasksInStatus = await this.taskRepository.find({
      where: {
        orgId: In(accessibleOrgIds),
        status: newStatus
      },
      order: {
        orderIndex: 'ASC'
      }
    });

    // Remove the moved task from the list if it's in the same status
    const filteredTasks = tasksInStatus.filter(t => t.id !== taskId);

    // Insert the task at the new position
    filteredTasks.splice(newOrderIndex, 0, task);

    // Update order indices for all tasks in the status
    const updatePromises = filteredTasks.map((t, index) => {
      return this.taskRepository.update(t.id, {
        orderIndex: index,
        status: newStatus
      });
    });

    await Promise.all(updatePromises);

    // Return the updated task
    return this.taskRepository.findOne({
      where: { id: taskId }
    });
  }
}
