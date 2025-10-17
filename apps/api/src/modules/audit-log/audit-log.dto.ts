import { IsString, IsNotEmpty, IsOptional, IsUUID, IsObject, IsNumber } from 'class-validator';

export class CreateAuditLogDto {
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsUUID(4, { message: 'Organization ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Organization ID is required' })
  orgId!: string;

  @IsString({ message: 'Action must be a string' })
  @IsNotEmpty({ message: 'Action is required' })
  action!: string;

  @IsString({ message: 'Entity must be a string' })
  @IsNotEmpty({ message: 'Entity is required' })
  entity!: string;

  @IsString({ message: 'Entity ID must be a string' })
  @IsNotEmpty({ message: 'Entity ID is required' })
  entityId!: string;

  @IsOptional()
  @IsObject({ message: 'Meta must be an object' })
  meta?: Record<string, any>;
}

export class AuditLogFilterDto {
  @IsOptional()
  @IsUUID(4, { message: 'Organization ID must be a valid UUID' })
  orgId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Offset must be a number' })
  offset?: number;
}

export class AuditLogResponseDto {
  id: string;
  userId: string;
  orgId: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, any>;
  createdAt: Date;
}
