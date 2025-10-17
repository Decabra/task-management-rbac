import { createReducer, on } from '@ngrx/store';
import { TasksState, initialTasksState } from './tasks.state';

export type { TasksState };
import * as TasksActions from './tasks.actions';

export const tasksReducer = createReducer(
  initialTasksState,

  // Load tasks
  on(TasksActions.loadTasks, (state, { filters }) => ({
    ...state,
    isLoading: true,
    error: null,
    filters: { ...state.filters, ...filters },
  })),

    on(TasksActions.loadTasksSuccess, (state, { tasks, total, hasMore }) => {
      // Check if we have a status filter applied
      const hasStatusFilter = state.filters.status && state.filters.status !== 'All Status';

      if (hasStatusFilter) {
        // If status filter is applied, update only the relevant status tasks
        const status = state.filters.status;
        let updatedTasks = [...state.tasks];

        // Remove existing tasks of this status
        updatedTasks = updatedTasks.filter(task => task.status !== status);

        // Add new tasks for this status
        updatedTasks = [...updatedTasks, ...tasks];

        return {
          ...state,
          tasks: updatedTasks,
          total,
          hasMore,
          isLoading: false,
          error: null,
        };
      } else {
        // No status filter, update all tasks normally
        return {
          ...state,
          tasks,
          total,
          hasMore,
          isLoading: false,
          error: null,
        };
      }
    }),

  on(TasksActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create task
  on(TasksActions.createTask, (state) => ({
    ...state,
    isCreating: true,
    error: null,
  })),

  on(TasksActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [task, ...state.tasks],
    total: state.total + 1,
    isCreating: false,
    error: null,
  })),

  on(TasksActions.createTaskFailure, (state, { error }) => ({
    ...state,
    isCreating: false,
    error,
  })),

  // Update task
  on(TasksActions.updateTask, (state) => ({
    ...state,
    isUpdating: true,
    error: null,
  })),

  on(TasksActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    isUpdating: false,
    error: null,
  })),

  on(TasksActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    isUpdating: false,
    error,
  })),

  // Delete task
  on(TasksActions.deleteTask, (state) => ({
    ...state,
    isDeleting: true,
    error: null,
  })),

  on(TasksActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== id),
    total: state.total - 1,
    isDeleting: false,
    error: null,
  })),

  on(TasksActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    isDeleting: false,
    error,
  })),

  // Filter tasks
  on(TasksActions.filterTasks, (state, { filters }) => ({
    ...state,
    filters: { ...filters },
  })),

  // Reorder task
  on(TasksActions.reorderTask, (state) => ({
    ...state,
    isUpdating: true,
    error: null,
  })),

  on(TasksActions.reorderTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    isUpdating: false,
    error: null,
  })),

  on(TasksActions.reorderTaskFailure, (state, { error }) => ({
    ...state,
    isUpdating: false,
    error,
  })),

  // Load categories
  on(TasksActions.loadCategories, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    isLoading: false,
    error: null,
  })),

  on(TasksActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Set filters
  on(TasksActions.setFilters, (state, { filters }) => ({
    ...state,
    filters,
  })),

  // Clear filters
  on(TasksActions.clearFilters, (state) => ({
    ...state,
    filters: {
      orgId: undefined,
      status: undefined,
      category: undefined,
      q: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      limit: 5,
      offset: 0
    },
  })),

  // Load stats
  on(TasksActions.loadStats, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(TasksActions.loadStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    isLoading: false,
    error: null,
  })),

  on(TasksActions.loadStatsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Clear error
  on(TasksActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
