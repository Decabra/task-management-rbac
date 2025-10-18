import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Permission } from '../../database/entities';
import { Organization } from '../../database/entities';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Organization]), CommonModule],
  controllers: [PermissionController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
