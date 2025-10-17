import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateOrganizationDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsOptional()
  @IsUUID(4, { message: 'Parent ID must be a valid UUID' })
  parentId?: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Parent ID must be a valid UUID' })
  parentId?: string;
}

export class OrganizationResponseDto {
  id!: string;
  name!: string;
  parentId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
