import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class UpdateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Category must be a string' })
  @IsOptional()
  category?: string;

  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  @IsOptional()
  status?: TaskStatus;

  @IsNumber({}, { message: 'Order index must be a number' })
  @IsOptional()
  orderIndex?: number;
}
