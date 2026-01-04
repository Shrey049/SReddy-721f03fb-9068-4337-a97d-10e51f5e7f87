import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Role, IUserOrganizationMembership } from '@turbovets-workspace/data';

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

    /**
     * Get user's organizations
     */
    get userOrganizations(): IUserOrganizationMembership[] {
        return this.currentUser?.organizations || [];
    }

    /**
     * Get user's role in a specific organization
     */
    getUserOrgRole(orgId: string): 'owner' | 'admin' | 'viewer' | null {
        const membership = this.userOrganizations.find(o => o.organizationId === orgId);
        return membership?.role || null;
    }

    /**
     * Check if user is owner of a specific org
     */
    isOrgOwner(orgId: string): boolean {
        return this.getUserOrgRole(orgId) === 'owner';
    }

    /**
     * Check if user is admin of a specific org
     */
    isOrgAdmin(orgId: string): boolean {
        return this.getUserOrgRole(orgId) === 'admin';
    }

    /**
     * Check if user is viewer of a specific org
     */
    isOrgViewer(orgId: string): boolean {
        return this.getUserOrgRole(orgId) === 'viewer';
    }

    /**
     * Check if user is owner or admin of any org
     */
    isOwnerOrAdminOfAnyOrg(): boolean {
        return this.userOrganizations.some(o => o.role === 'owner' || o.role === 'admin');
    }

    // ===== TASK PERMISSIONS =====

    canCreateTask(): boolean {
        // Super admin can create tasks anywhere
        if (this.isSuperAdmin()) return true;
        // Users who are owner or admin in any org can create tasks
        return this.isOwnerOrAdminOfAnyOrg();
    }

    canCreateTaskInOrg(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        const role = this.getUserOrgRole(orgId);
        return role === 'owner' || role === 'admin';
    }

    canDeleteTask(): boolean {
        if (this.isSuperAdmin()) return true;
        return this.isOwnerOrAdminOfAnyOrg();
    }

    canDeleteTaskInOrg(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        const role = this.getUserOrgRole(orgId);
        return role === 'owner' || role === 'admin';
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
        // Any authenticated user can create an organization
        return this.isAuthenticated;
    }

    canEditOrganization(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        return this.isOrgOwner(orgId);
    }

    canDeleteOrganization(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        return this.isOrgOwner(orgId);
    }

    // ===== MEMBER PERMISSIONS =====

    canAddMembers(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        const role = this.getUserOrgRole(orgId);
        return role === 'owner' || role === 'admin';
    }

    canRemoveMembers(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        return this.isOrgOwner(orgId);
    }

    canUpdateMemberRole(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        return this.isOrgOwner(orgId);
    }

    /**
     * Get roles that can be assigned by the current user in a specific org
     */
    getAssignableRoles(orgId: string): string[] {
        if (this.isSuperAdmin()) {
            return ['owner', 'admin', 'viewer'];
        }

        const role = this.getUserOrgRole(orgId);
        if (role === 'owner') {
            return ['owner', 'admin', 'viewer'];
        }
        if (role === 'admin') {
            return ['admin', 'viewer'];
        }
        return [];
    }

    // ===== ADMIN PERMISSIONS =====

    canViewUserManagement(): boolean {
        if (this.isSuperAdmin()) return true;
        // Users who are owners of any org can view user management
        return this.userOrganizations.some(o => o.role === 'owner');
    }

    canViewAuditLog(): boolean {
        if (this.isSuperAdmin()) return true;
        return this.isOwnerOrAdminOfAnyOrg();
    }

    canPromoteUsers(): boolean {
        return this.isSuperAdmin();
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

    // ===== ORGANIZATION CONTEXT PERMISSIONS =====

    /**
     * Check if user belongs to a specific organization
     */
    belongsToOrganization(orgId: string): boolean {
        return this.userOrganizations.some(o => o.organizationId === orgId);
    }

    /**
     * Check if user can manage (add/remove members) a specific organization
     */
    canManageOrganization(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        const role = this.getUserOrgRole(orgId);
        return role === 'owner' || role === 'admin';
    }

    /**
     * Check if user can delete a specific organization (Owner of that org or Super Admin)
     */
    canDeleteSpecificOrganization(orgId: string): boolean {
        if (this.isSuperAdmin()) return true;
        return this.isOrgOwner(orgId);
    }

    /**
     * Get the first organization ID for the current user (for default selection)
     */
    getFirstOrganizationId(): string | null {
        return this.userOrganizations[0]?.organizationId || null;
    }
}
