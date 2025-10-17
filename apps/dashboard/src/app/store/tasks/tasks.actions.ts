import { createAction, props } from '@ngrx/store';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto, ITask } from '../../models/data.types';

// Load tasks
export const loadTasks = createAction(
  '[Tasks] Load Tasks',
  props<{ filters?: TaskFilterDto }>()
);

export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: ITask[]; total: number; hasMore: boolean }>()
);

export const loadTasksFailure = createAction(
  '[Tasks] Load Tasks Failure',
  props<{ error: string }>()
);

// Create task
export const createTask = createAction(
  '[Tasks] Create Task',
  props<{ task: CreateTaskDto }>()
);

export const createTaskSuccess = createAction(
  '[Tasks] Create Task Success',
  props<{ task: ITask }>()
);

export const createTaskFailure = createAction(
  '[Tasks] Create Task Failure',
  props<{ error: string }>()
);

// Update task
export const updateTask = createAction(
  '[Tasks] Update Task',
  props<{ id: string; updates: UpdateTaskDto }>()
);

export const updateTaskSuccess = createAction(
  '[Tasks] Update Task Success',
  props<{ task: ITask }>()
);

export const updateTaskFailure = createAction(
  '[Tasks] Update Task Failure',
  props<{ error: string }>()
);

// Delete task
export const deleteTask = createAction(
  '[Tasks] Delete Task',
  props<{ id: string }>()
);

export const deleteTaskSuccess = createAction(
  '[Tasks] Delete Task Success',
  props<{ id: string }>()
);

export const deleteTaskFailure = createAction(
  '[Tasks] Delete Task Failure',
  props<{ error: string }>()
);

// Filter tasks
export const filterTasks = createAction(
  '[Tasks] Filter Tasks',
  props<{ filters: TaskFilterDto }>()
);

export const setFilters = createAction(
  '[Tasks] Set Filters',
  props<{ filters: TaskFilterDto }>()
);

export const clearFilters = createAction('[Tasks] Clear Filters');

// Reorder task (drag and drop)
export const reorderTask = createAction(
  '[Tasks] Reorder Task',
  props<{ id: string; newOrderIndex: number; newStatus?: string }>()
);

export const reorderTaskSuccess = createAction(
  '[Tasks] Reorder Task Success',
  props<{ task: ITask }>()
);

export const reorderTaskFailure = createAction(
  '[Tasks] Reorder Task Failure',
  props<{ error: string }>()
);

// Load categories
export const loadCategories = createAction('[Tasks] Load Categories');

export const loadCategoriesSuccess = createAction(
  '[Tasks] Load Categories Success',
  props<{ categories: string[] }>()
);

export const loadCategoriesFailure = createAction(
  '[Tasks] Load Categories Failure',
  props<{ error: string }>()
);

// Load stats
export const loadStats = createAction('[Tasks] Load Stats');

export const loadStatsSuccess = createAction(
  '[Tasks] Load Stats Success',
  props<{ stats: { TODO: number; IN_PROGRESS: number; DONE: number; TOTAL: number } }>()
);

export const loadStatsFailure = createAction(
  '[Tasks] Load Stats Failure',
  props<{ error: string }>()
);

// Clear error
export const clearError = createAction('[Tasks] Clear Error');
