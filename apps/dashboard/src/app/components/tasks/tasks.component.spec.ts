import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { TasksComponent } from './tasks.component';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      category: 'Work',
      status: 'TODO',
      orderIndex: 1,
      orgId: 'org1',
      ownerUserId: 'user1',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16',
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      category: 'Personal',
      status: 'IN_PROGRESS',
      orderIndex: 2,
      orgId: 'org1',
      ownerUserId: 'user1',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-15',
    },
    {
      id: '3',
      title: 'Test Task 3',
      description: 'Test Description 3',
      category: 'Work',
      status: 'DONE',
      orderIndex: 3,
      orgId: 'org1',
      ownerUserId: 'user1',
      createdAt: '2024-01-13',
      updatedAt: '2024-01-13',
    },
  ];

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        FormBuilder,
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;

    // Mock the observables
    component.tasks$ = of(mockTasks);
    component.isLoading$ = of(false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should organize tasks by status', () => {
    component.organizeTasksByStatus(mockTasks);

    expect(component.todoTasks.length).toBe(1);
    expect(component.inProgressTasks.length).toBe(1);
    expect(component.doneTasks.length).toBe(1);
  });

  it('should calculate total tasks correctly', () => {
    component.todoTasks = mockTasks.filter(task => task.status === 'TODO');
    component.inProgressTasks = mockTasks.filter(task => task.status === 'IN_PROGRESS');
    component.doneTasks = mockTasks.filter(task => task.status === 'DONE');

    expect(component.getTotalTasks()).toBe(3);
  });

  it('should calculate completion rate correctly', () => {
    component.todoTasks = mockTasks.filter(task => task.status === 'TODO');
    component.inProgressTasks = mockTasks.filter(task => task.status === 'IN_PROGRESS');
    component.doneTasks = mockTasks.filter(task => task.status === 'DONE');

    expect(component.getCompletionRate()).toBe(33); // 1 done out of 3 total
  });

  it('should show create task dialog', () => {
    component.showCreateTaskDialog();

    expect(component.showModal).toBe(true);
    expect(component.isEditMode).toBe(false);
    expect(component.currentTask).toBeNull();
  });

  it('should show edit task dialog', () => {
    const task = mockTasks[0];
    component.editTask(task);

    expect(component.showModal).toBe(true);
    expect(component.isEditMode).toBe(true);
    expect(component.currentTask).toBe(task);
  });

  it('should close modal', () => {
    component.showModal = true;
    component.isEditMode = true;
    component.currentTask = mockTasks[0];

    component.closeModal();

    expect(component.showModal).toBe(false);
    expect(component.isEditMode).toBe(false);
    expect(component.currentTask).toBeNull();
  });

  it('should validate task form', () => {
    component.taskForm.patchValue({
      title: '',
      description: 'Test description',
      category: 'Work',
      status: 'TODO'
    });

    expect(component.taskForm.valid).toBe(false);
    expect(component.taskForm.get('title')?.errors?.['required']).toBeTruthy();
  });

  it('should filter tasks by category', () => {
    component.selectedCategory = 'Work';
    spyOn(console, 'log');

    component.filterTasks();

    expect(console.log).toHaveBeenCalledWith('Filtering by category:', 'Work');
  });

  it('should filter tasks by search query', () => {
    component.searchQuery = 'Test';
    spyOn(console, 'log');

    component.filterTasks();

    expect(console.log).toHaveBeenCalledWith('Searching for:', 'Test');
  });

  it('should handle drag and drop within same list', () => {
    const event = {
      previousContainer: { data: component.todoTasks },
      container: { data: component.todoTasks },
      previousIndex: 0,
      currentIndex: 1,
    };

    component.todoTasks = [...mockTasks.filter(task => task.status === 'TODO')];
    const originalLength = component.todoTasks.length;

    component.drop(event);

    expect(component.todoTasks.length).toBe(originalLength);
  });

  it('should handle drag and drop between different lists', () => {
    const event = {
      previousContainer: { data: component.todoTasks, id: 'todo-list' },
      container: { data: component.inProgressTasks, id: 'in-progress-list' },
      previousIndex: 0,
      currentIndex: 0,
    };

    component.todoTasks = [...mockTasks.filter(task => task.status === 'TODO')];
    component.inProgressTasks = [...mockTasks.filter(task => task.status === 'IN_PROGRESS')];

    const originalTodoLength = component.todoTasks.length;
    const originalInProgressLength = component.inProgressTasks.length;

    component.drop(event);

    expect(component.todoTasks.length).toBe(originalTodoLength - 1);
    expect(component.inProgressTasks.length).toBe(originalInProgressLength + 1);
  });

  it('should get status from list ID', () => {
    expect(component['getStatusFromListId']('todo-list')).toBe('TODO');
    expect(component['getStatusFromListId']('in-progress-list')).toBe('IN_PROGRESS');
    expect(component['getStatusFromListId']('done-list')).toBe('DONE');
    expect(component['getStatusFromListId']('unknown-list')).toBe('TODO');
  });
});
