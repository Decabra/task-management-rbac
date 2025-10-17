import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { CreateTaskDto, TaskStatus } from '../../models/data.types';
import * as TasksActions from '../../store/tasks/tasks.actions';
import * as TasksSelectors from '../../store/tasks/tasks.selectors';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="close()"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ isEdit ? 'Edit Task' : 'Create New Task' }}
                  </h3>
                  
                  <div class="space-y-4">
                    <!-- Title -->
                    <div>
                      <label for="title" class="label">Title</label>
                      <input
                        type="text"
                        id="title"
                        formControlName="title"
                        class="input"
                        placeholder="Enter task title"
                      />
                      <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="text-red-500 text-sm mt-1">
                        Title is required and must be at least 3 characters
                      </div>
                    </div>

                    <!-- Description -->
                    <div>
                      <label for="description" class="label">Description</label>
                      <textarea
                        id="description"
                        formControlName="description"
                        class="input"
                        rows="3"
                        placeholder="Enter task description"
                      ></textarea>
                    </div>

                    <!-- Category -->
                    <div>
                      <label for="category" class="label">Category</label>
                      <input
                        type="text"
                        id="category"
                        formControlName="category"
                        class="input"
                        placeholder="Enter category"
                        list="categories"
                      />
                      <datalist id="categories">
                        <option *ngFor="let category of categories$ | async" [value]="category">
                      </datalist>
                      <div *ngIf="taskForm.get('category')?.invalid && taskForm.get('category')?.touched" class="text-red-500 text-sm mt-1">
                        Category is required
                      </div>
                    </div>

                    <!-- Status -->
                    <div>
                      <label for="status" class="label">Status</label>
                      <select id="status" formControlName="status" class="input">
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>

                    <!-- Organization -->
                    <div>
                      <label for="orgId" class="label">Organization</label>
                      <select id="orgId" formControlName="orgId" class="input">
                        <option value="">Select Organization</option>
                        <option *ngFor="let org of organizations" [value]="org.id">
                          {{ org.name }}
                        </option>
                      </select>
                      <div *ngIf="taskForm.get('orgId')?.invalid && taskForm.get('orgId')?.touched" class="text-red-500 text-sm mt-1">
                        Organization is required
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                [disabled]="taskForm.invalid || (isCreating$ | async)"
                class="btn-primary w-full sm:w-auto sm:ml-3"
              >
                <span *ngIf="isCreating$ | async">Creating...</span>
                <span *ngIf="!(isCreating$ | async)">{{ isEdit ? 'Update' : 'Create' }}</span>
              </button>
              <button
                type="button"
                (click)="close()"
                class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() taskData?: any;
  @Output() closeModal = new EventEmitter<void>();

  taskForm: FormGroup;
  categories$: Observable<string[]>;
  organizations: Array<{id: string, name: string}> = [];
  isCreating$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private http: HttpClient
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', [Validators.required]],
      status: [TaskStatus.TODO],
      orgId: ['', [Validators.required]]
    });

    this.categories$ = this.store.select(TasksSelectors.selectCategories);
    this.isCreating$ = this.store.select(TasksSelectors.selectTasksCreating);
  }

  ngOnInit(): void {
    if (this.isEdit && this.taskData) {
      this.taskForm.patchValue(this.taskData);
    }
    
    // Load user's organizations
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    // Get user data from localStorage to determine their organization access
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Try to get organizations from the backend API
        this.http.get<{organizations: Array<{id: string, name: string}>}>(`${environment.apiUrl}/organizations`)
          .subscribe({
            next: (response) => {
              if (response.organizations && response.organizations.length > 0) {
                this.organizations = response.organizations;
                // Set the first organization as default
                this.taskForm.patchValue({ orgId: response.organizations[0].id });
              } else {
                this.organizations = [{ id: '', name: 'No organizations available' }];
              }
            },
            error: (error) => {
              this.organizations = [{ id: '', name: 'Unable to load organizations' }];
            }
          });
      } catch (error) {
        this.organizations = [{ id: '', name: 'Unable to load user data' }];
      }
    } else {
      this.organizations = [{ id: '', name: 'User not logged in' }];
    }
  }

  ngOnDestroy(): void {}

  onSubmit(): void {
    if (this.taskForm.valid) {
      const taskData: CreateTaskDto = this.taskForm.value;
      
      if (this.isEdit) {
        this.store.dispatch(TasksActions.updateTask({ 
          id: this.taskData.id, 
          updates: taskData 
        }));
      } else {
        this.store.dispatch(TasksActions.createTask({ task: taskData }));
      }
      
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
    this.taskForm.reset();
  }
}
