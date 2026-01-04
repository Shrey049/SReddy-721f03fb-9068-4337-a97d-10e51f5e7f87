import { Role } from '../enums';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role?: Role;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithRole extends IUser {
  role: Role;
  organizationId: string;
}



