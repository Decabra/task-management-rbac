import { Role } from '../enums/role.enum';

export interface IPermission {
  id: string;
  userId: string;
  orgId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
