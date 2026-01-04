import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Role } from '@turbovets-workspace/data';

/**
 * PermissionService - Centralized role-based permission checking
 * Use this service to conditionally show/hide UI elements based on user role
 */
@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private currentUser: any = null;

    constructor(private authService: AuthService) {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    get userRole(): Role | null {
        return this.currentUser?.role || null;
    }

    get isAuthenticated(): boolean {
        return !!this.currentUser;
    }

    // ===== TASK PERMISSIONS =====

    canCreateTask(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN]);
    }

    canDeleteTask(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN]);
    }

    canEditTask(): boolean {
        // All authenticated users can edit tasks (including updating status)
        return this.isAuthenticated;
    }

    canUpdateTaskStatus(): boolean {
        // All authenticated users can update task status (drag & drop)
        return this.isAuthenticated;
    }

    // ===== ORGANIZATION PERMISSIONS =====

    canCreateOrganization(): boolean {
        // Only OWNER can create organizations (and only one if not already owner)
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER]);
    }

    canEditOrganization(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER]);
    }

    canDeleteOrganization(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER]);
    }

    // ===== MEMBER PERMISSIONS =====

    canAddMembers(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN]);
    }

    canRemoveMembers(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER]);
    }

    canAssignOwnerRole(): boolean {
        // Only Super Admins can assign Owner role
        return this.hasRole(Role.SUPER_ADMIN);
    }

    getAssignableRoles(): string[] {
        // Return list of roles the current user can assign to new members
        if (this.hasRole(Role.SUPER_ADMIN)) {
            return ['owner', 'admin', 'viewer'];
        } else if (this.hasAnyRole([Role.OWNER, Role.ADMIN])) {
            return ['admin', 'viewer'];
        }
        return [];
    }

    // ===== ADMIN PERMISSIONS =====

    canViewUserManagement(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER]);
    }

    canViewAuditLog(): boolean {
        return this.hasAnyRole([Role.SUPER_ADMIN, Role.OWNER, Role.ADMIN]);
    }

    canPromoteUsers(): boolean {
        return this.hasRole(Role.SUPER_ADMIN);
    }

    // ===== HELPER METHODS =====

    hasRole(role: Role): boolean {
        return this.currentUser?.role === role;
    }

    hasAnyRole(roles: Role[]): boolean {
        if (!this.currentUser?.role) return false;
        return roles.includes(this.currentUser.role);
    }

    isSuperAdmin(): boolean {
        return this.hasRole(Role.SUPER_ADMIN);
    }

    isOwner(): boolean {
        return this.hasRole(Role.OWNER);
    }

    isAdmin(): boolean {
        return this.hasRole(Role.ADMIN);
    }

    isViewer(): boolean {
        return this.hasRole(Role.VIEWER);
    }
}
