import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { JwtAuthGuard, RbacGuard, Roles } from '@libs/auth';
import { Role } from '@libs/data';
import { PermissionsService } from '../permission/permission.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RbacGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionsService: PermissionsService
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  async findAll(@Request() req: any) {
    const users = await this.userService.findAllForAccessPermissions();
    return users;
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async findOne(@Param('id') id: string, @Request() req: any) {
    // For Access & Permissions page, use the permissive method
    return this.userService.findOneForAccessPermissions(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    // For Access & Permissions page, use the permissive method
    return this.userService.updateForAccessPermissions(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  async remove(@Param('id') id: string, @Request() req: any) {
    // For Access & Permissions page, use the permissive method
    return this.userService.removeForAccessPermissions(id);
  }
}
