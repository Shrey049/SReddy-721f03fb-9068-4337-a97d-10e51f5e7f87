import { TaskStatus, TaskPriority } from '../enums';
import { IUser } from './user.interface';

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  organizationId: string;
  createdById: string;
  assignedToId: string | null;
  assignedTo?: IUser;
  createdBy?: IUser;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend-safe interfaces (no decorators/reflect-metadata required)
export interface ICreateTask {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedToId?: string;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignedToId?: string | null;
}

export interface ITaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  organizationId?: string;
  sort?: 'dueDate' | 'priority' | 'createdAt';
  order?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface IUpdateTaskStatus {
  status: TaskStatus;
}



