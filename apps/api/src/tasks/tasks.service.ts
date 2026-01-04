import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, Role } from '@turbovets-workspace/data';
import { AuthenticatedUser } from '@turbovets-workspace/auth';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    /**
     * Helper: Get user's role in a specific organization
     */
    private getUserOrgRole(user: AuthenticatedUser, orgId: string): string | null {
        const membership = user.organizations?.find(o => o.organizationId === orgId);
        return membership ? membership.role : null;
    }

    /**
     * Helper: Check if user is owner or admin in a specific organization
     */
    private canManageTasksInOrg(user: AuthenticatedUser, orgId: string): boolean {
        const role = this.getUserOrgRole(user, orgId);
        return role === 'owner' || role === 'admin';
    }

    /**
     * Helper: Get user's org IDs
     */
    private getUserOrgIds(user: AuthenticatedUser): string[] {
        return user.organizations?.map(o => o.organizationId) || [];
    }

    async create(createTaskDto: CreateTaskDto, user: AuthenticatedUser) {
        // User must specify an organization they are a member of (owner or admin)
        const orgId = createTaskDto.organizationId;
        if (!orgId) {
            throw new BadRequestException('organizationId is required');
        }

        // Super admin can create in any org, others must be owner/admin of the org
        if (user.role !== Role.SUPER_ADMIN && !this.canManageTasksInOrg(user, orgId)) {
            throw new ForbiddenException('You can only create tasks in organizations where you are an owner or admin');
        }

        const task = this.tasksRepository.create({
            ...createTaskDto,
            organizationId: orgId,
            createdById: user.id
        });
        return this.tasksRepository.save(task);
    }

    async findAll(user: AuthenticatedUser, query: TaskQueryDto) {
        const qb = this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.assignedTo', 'assignedTo')
            .leftJoinAndSelect('task.createdBy', 'createdBy');

        // Role-based scoping
        if (user.role === Role.SUPER_ADMIN) {
            // Super admin sees all tasks
        } else {
            // Get user's org memberships
            const userOrgIds = this.getUserOrgIds(user);

            if (userOrgIds.length === 0) {
                // User has no orgs, only show their assigned tasks
                qb.where('task.assignedToId = :userId', { userId: user.id });
            } else {
                // Check if user is viewer in all their orgs
                const isViewerOnly = user.organizations?.every(o => o.role === 'viewer') || false;

                if (isViewerOnly) {
                    // Viewers see only tasks assigned to them in their orgs
                    qb.where('task.organizationId IN (:...orgIds)', { orgIds: userOrgIds })
                        .andWhere('task.assignedToId = :userId', { userId: user.id });
                } else {
                    // Owner/Admin see all tasks in their orgs
                    qb.where('task.organizationId IN (:...orgIds)', { orgIds: userOrgIds });
                }
            }
        }

        // Filters
        if (query.status) {
            qb.andWhere('task.status = :status', { status: query.status });
        }
        if (query.priority) {
            qb.andWhere('task.priority = :priority', { priority: query.priority });
        }
        if (query.assignedToId) {
            qb.andWhere('task.assignedToId = :assignedToId', { assignedToId: query.assignedToId });
        }
        if (query.organizationId) {
            qb.andWhere('task.organizationId = :organizationId', { organizationId: query.organizationId });
        }

        // Search
        if (query.search) {
            qb.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', { search: `%${query.search}%` });
        }

        // Sorting
        const sortField = query.sort || 'createdAt';
        const sortOrder = query.order || 'DESC';
        qb.orderBy(`task.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

        // Pagination
        const page = query.page || 1;
        const limit = query.pageSize || 20;
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }

    async findOne(id: string, user: AuthenticatedUser) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['assignedTo', 'createdBy']
        });

        if (!task) {
            throw new NotFoundException(`Task #${id} not found`);
        }

        // Permission check
        if (user.role === Role.SUPER_ADMIN) {
            return task;
        }

        // Check if user is a member of the task's org
        const userOrgRole = this.getUserOrgRole(user, task.organizationId);

        if (!userOrgRole) {
            // Not a member of this org
            throw new ForbiddenException('You do not have access to this task');
        }

        if (userOrgRole === 'viewer') {
            // Viewers can only see tasks assigned to them
            if (task.assignedToId !== user.id) {
                throw new ForbiddenException('You can only view tasks assigned to you');
            }
        }

        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto, user: AuthenticatedUser) {
        const task = await this.findOne(id, user); // Will check read access

        // Check write permissions
        if (user.role !== Role.SUPER_ADMIN) {
            const userOrgRole = this.getUserOrgRole(user, task.organizationId);

            // Viewers can only update status
            if (userOrgRole === 'viewer') {
                const allowedKeys = ['status'];
                const keys = Object.keys(updateTaskDto);
                const hasForbiddenUpdates = keys.some(k => !allowedKeys.includes(k));
                if (hasForbiddenUpdates) {
                    throw new ForbiddenException('Viewers can only update status');
                }
            }
        }

        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }

    async updateStatus(id: string, status: TaskStatus, user: AuthenticatedUser) {
        const task = await this.findOne(id, user);
        task.status = status;
        return this.tasksRepository.save(task);
    }

    async remove(id: string, user: AuthenticatedUser) {
        const task = await this.findOne(id, user);

        // Check delete permissions
        if (user.role !== Role.SUPER_ADMIN) {
            const userOrgRole = this.getUserOrgRole(user, task.organizationId);
            if (userOrgRole === 'viewer') {
                throw new ForbiddenException('Viewers cannot delete tasks');
            }
        }

        return this.tasksRepository.remove(task);
    }
}
