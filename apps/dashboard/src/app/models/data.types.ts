// Temporary interfaces - will be replaced with @libs/data
export interface ITask {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: TaskStatus;
  orderIndex: number;
  orgId: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: { name: string };
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  createdAt: string;
  entity: string;
  entityId: string;
  orgId: string;
  meta?: any;
  // Enhanced fields for human-readable display
  userName?: string;
  userEmail?: string;
  organizationName?: string;
  taskTitle?: string;
  // Original IDs for reference
  originalUserId?: string;
  originalOrgId?: string;
  originalEntityId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  category: string;
  status: TaskStatus;
  orgId?: string; // Made optional - backend will determine from user context
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
  orderIndex?: number;
}

export interface TaskFilterDto {
  status?: TaskStatus;
  category?: string;
  orgId?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}
