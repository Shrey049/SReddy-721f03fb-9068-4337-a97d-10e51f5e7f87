import { Controller, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuditService, AuditLogQueryDto } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser, AuthenticatedUser } from '@turbovets-workspace/auth';
import { Role } from '@turbovets-workspace/data';
import { AuditAction, ResourceType } from './entities/audit-log.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-log')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    /**
     * GET /audit-log
     * 
     * Query Parameters:
     * - page: number (default: 1)
     * - pageSize: number (default: 20, max: 100)
     * - action: 'create' | 'read' | 'update' | 'delete' | 'login'
     * - resourceType: 'task' | 'user' | 'organization'
     * - userId: string (UUID of user who performed the action)
     * - startDate: string (ISO date string)
     * - endDate: string (ISO date string)
     * 
     * Access Control:
     * - Super Admin: All logs
     * - Owner: All logs
     * - Admin: Logs for their organization only
     * - Viewer: No access (403 Forbidden)
     */
    @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN)
    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Query('action') action?: string,
        @Query('resourceType') resourceType?: string,
        @Query('userId') userId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @CurrentUser() user?: AuthenticatedUser,
    ) {
        // Validate and sanitize query params
        const query: AuditLogQueryDto = {
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? Math.min(parseInt(pageSize, 10), 100) : 20,
            action: action as AuditAction,
            resourceType: resourceType as ResourceType,
            userId,
            startDate,
            endDate,
        };

        return this.auditService.findAll(user, query);
    }
}
