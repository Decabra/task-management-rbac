import { Role } from '@libs/data';
import { IsString, IsNotEmpty, IsEnum, IsUUID, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsUUID(4, { message: 'Organization ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Organization ID is required' })
  orgId!: string;

  @IsEnum(Role, { message: 'Role must be a valid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: Role;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be a valid role' })
  role?: Role;
}

export class PermissionResponseDto {
  id!: string;
  userId!: string;
  orgId!: string;
  role!: Role;
  createdAt!: Date;
  updatedAt!: Date;
}
