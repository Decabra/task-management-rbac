import { ITask } from '../../models/data.types';

export interface TasksState {
  tasks: ITask[];
  categories: string[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  stats: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    TOTAL: number;
  };
  filters: {
    orgId?: string;
    status?: string;
    category?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  };
}

export const initialTasksState: TasksState = {
  tasks: [],
  categories: [],
  total: 0,
  hasMore: false,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  stats: {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    TOTAL: 0,
  },
  filters: {
    limit: 5,
    offset: 0,
  },
};
