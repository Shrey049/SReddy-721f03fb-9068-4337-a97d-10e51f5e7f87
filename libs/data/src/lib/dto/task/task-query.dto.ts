import { IsEnum, IsOptional, IsUUID, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../../enums';

export class TaskQueryDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @IsOptional()
  sort?: 'dueDate' | 'priority' | 'createdAt';

  @IsOptional()
  order?: 'ASC' | 'DESC';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;
}



