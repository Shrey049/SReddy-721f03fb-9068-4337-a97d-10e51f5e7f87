import { Role } from '@turbovets-workspace/data';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  organizationId: string;
  role: Role;
}



