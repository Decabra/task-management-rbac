import { TasksState, initialTasksState } from './tasks.state';
import { tasksReducer } from './tasks.reducer';
import * as TasksActions from './tasks.actions';
import { ITask, TaskStatus } from '../../models/data.types';

describe('TasksReducer', () => {
  const mockTask: ITask = {
    id: '1',
    orgId: 'org1',
    title: 'Test Task',
    description: 'Test Description',
    category: 'Test',
    status: TaskStatus.TODO,
    orderIndex: 0,
    ownerUserId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should return the initial state', () => {
    const action = { type: 'Unknown' };
    const state = tasksReducer(initialTasksState, action);
    expect(state).toBe(initialTasksState);
  });

  it('should handle loadTasks action', () => {
    const action = TasksActions.loadTasks({});
    const state = tasksReducer(initialTasksState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loadTasksSuccess action', () => {
    const tasks = [mockTask];
    const total = 1;
    const hasMore = false;
    const action = TasksActions.loadTasksSuccess({ tasks, total, hasMore });
    const state = tasksReducer(initialTasksState, action);

    expect(state.tasks).toEqual(tasks);
    expect(state.total).toBe(total);
    expect(state.hasMore).toBe(hasMore);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle loadTasksFailure action', () => {
    const error = 'Failed to load tasks';
    const action = TasksActions.loadTasksFailure({ error });
    const state = tasksReducer(initialTasksState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
  });

  it('should handle createTask action', () => {
    const task = { title: 'New Task', category: 'Test', orgId: 'org1' };
    const action = TasksActions.createTask({ task });
    const state = tasksReducer(initialTasksState, action);

    expect(state.isCreating).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle createTaskSuccess action', () => {
    const currentState: TasksState = {
      ...initialTasksState,
      tasks: [mockTask],
      isCreating: true
    };

    const newTask = { ...mockTask, id: '2', title: 'New Task' };
    const action = TasksActions.createTaskSuccess({ task: newTask });
    const state = tasksReducer(currentState, action);

    expect(state.tasks).toContain(newTask);
    expect(state.isCreating).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle updateTask action', () => {
    const updates = { title: 'Updated Task' };
    const action = TasksActions.updateTask({ id: '1', updates });
    const state = tasksReducer(initialTasksState, action);

    expect(state.isUpdating).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle updateTaskSuccess action', () => {
    const currentState: TasksState = {
      ...initialTasksState,
      tasks: [mockTask],
      isUpdating: true
    };

    const updatedTask = { ...mockTask, title: 'Updated Task' };
    const action = TasksActions.updateTaskSuccess({ task: updatedTask });
    const state = tasksReducer(currentState, action);

    expect(state.tasks[0]).toEqual(updatedTask);
    expect(state.isUpdating).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle deleteTask action', () => {
    const action = TasksActions.deleteTask({ id: '1' });
    const state = tasksReducer(initialTasksState, action);

    expect(state.isDeleting).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle deleteTaskSuccess action', () => {
    const currentState: TasksState = {
      ...initialTasksState,
      tasks: [mockTask],
      isDeleting: true
    };

    const action = TasksActions.deleteTaskSuccess({ id: '1' });
    const state = tasksReducer(currentState, action);

    expect(state.tasks).toEqual([]);
    expect(state.isDeleting).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle setFilters action', () => {
    const filters = { status: 'TODO', category: 'Test' };
    const action = TasksActions.setFilters({ filters });
    const state = tasksReducer(initialTasksState, action);

    expect(state.filters).toEqual(filters);
  });

  it('should handle clearError action', () => {
    const currentState: TasksState = {
      ...initialTasksState,
      error: 'Some error'
    };

    const action = TasksActions.clearError();
    const state = tasksReducer(currentState, action);

    expect(state.error).toBeNull();
  });
});
