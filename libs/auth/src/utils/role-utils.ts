import { Role } from '@libs/data';

export class RoleUtils {
  /**
   * Get role display name
   */
  static getRoleDisplayName(role: Role): string {
    const displayNames = {
      [Role.VIEWER]: 'Viewer',
      [Role.ADMIN]: 'Administrator',
      [Role.OWNER]: 'Owner',
    };
    
    return displayNames[role];
  }

  /**
   * Get role description
   */
  static getRoleDescription(role: Role): string {
    const descriptions = {
      [Role.VIEWER]: 'Can view tasks and data',
      [Role.ADMIN]: 'Can manage tasks and users',
      [Role.OWNER]: 'Full access to organization',
    };
    
    return descriptions[role];
  }

  /**
   * Check if role is higher than another
   */
  static isHigherRole(role1: Role, role2: Role): boolean {
    const hierarchy = {
      [Role.VIEWER]: 1,
      [Role.ADMIN]: 2,
      [Role.OWNER]: 3,
    };
    
    return hierarchy[role1] > hierarchy[role2];
  }

  /**
   * Get all roles lower than given role
   */
  static getLowerRoles(role: Role): Role[] {
    const hierarchy = {
      [Role.VIEWER]: 1,
      [Role.ADMIN]: 2,
      [Role.OWNER]: 3,
    };
    
    const currentLevel = hierarchy[role];
    return Object.keys(hierarchy)
      .filter(key => hierarchy[key as Role] < currentLevel)
      .map(key => key as Role);
  }
}
