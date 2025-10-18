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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './organization.dto';
import { JwtAuthGuard, RbacGuard, Roles } from '@libs/auth';
import { Role } from '@libs/data';
import { PermissionsService } from '../permission/permission.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Organization } from '../../database/entities';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RbacGuard)
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly permissionsService: PermissionsService,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async findAll(@Request() req: any) {
    const organizations = await this.organizationService.findAllForAccessPermissions();
    return organizations;
  }

  @Get('user-organizations')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async getUserOrganizations(@Request() req: any) {
    const userId = req.user.id;
    const orgIds = await this.permissionsService.getUserOrganizations(userId);
    
    // Get actual organization names from the organizations table
    const organizations = await this.organizationRepository.find({
      where: { id: In(orgIds) },
      select: ['id', 'name']
    });
    
    return { organizations };
  }

  @Get('hierarchy')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async getHierarchy(@Request() req: any) {
    const organizations = await this.organizationService.getHierarchyForAccessPermissions();
    return organizations;
  }

  @Get(':id')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async findOne(@Param('id') id: string, @Request() req: any) {
    // For Access & Permissions page, use the permissive method
    return this.organizationService.findOneForAccessPermissions(id);
  }

  @Get(':id/children')
  @Roles(Role.VIEWER, Role.ADMIN, Role.OWNER)
  async findChildren(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(userId);
    return this.organizationService.findChildren(id, accessibleOrgIds);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto, @Request() req: any) {
    // For Access & Permissions page, use the permissive method
    return this.organizationService.updateForAccessPermissions(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  async remove(@Param('id') id: string, @Request() req: any) {
    // For Access & Permissions page, use the permissive method
    return this.organizationService.removeForAccessPermissions(id);
  }
}
