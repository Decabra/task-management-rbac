import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../database/entities/user/user.entity';
import { Permission } from '../../database/entities/permission/permission.entity';
import { CommonModule } from '../../common/common.module';
import { PermissionsModule } from '../permission/permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Permission]), CommonModule, PermissionsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
