import { TaskStatus } from '../enums/task-status.enum';

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
