import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, Role } from '@turbovets-workspace/data';
import { AuthenticatedUser } from '@turbovets-workspace/auth';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    async create(createTaskDto: CreateTaskDto, user: AuthenticatedUser) {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            organizationId: user.organizationId,
            createdById: user.id
        });
        return this.tasksRepository.save(task);
    }

    async findAll(user: AuthenticatedUser, query: TaskQueryDto) {
        const qb = this.tasksRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.assignedTo', 'assignedTo')
            .leftJoinAndSelect('task.createdBy', 'createdBy');

        // Role-based scoping (simplified - no hierarchy)
        if (user.role === Role.OWNER || user.role === Role.SUPER_ADMIN) {
            // No org restriction (sees all)
        } else if (user.role === Role.ADMIN) {
            // Admin sees only their org's tasks
            qb.where('task.organizationId = :orgId', { orgId: user.organizationId });
        } else {
            // Viewer: assigned tasks only
            qb.where('task.assignedToId = :userId', { userId: user.id });
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

        // Permission check (simplified - no hierarchy)
        if (user.role === Role.OWNER || user.role === Role.SUPER_ADMIN) {
            return task;
        }
        if (user.role === Role.ADMIN) {
            if (task.organizationId !== user.organizationId) {
                throw new ForbiddenException();
            }
        } else {
            // Viewer: Only assigned
            if (task.assignedToId !== user.id) {
                throw new ForbiddenException();
            }
        }

        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto, user: AuthenticatedUser) {
        const task = await this.findOne(id, user); // Will check read access

        // Write access scenarios:
        // Owner: All
        // Admin: In scope
        // Viewer: Status only? Or should be checked here?
        // Requirement FR-TASK-03: Update Task -> Owner, Admin
        // Requirement FR-TASK-04: Update Status -> Owner, Admin, Viewer

        // If viewer, can only update status
        if (user.role === Role.VIEWER) {
            // Check if updating anything other than status
            const allowedKeys = ['status'];
            const keys = Object.keys(updateTaskDto);
            const hasForbiddenUpdates = keys.some(k => !allowedKeys.includes(k));
            if (hasForbiddenUpdates) {
                throw new ForbiddenException('Viewers can only update status');
            }
        }

        // For Admin: ensure they are not moving task to out-of-scope org (if organizationId is updatable)
        // Assuming organizationId is not updatable or handled carefully.

        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }

    async updateStatus(id: string, status: TaskStatus, user: AuthenticatedUser) {
        // Helper for status-only updates if we had a specific endpoint, but update() covers it.
        const task = await this.findOne(id, user);
        task.status = status;
        return this.tasksRepository.save(task);
    }

    async remove(id: string, user: AuthenticatedUser) {
        const task = await this.findOne(id, user);

        if (user.role === Role.VIEWER) {
            throw new ForbiddenException('Viewers cannot delete tasks');
        }

        return this.tasksRepository.remove(task);
    }
}
