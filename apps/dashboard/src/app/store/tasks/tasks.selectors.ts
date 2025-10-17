import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.state';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectAllTasks = createSelector(
  selectTasksState,
  (state) => state.tasks
);

export const selectTasksByStatus = (status: string) =>
  createSelector(selectAllTasks, (tasks) =>
    tasks?.filter((task) => task.status === status) ?? []
  );

export const selectTasksByCategory = (category: string) =>
  createSelector(selectAllTasks, (tasks) =>
    tasks?.filter((task) => task.category === category) ?? []
  );

export const selectTasksLoading = createSelector(
  selectTasksState,
  (state) => state.isLoading
);

export const selectTasksCreating = createSelector(
  selectTasksState,
  (state) => state.isCreating
);

export const selectTasksUpdating = createSelector(
  selectTasksState,
  (state) => state.isUpdating
);

export const selectTasksDeleting = createSelector(
  selectTasksState,
  (state) => state.isDeleting
);

export const selectTasksError = createSelector(
  selectTasksState,
  (state) => state.error
);

export const selectTasksTotal = createSelector(
  selectTasksState,
  (state) => state.total
);

export const selectTasksHasMore = createSelector(
  selectTasksState,
  (state) => state.hasMore
);

export const selectTasksFilters = createSelector(
  selectTasksState,
  (state) => state.filters
);

export const selectCategories = createSelector(
  selectTasksState,
  (state) => state.categories
);

export const selectTaskById = (id: string) =>
  createSelector(selectAllTasks, (tasks) =>
    tasks.find((task) => task.id === id)
  );

export const selectTasksByOrganization = (orgId: string) =>
  createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => task.orgId === orgId)
  );

export const selectTasksStats = createSelector(
  selectTasksState,
  (state) => state.stats
);

export const selectTodoCount = createSelector(
  selectTasksStats,
  (stats) => stats.TODO
);

export const selectInProgressCount = createSelector(
  selectTasksStats,
  (stats) => stats.IN_PROGRESS
);

export const selectDoneCount = createSelector(
  selectTasksStats,
  (stats) => stats.DONE
);

export const selectTotalTasksCount = createSelector(
  selectTasksStats,
  (stats) => stats.TOTAL
);
