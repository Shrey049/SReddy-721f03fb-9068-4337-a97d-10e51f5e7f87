import { Role } from '@turbovets-workspace/data';

export interface UserOrganizationMembership {
    organizationId: string;
    organizationName?: string;
    role: 'owner' | 'admin' | 'viewer';
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: Role; // Global role: super_admin or viewer
    organizations: UserOrganizationMembership[]; // List of org memberships with roles
    firstName?: string;
    lastName?: string;
}
