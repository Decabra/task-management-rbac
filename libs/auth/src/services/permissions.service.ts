import { Injectable } from '@nestjs/common';
import { Role } from '@libs/data';

@Injectable()
export class PermissionsService {
  /**
   * Check if user has required role for organization
   */
  hasRole(userRole: Role, requiredRole: Role): boolean {
    const roleHierarchy = {
      [Role.VIEWER]: 1,
      [Role.ADMIN]: 2,
      [Role.OWNER]: 3,
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Check if user can access organization
   */
  canAccessOrg(userOrgId: string, targetOrgId: string): boolean {
    // Owner can access all organizations
    // Admin and Viewer can only access their own organization
    return userOrgId === targetOrgId;
  }

  /**
   * Get user permissions for organization
   */
  getUserPermissions(userRole: Role, orgId: string) {
    const permissions = {
      canRead: true, // All roles can read
      canWrite: this.hasRole(userRole, Role.ADMIN),
      canDelete: this.hasRole(userRole, Role.ADMIN),
      canManageUsers: this.hasRole(userRole, Role.OWNER),
      canManageOrg: this.hasRole(userRole, Role.OWNER),
    };

    return permissions;
  }
}
