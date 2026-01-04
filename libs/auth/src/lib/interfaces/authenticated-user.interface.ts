import { Role } from '@turbovets-workspace/data';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: Role;
    organizationId: string | null;
    firstName?: string;
    lastName?: string;
}
