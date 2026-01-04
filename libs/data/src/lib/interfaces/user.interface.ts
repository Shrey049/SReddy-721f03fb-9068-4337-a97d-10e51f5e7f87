import { Role } from '../enums';

export interface IUserOrganizationMembership {
  organizationId: string;
  organizationName?: string;
  role: 'owner' | 'admin' | 'viewer';
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role?: Role; // Global role: super_admin or viewer
  organizations?: IUserOrganizationMembership[];
  organizationCount?: number; // Number of organizations user belongs to
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithOrganizations extends IUser {
  organizations: IUserOrganizationMembership[];
}



