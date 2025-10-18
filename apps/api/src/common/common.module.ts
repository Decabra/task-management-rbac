import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from '../modules/permission/permission.service';
import { Permission } from '../database/entities';
import { Organization } from '../database/entities';
import { RbacGuard } from '@libs/auth';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Organization])],
  providers: [PermissionsService, RbacGuard, Reflector],
  exports: [PermissionsService, RbacGuard],
})
export class CommonModule {}
