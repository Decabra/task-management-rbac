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
import { PermissionsService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { JwtAuthGuard, RbacGuard, Roles } from '@libs/auth';
import { Role } from '@libs/data';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PermissionController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(Role.OWNER)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  async findAll(@Request() req: any) {
    const userId = req.user.id;
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(userId);
    return this.permissionsService.findAll(accessibleOrgIds);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(userId);
    return this.permissionsService.findOne(id, accessibleOrgIds);
  }

  @Patch(':id')
  @Roles(Role.OWNER)
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @Request() req: any) {
    const userId = req.user.id;
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(userId);
    return this.permissionsService.update(id, updatePermissionDto, accessibleOrgIds);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(userId);
    return this.permissionsService.remove(id, accessibleOrgIds);
  }
}
