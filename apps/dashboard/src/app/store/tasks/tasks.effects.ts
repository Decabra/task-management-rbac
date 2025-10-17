import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as TasksActions from './tasks.actions';
import { TasksService } from '../../services/tasks.service';
import { selectTasksFilters } from './tasks.selectors';

@Injectable()
export class TasksEffects {
  private actions$ = inject(Actions);
  private tasksService = inject(TasksService);
  private store = inject(Store);

  // Load tasks effect
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      withLatestFrom(this.store.select(selectTasksFilters)),
      switchMap(([action, filters]) => {
        // Check if there's a search query
        const hasSearchQuery = filters && (filters.q && filters.q.trim() !== '');
        
        if (hasSearchQuery) {
          // Use search method to get total counts and searched tasks
          return this.tasksService.getTasksWithSearch(filters as any).pipe(
            map((response) => {
              // Combine all tasks from all statuses
              const allTasks = [
                ...response.TODO.tasks,
                ...response.IN_PROGRESS.tasks,
                ...response.DONE.tasks
              ];
              const totalTasks = response.TODO.total + response.IN_PROGRESS.total + response.DONE.total;
              
              return TasksActions.loadTasksSuccess({
                tasks: allTasks,
                total: totalTasks,
                hasMore: response.TODO.hasMore || response.IN_PROGRESS.hasMore || response.DONE.hasMore,
              });
            }),
            catchError((error) =>
              of(TasksActions.loadTasksFailure({ error: error.message || 'Failed to load tasks' }))
            )
          );
        } else {
          // Use regular method to get 5 tasks for each status
          return this.tasksService.getTasksByStatus(filters as any).pipe(
            map((response) => {
              // Combine all tasks from all statuses
              const allTasks = [
                ...response.TODO.tasks,
                ...response.IN_PROGRESS.tasks,
                ...response.DONE.tasks
              ];
              const totalTasks = response.TODO.total + response.IN_PROGRESS.total + response.DONE.total;
              
              return TasksActions.loadTasksSuccess({
                tasks: allTasks,
                total: totalTasks,
                hasMore: response.TODO.hasMore || response.IN_PROGRESS.hasMore || response.DONE.hasMore,
              });
            }),
            catchError((error) =>
              of(TasksActions.loadTasksFailure({ error: error.message || 'Failed to load tasks' }))
            )
          );
        }
      })
    )
  );

  // Create task effect
  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      switchMap(({ task }) =>
        this.tasksService.createTask(task).pipe(
          map((response) => TasksActions.createTaskSuccess({ task: response })),
          catchError((error) =>
            of(TasksActions.createTaskFailure({ error: error.message || 'Failed to create task' }))
          )
        )
      )
    )
  );

  // Update task effect
  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      switchMap(({ id, updates }) =>
        this.tasksService.updateTask(id, updates).pipe(
          map((response) => TasksActions.updateTaskSuccess({ task: response })),
          catchError((error) =>
            of(TasksActions.updateTaskFailure({ error: error.message || 'Failed to update task' }))
          )
        )
      )
    )
  );

  // Delete task effect
  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      switchMap(({ id }) =>
        this.tasksService.deleteTask(id).pipe(
          map(() => TasksActions.deleteTaskSuccess({ id })),
          catchError((error) =>
            of(TasksActions.deleteTaskFailure({ error: error.message || 'Failed to delete task' }))
          )
        )
      )
    )
  );

  // Reorder task effect
  reorderTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.reorderTask),
      switchMap(({ id, newOrderIndex, newStatus }) =>
        this.tasksService.updateTask(id, {
          orderIndex: newOrderIndex,
          ...(newStatus && { status: newStatus as any }),
        }).pipe(
          map((response) => TasksActions.reorderTaskSuccess({ task: response })),
          catchError((error) =>
            of(TasksActions.reorderTaskFailure({ error: error.message || 'Failed to reorder task' }))
          )
        )
      )
    )
  );

  // Filter tasks effect
  filterTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.filterTasks),
      switchMap(({ filters }) => {
        // Check if there's a search query
        const hasSearchQuery = filters && (filters.q && filters.q.trim() !== '');
        
        if (hasSearchQuery) {
          // Use search method to get total counts and searched tasks
          return this.tasksService.getTasksWithSearch(filters as any).pipe(
            map((response) => {
              // Combine all tasks from all statuses
              const allTasks = [
                ...response.TODO.tasks,
                ...response.IN_PROGRESS.tasks,
                ...response.DONE.tasks
              ];
              const totalTasks = response.TODO.total + response.IN_PROGRESS.total + response.DONE.total;
              
              return TasksActions.loadTasksSuccess({
                tasks: allTasks,
                total: totalTasks,
                hasMore: response.TODO.hasMore || response.IN_PROGRESS.hasMore || response.DONE.hasMore,
              });
            }),
            catchError((error) =>
              of(TasksActions.loadTasksFailure({ error: error.message || 'Failed to filter tasks' }))
            )
          );
        } else {
          // Use regular method to get 5 tasks for each status
          return this.tasksService.getTasksByStatus(filters as any).pipe(
            map((response) => {
              // Combine all tasks from all statuses
              const allTasks = [
                ...response.TODO.tasks,
                ...response.IN_PROGRESS.tasks,
                ...response.DONE.tasks
              ];
              const totalTasks = response.TODO.total + response.IN_PROGRESS.total + response.DONE.total;
              
              return TasksActions.loadTasksSuccess({
                tasks: allTasks,
                total: totalTasks,
                hasMore: response.TODO.hasMore || response.IN_PROGRESS.hasMore || response.DONE.hasMore,
              });
            }),
            catchError((error) =>
              of(TasksActions.loadTasksFailure({ error: error.message || 'Failed to filter tasks' }))
            )
          );
        }
      })
    )
  );

  // Load categories effect
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadCategories),
      switchMap(() =>
        this.tasksService.getCategories().pipe(
          map((categories) => TasksActions.loadCategoriesSuccess({ categories })),
          catchError((error) =>
            of(TasksActions.loadCategoriesFailure({ error: error.message || 'Failed to load categories' }))
          )
        )
      )
    )
  );

  // Load stats effect
  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadStats),
      switchMap(() =>
        this.tasksService.getTotalCounts().pipe(
          map((stats) => TasksActions.loadStatsSuccess({ stats })),
          catchError((error) =>
            of(TasksActions.loadStatsFailure({ error: error.message || 'Failed to load stats' }))
          )
        )
      )
    )
  );
}
