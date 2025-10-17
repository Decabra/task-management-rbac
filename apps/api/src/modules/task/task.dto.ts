import { TaskStatus } from '@libs/data';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class TaskFilterDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(id => id.trim()).filter(id => id.length > 0);
    }
    return value;
  })
  orgIds?: string[];

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
    }
    if (Array.isArray(value)) {
      return value.filter(cat => cat && cat.trim().length > 0);
    }
    return value;
  })
  categories?: string[];

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class TaskResponseDto {
  id!: string;
  orgId!: string;
  title!: string;
  description!: string;
  category!: string;
  status!: TaskStatus;
  orderIndex!: number;
  ownerUserId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
