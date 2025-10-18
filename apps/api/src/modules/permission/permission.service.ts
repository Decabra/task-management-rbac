import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../../database/entities';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { Role } from '@libs/data';
// Helper function to get the highest role from an array of roles
function getHighestRole(roles: Role[]): Role | null {
  if (roles.length === 0) return null;
  
  const hierarchy = {
    [Role.VIEWER]: 1,
    [Role.ADMIN]: 2,
    [Role.OWNER]: 3,
  };
  
  return roles.reduce((highest, current) => 
    hierarchy[current] > hierarchy[highest] ? current : highest
  );
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<any> {
    const permission = this.permissionRepository.create(createPermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);
    
    // Fetch the permission with relations to get user and organization names
    const permissionWithRelations = await this.permissionRepository.findOne({
      where: { id: savedPermission.id },
      relations: ['user', 'organization'],
    });

    // Transform the data to include userName and organizationName
    return {
      ...permissionWithRelations,
      userName: permissionWithRelations?.user?.name,
      organizationName: permissionWithRelations?.organization?.name,
    };
  }

  async findAll(accessibleOrgIds: string[]): Promise<any[]> {
    const permissions = await this.permissionRepository.find({
      where: { orgId: In(accessibleOrgIds) },
      relations: ['user', 'organization'],
    });

    // Transform the data to include userName and organizationName
    return permissions.map(permission => ({
      ...permission,
      userName: permission.user?.name,
      organizationName: permission.organization?.name,
    }));
  }

  async findOne(id: string, accessibleOrgIds: string[]): Promise<any> {
    const permission = await this.permissionRepository.findOne({
      where: { 
        id,
        orgId: In(accessibleOrgIds)
      },
      relations: ['user', 'organization'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found or not accessible`);
    }

    // Transform the data to include userName and organizationName
    return {
      ...permission,
      userName: permission.user?.name,
      organizationName: permission.organization?.name,
    };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, accessibleOrgIds: string[]): Promise<any> {
    const permission = await this.findOne(id, accessibleOrgIds);

    Object.assign(permission, updatePermissionDto);

    const savedPermission = await this.permissionRepository.save(permission);
    
    // Fetch the permission with relations to get user and organization names
    const permissionWithRelations = await this.permissionRepository.findOne({
      where: { id: savedPermission.id },
      relations: ['user', 'organization'],
    });

    // Transform the data to include userName and organizationName
    return {
      ...permissionWithRelations,
      userName: permissionWithRelations?.user?.name,
      organizationName: permissionWithRelations?.organization?.name,
    };
  }

  async remove(id: string, accessibleOrgIds: string[]): Promise<void> {
    const permission = await this.findOne(id, accessibleOrgIds);
    await this.permissionRepository.remove(permission);
  }

  /**
   * Get effective role for a user at a specific organization
   * Implements 2-level hierarchy: checks user's role at target org and parent org
   * 
   * @param userId - User ID
   * @param orgId - Target organization ID
   * @returns Highest role user has at org or its parent, null if no permissions
   */
  async getEffectiveRole(
    userId: string,
    orgId: string
  ): Promise<Role | null> {
    const roles: Role[] = [];

    // 1. Check user's direct role at target organization
    const directPermission = await this.permissionRepository.findOne({
      where: { userId, orgId },
    });

    if (directPermission) {
      roles.push(directPermission.role);
    }

    // 2. Check user's role at parent organization (if exists)
    const organization = await this.permissionRepository.manager
      .getRepository('Organization')
      .findOne({ where: { id: orgId } });

    if (organization?.parentId) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { userId, orgId: organization.parentId },
      });

      if (parentPermission) {
        roles.push(parentPermission.role);
      }
    }

    // 3. Return highest role found, or null if no permissions
    return getHighestRole(roles);
  }

  /**
   * Get all organizations a user has access to
   * @param userId - User ID
   * @returns Array of organization IDs
   */
  async getUserOrganizations(userId: string): Promise<string[]> {
    const permissions = await this.permissionRepository.find({
      where: { userId },
      select: ['orgId', 'role'],
    });

    const orgIds = permissions.map((p) => p.orgId);

    // Also include child organizations if user has OWNER role in parent
    const ownerPerms = permissions.filter((p) => p.role === Role.OWNER);

    for (const perm of ownerPerms) {
      const childOrgs = await this.permissionRepository.manager
        .getRepository('Organization')
        .find({
          where: { parentId: perm.orgId },
          select: ['id', 'name'],
        });
      orgIds.push(...childOrgs.map((org) => org.id));
    }

    // Return unique org IDs
    return [...new Set(orgIds)];
  }

  /**
   * Check if user has permission to access an organization
   * @param userId - User ID
   * @param orgId - Organization ID
   * @param requiredRole - Minimum required role
   * @returns true if user has sufficient role
   */
  async hasPermission(
    userId: string,
    orgId: string,
    requiredRole: Role
  ): Promise<boolean> {
    const effectiveRole = await this.getEffectiveRole(userId, orgId);

    if (!effectiveRole) {
      return false;
    }

    const roleHierarchy = {
      [Role.OWNER]: 3,
      [Role.ADMIN]: 2,
      [Role.VIEWER]: 1,
    };

    return roleHierarchy[effectiveRole] >= roleHierarchy[requiredRole];
  }
}
