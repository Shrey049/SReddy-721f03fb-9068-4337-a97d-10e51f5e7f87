export interface IOrganizationMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'viewer';
  isActive: boolean;
  joinedAt?: Date;
}

export interface IOrganization {
  id: string;
  name: string;
  parentId?: string | null;
  users?: IOrganizationMember[];
  createdAt: Date;
  updatedAt: Date;
}



