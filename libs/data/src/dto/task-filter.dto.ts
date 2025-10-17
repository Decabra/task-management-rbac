import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskFilterDto {
  @IsString({ message: 'Query must be a string' })
  @IsOptional()
  q?: string;

  @IsString({ message: 'Category must be a string' })
  @IsOptional()
  category?: string;

  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  @IsOptional()
  status?: TaskStatus;

  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @IsOptional()
  limit?: number;

  @IsNumber({}, { message: 'Offset must be a number' })
  @Min(0, { message: 'Offset must be at least 0' })
  @IsOptional()
  offset?: number;
}
