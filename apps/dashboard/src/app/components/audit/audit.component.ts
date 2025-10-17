import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../shared/navigation.component';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { IAuditLog } from '../../models/data.types';
import * as AuditActions from '../../store/audit/audit.actions';
import * as AuditSelectors from '../../store/audit/audit.selectors';
import * as AuthActions from '../../store/auth/auth.actions';
import * as AuthSelectors from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navigation></app-navigation>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <!-- Header Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
          <p class="text-gray-600">Track all system activities and changes</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading$ | async" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error$ | async as error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Audit Logs Table -->
        <div *ngIf="!(isLoading$ | async)" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Activity Log</h3>
            <p class="text-sm text-gray-600">All system activities and changes</p>
          </div>
          
          <div class="divide-y divide-gray-200">
            <div *ngFor="let log of auditLogs$ | async" class="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-4">
                  <!-- Action Badge -->
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800': log.action === 'create',
                            'bg-yellow-100 text-yellow-800': log.action === 'update',
                            'bg-red-100 text-red-800': log.action === 'delete'
                          }">
                      {{ log.action.toUpperCase() }}
                    </span>
                  </div>
                  
                  <!-- Log Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                      <h4 class="text-sm font-medium text-gray-900">
                        <ng-container *ngIf="log.entity === 'task'">
                          {{ log.taskTitle || ('Task #' + log.entityId) }}
                        </ng-container>
                        <ng-container *ngIf="log.entity !== 'task'">
                          {{ log.entity }} #{{ log.entityId }}
                        </ng-container>
                      </h4>
                    </div>
                    <div class="text-sm text-gray-500">
                      <span class="font-medium">User:</span> {{ log.userName || log.userId }} • 
                      <span class="font-medium">Org:</span> {{ log.organizationName || log.orgId }}
                    </div>
                    <div *ngIf="log.meta && hasMetaKeys(log.meta)" class="mt-2">
                      <div class="bg-gray-50 rounded-lg p-3">
                        <div class="text-xs font-medium text-gray-700 mb-1">Metadata:</div>
                        <div class="text-xs text-gray-600 font-mono">{{ log.meta | json }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Timestamp -->
                <div class="flex-shrink-0 text-sm text-gray-500">
                  {{ log.createdAt | date:'MMM d, y h:mm a' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="(auditLogs$ | async)?.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-3 text-sm font-medium text-gray-900">No audit logs</h3>
            <p class="mt-1 text-sm text-gray-500">No audit logs found for your organization</p>
          </div>


          <!-- Pagination Controls -->
          <div *ngIf="(auditLogs$ | async) && (auditLogs$ | async)!.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <!-- Page Info -->
              <div class="text-sm text-gray-700">
                Showing page {{ currentPage }} of {{ totalPages }}
                <span class="text-gray-500">({{ (total$ | async) }} total logs)</span>
              </div>

              <!-- Pagination Buttons -->
              <div class="flex items-center space-x-2">
                <!-- Previous Button -->
                <button
                  (click)="previousPage()"
                  [disabled]="currentPage === 1"
                  class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <!-- Page Numbers -->
                <div class="flex items-center space-x-1">
                  <button
                    *ngFor="let page of getPageNumbers()"
                    (click)="loadPage(page)"
                    [class]="page === currentPage 
                      ? 'px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md' 
                      : 'px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'"
                  >
                    {{ page }}
                  </button>
                </div>

                <!-- Next Button -->
                <button
                  (click)="nextPage()"
                  [disabled]="currentPage === totalPages"
                  class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class AuditComponent implements OnInit, OnDestroy {
  auditLogs$: Observable<IAuditLog[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  user$: Observable<any>;
  total$: Observable<number>;
  hasMore$: Observable<boolean>;
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  private subscription = new Subscription();

  constructor(private store: Store) {
    this.auditLogs$ = this.store.select(AuditSelectors.selectAllAuditLogs);
    this.isLoading$ = this.store.select(AuditSelectors.selectAuditLogsLoading);
    this.error$ = this.store.select(AuditSelectors.selectAuditLogsError);
    this.user$ = this.store.select(AuthSelectors.selectUser);
    this.total$ = this.store.select(AuditSelectors.selectAuditLogsTotal);
    this.hasMore$ = this.store.select(AuditSelectors.selectAuditLogsHasMore);
  }

  ngOnInit(): void {
        // Subscribe to total count to calculate total pages
        this.subscription.add(
          this.total$.subscribe(total => {
            this.totalPages = Math.ceil(total / this.pageSize);
          })
        );
    
    // Load first page of audit logs
    this.loadPage(1);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  hasMetaKeys(meta: any): boolean {
    return meta && typeof meta === 'object' && Object.keys(meta).length > 0;
  }

  loadPage(page: number): void {
    this.currentPage = page;
    const offset = (page - 1) * this.pageSize;
    this.store.dispatch(AuditActions.loadAuditLogs({ 
      limit: this.pageSize, 
      offset: offset 
    }));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
