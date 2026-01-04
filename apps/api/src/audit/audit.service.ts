import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditLog, AuditAction, ResourceType } from './entities/audit-log.entity';
import { AuthenticatedUser } from '@turbovets-workspace/auth';
import { Role } from '@turbovets-workspace/data';

export interface AuditLogQueryDto {
    page?: number;
    pageSize?: number;
    action?: AuditAction;
    resourceType?: ResourceType;
    userId?: string;
    startDate?: string;
    endDate?: string;
}

export interface CreateAuditLogDto {
    userId: string;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId: string;
    details?: any;
    ipAddress?: string;
}

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) { }

    /**
     * Create a new audit log entry
     */
    async log(dto: CreateAuditLogDto): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create(dto);
        return this.auditLogRepository.save(auditLog);
    }

    /**
     * Find all audit logs with filtering and pagination
     * Access Control:
     * - Super Admin / Owner: Can view all logs
     * - Admin: Can view logs for their organization only
     * - Viewer: Cannot access audit logs
     */
    async findAll(user: AuthenticatedUser, query: AuditLogQueryDto) {
        // Check if user is viewer only (no owner/admin roles in any org)
        const hasOwnerOrAdminRole = user.role === Role.SUPER_ADMIN ||
            user.role === Role.OWNER ||
            user.organizations?.some(o => o.role === 'owner' || o.role === 'admin');

        if (!hasOwnerOrAdminRole) {
            throw new ForbiddenException('Viewers cannot access audit logs');
        }

        const qb = this.auditLogRepository.createQueryBuilder('audit')
            .leftJoinAndSelect('audit.user', 'user')
            .select([
                'audit.id',
                'audit.userId',
                'audit.action',
                'audit.resourceType',
                'audit.resourceId',
                'audit.details',
                'audit.ipAddress',
                'audit.createdAt',
                'user.id',
                'user.email',
                'user.firstName',
                'user.lastName',
            ]);

        // Role-based scoping - check if user is org-level admin (not owner or super admin)
        const isOrgAdmin = user.organizations?.some(o => o.role === 'admin') &&
            !user.organizations?.some(o => o.role === 'owner') &&
            user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER;

        if (isOrgAdmin) {
            // Admin can only see logs for users in their organization
            const adminOrgIds = user.organizations?.map(o => o.organizationId) || [];
            if (adminOrgIds.length > 0) {
                qb.innerJoin('user_organizations', 'uo', 'uo.userId = audit.userId')
                    .andWhere('uo.organizationId IN (:...orgIds)', { orgIds: adminOrgIds });
            }
        }
        // Super Admin and Owner can see all logs (no additional filter)

        // Filters
        if (query.action) {
            qb.andWhere('audit.action = :action', { action: query.action });
        }

        if (query.resourceType) {
            qb.andWhere('audit.resourceType = :resourceType', { resourceType: query.resourceType });
        }

        if (query.userId) {
            qb.andWhere('audit.userId = :userId', { userId: query.userId });
        }

        if (query.startDate) {
            qb.andWhere('audit.createdAt >= :startDate', { startDate: new Date(query.startDate) });
        }

        if (query.endDate) {
            qb.andWhere('audit.createdAt <= :endDate', { endDate: new Date(query.endDate) });
        }

        // Sorting - newest first
        qb.orderBy('audit.createdAt', 'DESC');

        // Pagination
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        qb.skip((page - 1) * pageSize).take(pageSize);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            page,
            pageSize,
        };
    }

    /**
     * Get a specific audit log by ID
     */
    async findOne(id: string): Promise<AuditLog | null> {
        return this.auditLogRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }

    /**
     * Helper methods for common audit actions
     */
    async logTaskCreate(userId: string, taskId: string, details?: any, ipAddress?: string) {
        return this.log({
            userId,
            action: AuditAction.CREATE,
            resourceType: ResourceType.TASK,
            resourceId: taskId,
            details,
            ipAddress,
        });
    }

    async logTaskUpdate(userId: string, taskId: string, details?: any, ipAddress?: string) {
        return this.log({
            userId,
            action: AuditAction.UPDATE,
            resourceType: ResourceType.TASK,
            resourceId: taskId,
            details,
            ipAddress,
        });
    }

    async logTaskDelete(userId: string, taskId: string, details?: any, ipAddress?: string) {
        return this.log({
            userId,
            action: AuditAction.DELETE,
            resourceType: ResourceType.TASK,
            resourceId: taskId,
            details,
            ipAddress,
        });
    }

    async logLogin(userId: string, success: boolean, ipAddress?: string) {
        return this.log({
            userId,
            action: AuditAction.LOGIN,
            resourceType: ResourceType.USER,
            resourceId: userId,
            details: { success },
            ipAddress,
        });
    }
}
