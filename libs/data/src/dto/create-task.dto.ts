import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class CreateTaskDto {
  @IsUUID('4', { message: 'Organization ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Organization ID is required' })
  orgId!: string;

  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Category must be a string' })
  @IsNotEmpty({ message: 'Category is required' })
  category!: string;

  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  @IsOptional()
  status?: TaskStatus;

  @IsNumber({}, { message: 'Order index must be a number' })
  @IsOptional()
  orderIndex?: number;
}
