import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../../enums';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string | null;

  @IsUUID()
  @IsOptional()
  assignedToId?: string | null;
}

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}



