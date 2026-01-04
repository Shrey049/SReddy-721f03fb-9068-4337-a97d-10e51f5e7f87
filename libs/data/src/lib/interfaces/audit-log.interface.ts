import { AuditAction } from '../enums';
import { IUser } from './user.interface';

export interface IAuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: 'task' | 'user' | 'organization';
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: Date;
  user?: IUser;
}



