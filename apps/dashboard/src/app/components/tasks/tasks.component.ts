import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TasksService } from '../../services/tasks.service';
import { ToastService } from '../../services/toast.service';
import { OrganizationService, Organization } from '../../services/organization.service';
import { NavigationComponent } from '../shared/navigation.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog.component';
import { HierarchicalMultiSelectComponent, HierarchicalItem } from '../shared/hierarchical-multi-select.component';
import { IntersectionObserverDirective } from '../../directives/intersection-observer.directive';
import * as TasksActions from '../../store/tasks/tasks.actions';
import * as TasksSelectors from '../../store/tasks/tasks.selectors';

// Temporary interfaces - will be replaced with @libs/data
interface ITask {
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

enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule, NavigationComponent, ConfirmationDialogComponent, HierarchicalMultiSelectComponent, IntersectionObserverDirective],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navigation></app-navigation>
      
      <div class="p-6">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
          <p class="text-gray-600">Organize and track your tasks with drag-and-drop functionality</p>
        </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div class="bg-white border-l-4 border-l-blue-500 p-6 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Tasks</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalTasks$ | async }}</p>
            </div>
            <div class="text-blue-500 text-2xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white border-l-4 border-l-blue-500 p-6 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">To Do</p>
              <p class="text-2xl font-bold text-gray-900">{{ todoCount$ | async }}</p>
            </div>
            <div class="text-blue-500 text-2xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white border-l-4 border-l-yellow-500 p-6 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">In Progress</p>
              <p class="text-2xl font-bold text-gray-900">{{ inProgressCount$ | async }}</p>
            </div>
            <div class="text-yellow-500 text-2xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white border-l-4 border-l-green-500 p-6 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-gray-900">{{ doneCount$ | async }}</p>
            </div>
            <div class="text-green-500 text-2xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white border-l-4 border-l-purple-500 p-6 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Completion Rate</p>
              <p class="text-2xl font-bold text-gray-900">{{ completionRate$ | async }}%</p>
            </div>
            <div class="text-purple-500 text-2xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <!-- Category Filter -->
            <div class="flex-1 sm:flex-none sm:w-48">
              <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div class="relative">
                <button
                  type="button"
                  (click)="toggleCategoryDropdown($event)"
                  class="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.bg-blue-50]="isCategoryDropdownOpen"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">
                      {{ getCategoryDisplayText() }}
                    </span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>

                <!-- Category Dropdown Menu -->
                <div 
                  *ngIf="isCategoryDropdownOpen"
                  class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  (click)="$event.stopPropagation()"
                >
                  <!-- Select All/None -->
                  <div class="flex justify-between p-2 border-b border-gray-200">
                    <button (click)="selectAllCategories()" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Select All</button>
                    <button (click)="selectNoCategories()" class="text-red-600 hover:text-red-800 text-sm font-medium">Select None</button>
                  </div>

                  <!-- Category Items -->
                  <div class="py-1">
                    <div *ngIf="categories.length === 0" class="px-3 py-2 text-sm text-gray-500">
                      No categories available
                    </div>
                    <div 
                      *ngFor="let category of categories"
                      class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      (click)="toggleCategory(category)"
                    >
                      <input
                        type="checkbox"
                        [checked]="isCategorySelected(category)"
                        (click)="$event.stopPropagation()"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-800">{{ category }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Organization Filter -->
            <div *ngIf="canFilterByOrganization()" class="flex-1 sm:flex-none sm:w-64">
              <label class="block text-sm font-medium text-gray-700 mb-2">Organizations</label>
              <app-hierarchical-multi-select
                [items]="organizations"
                [selectedItems]="selectedOrganizations"
                [placeholder]="'Select organizations...'"
                (selectionChange)="onOrganizationSelectionChange($event)"
              ></app-hierarchical-multi-select>
            </div>
            
            <!-- Search Input -->
            <div class="flex-1 sm:flex-none sm:w-80">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
                  (input)="onSearchInput($event)"
                  placeholder="Search tasks by title or description..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 w-full sm:w-auto">
            <!-- Clear Filters Button - Only show when filters are applied -->
            <button 
              *ngIf="selectedCategories.length > 0 || searchQuery || (canFilterByOrganization() && selectedOrganizations.length > 0)"
              (click)="clearFilters()"
              class="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Clear Filters
            </button>
            
            <!-- Add Task Button -->
            <button 
              *ngIf="canCreateTask()"
              (click)="showCreateTaskDialog()"
              class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- To Do Column -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              To Do ({{ kanbanTodoCount$ | async }})
        </h3>
          </div>
          <div 
            cdkDropList 
            id="todo-list"
            [cdkDropListData]="todoTasks"
            [cdkDropListConnectedTo]="['in-progress-list']"
            (cdkDropListDropped)="drop($event)"
            class="p-4 min-h-[400px] space-y-3 overflow-y-auto max-h-[600px]"
          >
            <!-- Loading State -->
            <div *ngIf="isLoading$ | async" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            
            <!-- Empty State -->
            <div *ngIf="!(isLoading$ | async) && todoTasks.length === 0" class="text-center text-gray-500 py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p class="mt-2 text-sm">No tasks to do</p>
            </div>
            <div 
              *ngFor="let task of todoTasks" 
              cdkDrag
              [cdkDragData]="task"
              [class.cursor-move]="canDragTask()"
              [class.hover\\:shadow-md]="canDragTask()"
              class="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-shadow duration-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ getTruncatedDescription(task.description) }}</p>
                  <div class="flex items-center mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ task.category }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-1 ml-2">
                  <button 
                    (click)="viewTaskDetails(task)"
                    class="text-green-600 hover:text-green-800 p-1"
                    title="View task details"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button 
                    *ngIf="canEditTask()"
                    (click)="editTask(task)"
                    class="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit task"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button 
                    *ngIf="canDeleteTask()"
                    (click)="deleteTask(task)"
                    [disabled]="isDeleting"
                    class="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete task"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
                </div>
              </div>
            </div>
            
            <!-- Infinite Scroll Trigger -->
            <div 
              *ngIf="hasMoreTasks['TODO'] && !(isLoading$ | async)"
              appIntersectionObserver
              class="h-4"
              (intersection)="onIntersection($event, 'TODO')"
            ></div>
            
            <!-- Infinite Scroll Loading Indicator -->
            <div *ngIf="isLoadingMore['TODO'] && !(isLoading$ | async)" class="flex items-center justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span class="ml-2 text-sm text-gray-600">Loading more tasks...</span>
            </div>
            
            <!-- No More Tasks Indicator -->
            <div *ngIf="!hasMoreTasks['TODO'] && !(isLoading$ | async) && todoTasks.length > 0" class="text-center text-gray-400 py-4">
              <p class="text-sm">No more tasks to load</p>
            </div>
        </div>
      </div>

        <!-- In Progress Column -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              In Progress ({{ kanbanInProgressCount$ | async }})
            </h3>
          </div>
          <div 
            cdkDropList 
            id="in-progress-list"
            [cdkDropListData]="inProgressTasks"
            [cdkDropListConnectedTo]="['todo-list', 'done-list']"
            (cdkDropListDropped)="drop($event)"
            class="p-4 min-h-[400px] space-y-3 overflow-y-auto max-h-[600px]"
          >
            <!-- Loading State -->
            <div *ngIf="isLoading$ | async" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
            
            <!-- Empty State -->
            <div *ngIf="!(isLoading$ | async) && inProgressTasks.length === 0" class="text-center text-gray-500 py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="mt-2 text-sm">No tasks in progress</p>
            </div>
            <div 
              *ngFor="let task of inProgressTasks" 
              cdkDrag
              [cdkDragData]="task"
              [class.cursor-move]="canDragTask()"
              [class.hover\\:shadow-md]="canDragTask()"
              class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 transition-shadow duration-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ getTruncatedDescription(task.description) }}</p>
                  <div class="flex items-center mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {{ task.category }}
        </span>
                  </div>
                </div>
                <div class="flex items-center space-x-1 ml-2">
                  <button 
                    (click)="viewTaskDetails(task)"
                    class="text-green-600 hover:text-green-800 p-1"
                    title="View task details"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button 
                    *ngIf="canEditTask()"
                    (click)="editTask(task)"
                    class="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit task"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button 
                    *ngIf="canDeleteTask()"
                    (click)="deleteTask(task)"
                    [disabled]="isDeleting"
                    class="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete task"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Infinite Scroll Trigger -->
            <div 
              *ngIf="hasMoreTasks['IN_PROGRESS'] && !(isLoading$ | async)"
              appIntersectionObserver
              class="h-4"
              (intersection)="onIntersection($event, 'IN_PROGRESS')"
            ></div>
            
            <!-- Infinite Scroll Loading Indicator -->
            <div *ngIf="isLoadingMore['IN_PROGRESS'] && !(isLoading$ | async)" class="flex items-center justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
              <span class="ml-2 text-sm text-gray-600">Loading more tasks...</span>
            </div>
            
            <!-- No More Tasks Indicator -->
            <div *ngIf="!hasMoreTasks['IN_PROGRESS'] && !(isLoading$ | async) && inProgressTasks.length > 0" class="text-center text-gray-400 py-4">
              <p class="text-sm">No more tasks to load</p>
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Done ({{ kanbanDoneCount$ | async }})
            </h3>
          </div>
          <div 
            cdkDropList 
            id="done-list"
            [cdkDropListData]="doneTasks"
            [cdkDropListConnectedTo]="['in-progress-list']"
            (cdkDropListDropped)="drop($event)"
            class="p-4 min-h-[400px] space-y-3 overflow-y-auto max-h-[600px]"
          >
            <!-- Loading State -->
            <div *ngIf="isLoading$ | async" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
            
            <!-- Empty State -->
            <div *ngIf="!(isLoading$ | async) && doneTasks.length === 0" class="text-center text-gray-500 py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="mt-2 text-sm">No completed tasks</p>
            </div>
            <div 
              *ngFor="let task of doneTasks" 
              cdkDrag
              [cdkDragData]="task"
              [class.cursor-move]="canDragTask()"
              [class.hover\\:shadow-md]="canDragTask()"
              class="bg-green-50 border border-green-200 rounded-lg p-4 transition-shadow duration-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 line-through">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ getTruncatedDescription(task.description) }}</p>
                  <div class="flex items-center mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ task.category }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-1 ml-2">
                  <button 
                    (click)="viewTaskDetails(task)"
                    class="text-green-600 hover:text-green-800 p-1"
                    title="View task details"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button 
                    *ngIf="canEditTask()"
                    (click)="editTask(task)"
                    class="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit task"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button 
                    *ngIf="canDeleteTask()"
                    (click)="deleteTask(task)"
                    [disabled]="isDeleting"
                    class="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete task"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Infinite Scroll Trigger -->
            <div 
              *ngIf="hasMoreTasks['DONE'] && !(isLoading$ | async)"
              appIntersectionObserver
              class="h-4"
              (intersection)="onIntersection($event, 'DONE')"
            ></div>
            
            <!-- Infinite Scroll Loading Indicator -->
            <div *ngIf="isLoadingMore['DONE'] && !(isLoading$ | async)" class="flex items-center justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span class="ml-2 text-sm text-gray-600">Loading more tasks...</span>
            </div>
            
            <!-- No More Tasks Indicator -->
            <div *ngIf="!hasMoreTasks['DONE'] && !(isLoading$ | async) && doneTasks.length > 0" class="text-center text-gray-400 py-4">
              <p class="text-sm">No more tasks to load</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Task Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-0 border-0 w-full max-w-2xl shadow-xl rounded-lg bg-white">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-xl font-semibold text-white">
              {{ isEditMode ? 'Edit Task' : 'Create New Task' }}
            </h3>
                  <p class="text-blue-100 text-sm">
                    {{ isEditMode ? 'Update task details and save changes' : 'Fill in the details to create a new task' }}
                  </p>
                </div>
              </div>
              <button 
                (click)="closeModal()"
                class="text-white hover:text-blue-200 transition-colors duration-200"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Modal Body -->
          <div class="px-6 py-6">
            
            <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
              <!-- Title Field -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    Task Title *
                  </span>
                </label>
                <input 
                  type="text" 
                  formControlName="title"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter a descriptive title for your task"
                />
                <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="mt-2 text-sm text-red-600">
                  Title is required and must be at least 3 characters long
                </div>
              </div>
              
              <!-- Description Field -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Description
                  </span>
                </label>
                <textarea 
                  formControlName="description"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Provide additional details about the task (optional)"
                ></textarea>
              </div>
              
              <!-- Category and Status Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- Category Field -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      Category *
                    </span>
                  </label>
                <select 
                  formControlName="category"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
                >
                    <option value="">Select a category</option>
                  <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
                </select>
                  <div *ngIf="taskForm.get('category')?.invalid && taskForm.get('category')?.touched" class="mt-2 text-sm text-red-600">
                    Please select a category
                  </div>
              </div>
              
                <!-- Status Field -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      Status *
                    </span>
                  </label>
                <select 
                  formControlName="status"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                </div>
              </div>
              
              <!-- Modal Footer -->
              <div class="bg-gray-50 px-6 py-4 rounded-b-lg -mx-6 -mb-6">
              <div class="flex justify-end space-x-3">
                <button 
                  type="button"
                  (click)="closeModal()"
                    class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                >
                    <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  Cancel
                </button>
                <button 
                  type="submit"
                  [disabled]="taskForm.invalid || isCreating || isUpdating"
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center"
                >
                    <svg *ngIf="!isCreating && !isUpdating" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                    <svg *ngIf="isCreating || isUpdating" class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {{ isEditMode ? (isUpdating ? 'Updating...' : 'Update Task') : (isCreating ? 'Creating...' : 'Create Task') }}
                </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Confirmation Dialog -->
      <app-confirmation-dialog
        [isOpen]="showDeleteConfirmation"
        title="Delete Task"
        [message]="deleteMessage"
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="confirmDelete()"
        (cancelled)="cancelDelete()">
      </app-confirmation-dialog>

      <!-- View Task Details Modal -->
      <div *ngIf="showViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-0 border-0 w-full max-w-2xl shadow-xl rounded-lg bg-white">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-xl font-semibold text-white">Task Details</h3>
                  <p class="text-blue-100 text-sm">View complete task information</p>
                </div>
              </div>
              <button 
                (click)="closeViewModal()"
                class="text-white hover:text-blue-200 transition-colors duration-200"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-6" *ngIf="taskToView">
            <div class="space-y-6">
              <!-- Task Title -->
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ taskToView.title }}</h2>
              </div>

              <!-- Task Description -->
              <div>
                <p class="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">{{ taskToView.description || 'No description provided' }}</p>
              </div>

              <!-- Task Details Grid -->
              <div class="flex flex-wrap gap-3">
                <!-- Category -->
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {{ taskToView.category }}
                </span>

                <!-- Status -->
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800': taskToView.status === 'TODO',
                        'bg-yellow-100 text-yellow-800': taskToView.status === 'IN_PROGRESS',
                        'bg-green-100 text-green-800': taskToView.status === 'DONE'
                      }">
                  {{ taskToView.status === 'TODO' ? 'To Do' : 
                     taskToView.status === 'IN_PROGRESS' ? 'In Progress' : 'Done' }}
                </span>
              </div>

              <!-- Task Metadata -->
              <div class="border-t pt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">Created:</span>
                    <span class="ml-2">{{ taskToView.createdAt | date:'medium' }}</span>
                  </div>
                  <div>
                    <span class="font-medium">Last Updated:</span>
                    <span class="ml-2">{{ taskToView.updatedAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
            <button 
              (click)="closeViewModal()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks$: Observable<ITask[]>;
  isLoading$: Observable<boolean>;
  
  // Stats observables
  totalTasks$: Observable<number>;
  todoCount$: Observable<number>;
  inProgressCount$: Observable<number>;
  doneCount$: Observable<number>;
  completionRate$: Observable<number>;
  
  // Kanban header counts (conditional: filtered when search/filter applied, global when not)
  kanbanTodoCount$: Observable<number>;
  kanbanInProgressCount$: Observable<number>;
  kanbanDoneCount$: Observable<number>;
  
  // Task arrays for kanban board
  allTasks: ITask[] = [];
  todoTasks: ITask[] = [];
  inProgressTasks: ITask[] = [];
  doneTasks: ITask[] = [];
  
  // Filter and search
  selectedCategories: string[] = [];
  searchQuery: string = '';
  categories: string[] = [];
  selectedOrganizations: string[] = [];
  
  // Current user information
  currentUser: any = null;
  userRole: string = '';
  organizations: HierarchicalItem[] = [];
  
  // Debounced search
  private searchSubject = new Subject<string>();
  
  // Category dropdown state
  isCategoryDropdownOpen: boolean = false;
  
  // Modal state
  showModal: boolean = false;
  isEditMode: boolean = false;
  taskForm: FormGroup;
  currentTask: ITask | null = null;
  
  // View modal state
  showViewModal: boolean = false;
  taskToView: ITask | null = null;
  
  // Confirmation dialog state
  showDeleteConfirmation: boolean = false;
  taskToDelete: ITask | null = null;
  get deleteMessage(): string {
    return `Are you sure you want to delete "${this.taskToDelete?.title || ''}"? This action cannot be undone.`;
  }
  
  // Loading states
  isCreating: boolean = false;
  isUpdating: boolean = false;
  isDeleting: boolean = false;
  isUpdatingStatus: boolean = false;
  
  // Infinite scroll states per column
  isLoadingMore: { [key: string]: boolean } = {
    'TODO': false,
    'IN_PROGRESS': false,
    'DONE': false
  };
  hasMoreTasks: { [key: string]: boolean } = {
    'TODO': true,
    'IN_PROGRESS': true,
    'DONE': true
  };
  currentOffset: { [key: string]: number } = {
    'TODO': 0,
    'IN_PROGRESS': 0,
    'DONE': 0
  };
  readonly TASKS_PER_LOAD: number = 5;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private tasksService: TasksService,
    private toastService: ToastService,
    private organizationService: OrganizationService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      status: ['TODO', Validators.required]
    });

    // Use real API observables
    this.tasks$ = this.store.select(TasksSelectors.selectAllTasks);
    this.isLoading$ = this.store.select(TasksSelectors.selectTasksLoading);
    
    // Top stats cards - use global database stats
    this.totalTasks$ = this.store.select(TasksSelectors.selectTotalTasksCount);
    this.todoCount$ = this.store.select(TasksSelectors.selectTodoCount);
    this.inProgressCount$ = this.store.select(TasksSelectors.selectInProgressCount);
    this.doneCount$ = this.store.select(TasksSelectors.selectDoneCount);
    
    // Calculate completion rate from global stats
    this.completionRate$ = this.store.select(TasksSelectors.selectTasksStats).pipe(
      map(stats => {
        if (stats.TOTAL === 0) return 0;
        return Math.round((stats.DONE / stats.TOTAL) * 100);
      })
    );
    
    // Kanban header counts - show filtered counts when filters applied, global counts when not
    this.kanbanTodoCount$ = combineLatest([
      this.tasks$,
      this.store.select(TasksSelectors.selectTodoCount)
    ]).pipe(
      map(([tasks, globalCount]) => {
        // If no filters applied (no search query, no categories, and no organizations), show global count
        // Also show global count if all categories are selected (equivalent to no category filter)
        const isAllCategoriesSelected = this.selectedCategories.length === this.categories.length && this.categories.length > 0;
        if (!this.searchQuery && (this.selectedCategories.length === 0 || isAllCategoriesSelected) && (!this.canFilterByOrganization() || this.selectedOrganizations.length === 0)) {
          return globalCount;
        }
        // If filters applied, show filtered count
        return tasks ? tasks.filter(task => task.status === TaskStatus.TODO).length : 0;
      })
    );
    
    this.kanbanInProgressCount$ = combineLatest([
      this.tasks$,
      this.store.select(TasksSelectors.selectInProgressCount)
    ]).pipe(
      map(([tasks, globalCount]) => {
        // If no filters applied, show global count
        // Also show global count if all categories are selected (equivalent to no category filter)
        const isAllCategoriesSelected = this.selectedCategories.length === this.categories.length && this.categories.length > 0;
        if (!this.searchQuery && (this.selectedCategories.length === 0 || isAllCategoriesSelected) && (!this.canFilterByOrganization() || this.selectedOrganizations.length === 0)) {
          return globalCount;
        }
        // If filters applied, show filtered count
        return tasks ? tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length : 0;
      })
    );
    
    this.kanbanDoneCount$ = combineLatest([
      this.tasks$,
      this.store.select(TasksSelectors.selectDoneCount)
    ]).pipe(
      map(([tasks, globalCount]) => {
        // If no filters applied, show global count
        // Also show global count if all categories are selected (equivalent to no category filter)
        const isAllCategoriesSelected = this.selectedCategories.length === this.categories.length && this.categories.length > 0;
        if (!this.searchQuery && (this.selectedCategories.length === 0 || isAllCategoriesSelected) && (!this.canFilterByOrganization() || this.selectedOrganizations.length === 0)) {
          return globalCount;
        }
        // If filters applied, show filtered count
        return tasks ? tasks.filter(task => task.status === TaskStatus.DONE).length : 0;
      })
    );
    
  }

  ngOnInit(): void {
    // Load current user information
    this.loadCurrentUser();
    
    // Reset pagination state
    this.currentOffset = { 'TODO': 0, 'IN_PROGRESS': 0, 'DONE': 0 };
    this.hasMoreTasks = { 'TODO': true, 'IN_PROGRESS': true, 'DONE': true };
    this.isLoadingMore = { 'TODO': false, 'IN_PROGRESS': false, 'DONE': false };
    
    // Load tasks from API
    this.store.dispatch(TasksActions.loadTasks({}));
    
    // Load stats from API
    this.store.dispatch(TasksActions.loadStats());
    
    // Load categories from API
    this.loadCategories();
    
    // Load organizations from API
    this.loadOrganizations();
    
    // Add document click listener to close category dropdown
    document.addEventListener('click', () => {
      this.isCategoryDropdownOpen = false;
    });
    
    this.subscriptions.add(
      this.tasks$.subscribe(tasks => {
        this.allTasks = tasks;
        this.organizeTasksByStatus(tasks);
      })
    );
    
    // Set up debounced search
    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if the value has changed
        switchMap(query => {
          this.searchQuery = query;
          return this.performSearch(query);
        })
      ).subscribe()
    );
  }

  loadCurrentUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.userRole = this.currentUser?.role || '';
      } catch (error) {
        this.currentUser = null;
        this.userRole = '';
      }
    }
  }

  canEditTask(): boolean {
    return this.userRole !== 'VIEWER';
  }

  canDeleteTask(): boolean {
    return this.userRole !== 'VIEWER';
  }

  canCreateTask(): boolean {
    return this.userRole !== 'VIEWER';
  }

  canDragTask(): boolean {
    return this.userRole !== 'VIEWER';
  }

  canFilterByOrganization(): boolean {
    return this.userRole === 'OWNER';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCategories(): void {
    this.tasksService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        // Fallback to empty array if API fails
        this.categories = [];
      }
    });
  }

  loadOrganizations(): void {
    // Only load organizations if user can filter by organization (OWNER role)
    if (!this.canFilterByOrganization()) {
      this.organizations = [];
      return;
    }
    
    this.organizationService.getHierarchy().subscribe({
      next: (organizations) => {
        this.organizations = this.convertToHierarchicalItems(organizations);
      },
      error: (error) => {
        console.error('Failed to load organizations:', error);
        this.organizations = [];
      }
    });
  }

  convertToHierarchicalItems(organizations: Organization[]): HierarchicalItem[] {
    return organizations.map(org => ({
      id: org.id,
      name: org.name,
      parentId: org.parentId,
      level: (org as any).level || 0, // Add level information
      children: (org as any).children ? this.convertToHierarchicalItems((org as any).children) : undefined
    }));
  }

  onOrganizationSelectionChange(selectedIds: string[]): void {
    this.selectedOrganizations = selectedIds;
    this.filterTasks();
  }

  organizeTasksByStatus(tasks: ITask[]): void {
    this.todoTasks = tasks.filter(task => task.status === TaskStatus.TODO);
    this.inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
    this.doneTasks = tasks.filter(task => task.status === TaskStatus.DONE);
  }


  filterTasks(): void {
    // Reset pagination state when filtering
    this.currentOffset = { 'TODO': 0, 'IN_PROGRESS': 0, 'DONE': 0 };
    this.hasMoreTasks = { 'TODO': true, 'IN_PROGRESS': true, 'DONE': true };
    this.isLoadingMore = { 'TODO': false, 'IN_PROGRESS': false, 'DONE': false };
    
    // Dispatch filter action to trigger backend search
    const filters = {
      category: this.selectedCategories.length === 1 ? this.selectedCategories[0] : undefined,
      categories: this.selectedCategories.length > 1 ? this.selectedCategories : undefined,
      q: this.searchQuery || undefined,
      orgIds: this.canFilterByOrganization() && this.selectedOrganizations.length > 0 ? this.selectedOrganizations : undefined,
      orgId: undefined, // Will be handled by backend based on user permissions
      status: undefined,
      sortBy: 'orderIndex',
      sortOrder: 'ASC' as 'ASC',
      limit: 5,
      offset: 0
    };
    
    this.store.dispatch(TasksActions.filterTasks({ filters }));
  }
  
  // Handle search input with debouncing
  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchSubject.next(query);
  }
  
  // Debounced search method
  private performSearch(query: string): Observable<any> {
    // Reset pagination state
    this.currentOffset = { 'TODO': 0, 'IN_PROGRESS': 0, 'DONE': 0 };
    this.hasMoreTasks = { 'TODO': true, 'IN_PROGRESS': true, 'DONE': true };
    this.isLoadingMore = { 'TODO': false, 'IN_PROGRESS': false, 'DONE': false };
    
    // Reset task arrays
    this.todoTasks = [];
    this.inProgressTasks = [];
    this.doneTasks = [];
    
    if (!query || query.trim() === '') {
      this.store.dispatch(TasksActions.clearFilters());
      this.store.dispatch(TasksActions.loadTasks({}));
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }
    
    // Dispatch filter action with search query
    const filters = {
      category: this.selectedCategories.length === 1 ? this.selectedCategories[0] : undefined,
      categories: this.selectedCategories.length > 1 ? this.selectedCategories : undefined,
      q: query.trim(),
      orgIds: this.canFilterByOrganization() && this.selectedOrganizations.length > 0 ? this.selectedOrganizations : undefined,
      orgId: undefined,
      status: undefined,
      sortBy: 'orderIndex',
      sortOrder: 'ASC' as 'ASC',
      limit: 5,
      offset: 0
    };
    
    this.store.dispatch(TasksActions.filterTasks({ filters }));
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }

  clearFilters(): void {
    // Reset filter values in UI
    this.selectedCategories = [];
    this.searchQuery = '';
    this.selectedOrganizations = [];
    this.isCategoryDropdownOpen = false;
    
    // Reset pagination state
    this.currentOffset = { 'TODO': 0, 'IN_PROGRESS': 0, 'DONE': 0 };
    this.hasMoreTasks = { 'TODO': true, 'IN_PROGRESS': true, 'DONE': true };
    this.isLoadingMore = { 'TODO': false, 'IN_PROGRESS': false, 'DONE': false };
    
    // Clear filters in store and load all tasks
    this.store.dispatch(TasksActions.clearFilters());
    this.store.dispatch(TasksActions.loadTasks({}));
  }

  showCreateTaskDialog(): void {
    this.isEditMode = false;
    this.currentTask = null;
    this.taskForm.reset({ status: 'TODO' });
    this.showModal = true;
  }

  editTask(task: ITask): void {
    this.isEditMode = true;
    this.currentTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.taskForm.reset();
    this.currentTask = null;
  }

  saveTask(): void {
    if (this.taskForm.valid && !this.isCreating && !this.isUpdating) {
      const taskData = this.taskForm.value;
      
      if (this.isEditMode && this.currentTask) {
        // Update existing task
        this.isUpdating = true;
        this.store.dispatch(TasksActions.updateTask({ 
          id: this.currentTask.id, 
          updates: taskData 
        }));
        
        // Listen for update operation completion
        const updateSub = this.store.select(TasksSelectors.selectTasksUpdating).subscribe(isUpdating => {
          if (!isUpdating && this.isUpdating) {
            // Update operation completed, check if it was successful
            const errorSub = this.store.select(TasksSelectors.selectTasksError).subscribe(error => {
            if (error) {
              this.toastService.error('Failed to update task. Please try again.');
              this.isUpdating = false;
                errorSub.unsubscribe();
                updateSub.unsubscribe();
              } else {
              this.toastService.success('Task updated successfully!');
              this.closeModal();
              this.isUpdating = false;
                // Reload stats to update counts
                this.store.dispatch(TasksActions.loadStats());
                errorSub.unsubscribe();
                updateSub.unsubscribe();
            }
            });
          }
        });
      } else {
        // Create new task
        this.isCreating = true;
        const createTaskDto = {
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          status: taskData.status
          // orgId will be handled by the backend based on user context
        };
        
        this.store.dispatch(TasksActions.createTask({ task: createTaskDto }));
        
        // Listen for create operation completion
        const createSub = this.store.select(TasksSelectors.selectTasksCreating).subscribe(isCreating => {
          if (!isCreating && this.isCreating) {
            // Create operation completed, check if it was successful
            const errorSub = this.store.select(TasksSelectors.selectTasksError).subscribe(error => {
            if (error) {
              this.toastService.error('Failed to create task. Please try again.');
              this.isCreating = false;
                errorSub.unsubscribe();
                createSub.unsubscribe();
              } else {
              this.toastService.success('Task created successfully!');
              this.closeModal();
              this.isCreating = false;
                // Reload stats to update counts
                this.store.dispatch(TasksActions.loadStats());
                errorSub.unsubscribe();
                createSub.unsubscribe();
            }
            });
          }
        });
      }
    }
  }

  deleteTask(task: ITask): void {
    if (!this.isDeleting) {
      this.taskToDelete = task;
      this.showDeleteConfirmation = true;
    }
  }

  confirmDelete(): void {
    if (this.taskToDelete && !this.isDeleting) {
      this.isDeleting = true;
      this.showDeleteConfirmation = false;
      
      this.store.dispatch(TasksActions.deleteTask({ id: this.taskToDelete.id }));
      
      // Listen for delete operation completion
      const deleteSub = this.store.select(TasksSelectors.selectTasksDeleting).subscribe(isDeleting => {
        if (!isDeleting && this.isDeleting) {
          // Delete operation completed, check if it was successful
          const errorSub = this.store.select(TasksSelectors.selectTasksError).subscribe(error => {
          if (error) {
            this.toastService.error('Failed to delete task. Please try again.');
            this.isDeleting = false;
              errorSub.unsubscribe();
              deleteSub.unsubscribe();
            } else {
            this.toastService.success('Task deleted successfully!');
            this.isDeleting = false;
              // Reload stats to update counts
              this.store.dispatch(TasksActions.loadStats());
              errorSub.unsubscribe();
              deleteSub.unsubscribe();
            }
          });
        }
      });
      
      this.taskToDelete = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.taskToDelete = null;
  }

  drop(event: CdkDragDrop<ITask[]>): void {
    // Check if user can edit tasks
    if (!this.canEditTask()) {
      return;
    }
    
    const task = event.item.data;
    const newStatus = this.getStatusFromListId(event.container.id);
    const newOrderIndex = event.currentIndex;
    
    // Update the UI immediately for better UX
    if (event.previousContainer === event.container) {
      // Reordering within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    
    // Update order_index and status in the backend
        this.isUpdatingStatus = true;
    
    this.tasksService.updateTaskOrder(task.id, newOrderIndex, newStatus).subscribe({
      next: (updatedTask) => {
        this.toastService.success('Task moved successfully!');
        this.isUpdatingStatus = false;
        // Reload tasks to get the updated order
        this.store.dispatch(TasksActions.loadTasks({}));
        // Reload stats to update counts
        this.store.dispatch(TasksActions.loadStats());
      },
      error: (error) => {
        this.toastService.error('Failed to move task. Please try again.');
        
        // Revert the UI change on error
        if (event.previousContainer === event.container) {
          // Revert reordering within the same list
          moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
        } else {
          // Revert moving between lists
              transferArrayItem(
                event.container.data,
                event.previousContainer.data,
                event.currentIndex,
                event.previousIndex
              );
            }
        
              this.isUpdatingStatus = false;
            }
    });
  }

  private getStatusFromListId(listId: string): TaskStatus {
    switch (listId) {
      case 'todo-list':
        return TaskStatus.TODO;
      case 'in-progress-list':
        return TaskStatus.IN_PROGRESS;
      case 'done-list':
        return TaskStatus.DONE;
      default:
        return TaskStatus.TODO;
    }
  }

  getTruncatedDescription(description: string | undefined): string {
    if (!description) {
      return 'No description';
    }
    if (description.length <= 200) {
      return description;
    }
    return description.substring(0, 200) + '...';
  }

  viewTaskDetails(task: ITask): void {
    this.taskToView = task;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.taskToView = null;
  }

  onIntersection(intersecting: boolean, status: string): void {
    if (intersecting) {
      this.loadMoreTasks(status);
    }
  }

  loadMoreTasks(status: string): void {
    if (this.isLoadingMore[status] || !this.hasMoreTasks[status]) {
      return;
    }

    this.isLoadingMore[status] = true;
    this.currentOffset[status] += this.TASKS_PER_LOAD;

    // Use getTasksByStatus with specific status for infinite scroll
    const filters = {
      status: status as any, // Pass the specific status
      orgId: this.canFilterByOrganization() && this.selectedOrganizations.length > 0 ? this.selectedOrganizations[0] : undefined,
      category: this.selectedCategories.length === 1 ? this.selectedCategories[0] : undefined,
      categories: this.selectedCategories.length > 1 ? this.selectedCategories : undefined,
      q: this.searchQuery && this.searchQuery.trim() !== '' ? this.searchQuery.trim() : undefined,
      sortBy: 'orderIndex',
      sortOrder: 'ASC' as 'ASC',
      limit: this.TASKS_PER_LOAD,
      offset: this.currentOffset[status]
    };

    this.tasksService.getTasksByStatus(filters).subscribe({
      next: (response) => {
        // When status is specified, response is directly the status data
        // When no status is specified, response has status objects
        let newTasks;
        if ((response as any).tasks) {
          // Direct status response (when status is specified)
          newTasks = (response as any).tasks;
        } else {
          // Multi-status response, extract the specific status
          const statusData = response[status as keyof typeof response];
          newTasks = statusData.tasks;
        }
        
        if (newTasks.length === 0) {
          this.hasMoreTasks[status] = false;
        } else {
          // Add new tasks to the appropriate column
          if (status === 'TODO') {
            this.todoTasks = [...this.todoTasks, ...newTasks];
          } else if (status === 'IN_PROGRESS') {
            this.inProgressTasks = [...this.inProgressTasks, ...newTasks];
          } else if (status === 'DONE') {
            this.doneTasks = [...this.doneTasks, ...newTasks];
          }
        }
        
        this.isLoadingMore[status] = false;
      },
      error: (error) => {
        console.error(`Error loading more ${status} tasks:`, error);
        this.isLoadingMore[status] = false;
        this.toastService.error('Failed to load more tasks');
      }
    });
  }

  // Category multi-select methods
  toggleCategoryDropdown(event: Event): void {
    event.stopPropagation();
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  getCategoryDisplayText(): string {
    if (this.selectedCategories.length === 0) {
      return 'All Categories';
    } else if (this.selectedCategories.length === this.categories.length && this.categories.length > 0) {
      return 'All Categories'; // Show "All Categories" when all are selected
    } else if (this.selectedCategories.length === 1) {
      return this.selectedCategories[0];
    } else {
      return `${this.selectedCategories.length} categories selected`;
    }
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories = this.selectedCategories.filter(cat => cat !== category);
    } else {
      this.selectedCategories = [...this.selectedCategories, category];
    }
    this.filterTasks();
  }

  selectAllCategories(): void {
    this.selectedCategories = [...this.categories];
    this.filterTasks();
  }

  selectNoCategories(): void {
    this.selectedCategories = [];
    this.filterTasks();
  }
}