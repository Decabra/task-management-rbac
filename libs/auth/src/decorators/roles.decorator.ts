import { SetMetadata } from '@nestjs/common';

export enum Role {
  VIEWER = 'VIEWER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
