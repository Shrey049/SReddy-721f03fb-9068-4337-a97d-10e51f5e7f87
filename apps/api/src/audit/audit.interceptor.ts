import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditAction, ResourceType } from './entities/audit-log.entity';

/**
 * AuditInterceptor
 * 
 * This interceptor automatically logs audit entries for task operations.
 * It intercepts POST, PUT, PATCH, DELETE requests to /tasks endpoints
 * and creates audit log entries after successful operations.
 * 
 * Usage: Apply globally in main.ts or on specific controllers/routes
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, ip, body, params } = request;

        // Only audit task-related operations
        if (!url.includes('/tasks')) {
            return next.handle();
        }

        // Determine action based on HTTP method
        let action: AuditAction | null = null;
        switch (method) {
            case 'POST':
                action = AuditAction.CREATE;
                break;
            case 'PUT':
            case 'PATCH':
                action = AuditAction.UPDATE;
                break;
            case 'DELETE':
                action = AuditAction.DELETE;
                break;
            default:
                // GET requests can be logged as READ if needed
                // For now, we skip GET to reduce log volume
                return next.handle();
        }

        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: (response) => {
                    // Log successful operations
                    if (user && action) {
                        const resourceId = params?.id || response?.id || 'unknown';
                        const details = {
                            method,
                            url,
                            body: this.sanitizeBody(body),
                            responseTime: Date.now() - startTime,
                        };

                        this.auditService.log({
                            userId: user.id || user.sub,
                            action,
                            resourceType: ResourceType.TASK,
                            resourceId,
                            details,
                            ipAddress: this.getClientIp(request),
                        }).catch(err => {
                            // Don't fail the request if audit logging fails
                            console.error('Audit logging failed:', err);
                        });
                    }
                },
                error: (error) => {
                    // Optionally log failed operations
                    if (user && action) {
                        const resourceId = params?.id || 'unknown';
                        const details = {
                            method,
                            url,
                            error: error.message,
                            statusCode: error.status || 500,
                        };

                        this.auditService.log({
                            userId: user.id || user.sub,
                            action,
                            resourceType: ResourceType.TASK,
                            resourceId,
                            details,
                            ipAddress: this.getClientIp(request),
                        }).catch(err => {
                            console.error('Audit logging failed:', err);
                        });
                    }
                },
            }),
        );
    }

    /**
     * Remove sensitive data from request body before logging
     */
    private sanitizeBody(body: any): any {
        if (!body) return null;

        const sanitized = { ...body };
        // Remove sensitive fields
        delete sanitized.password;
        delete sanitized.passwordHash;
        delete sanitized.token;
        delete sanitized.accessToken;

        return sanitized;
    }

    /**
     * Extract client IP from request
     */
    private getClientIp(request: any): string {
        return (
            request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.ip ||
            'unknown'
        );
    }
}
