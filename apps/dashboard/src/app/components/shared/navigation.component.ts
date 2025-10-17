import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../store/auth/auth.actions';
import * as AuthSelectors from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Navigation -->
          <div class="flex items-center">
            <!-- Logo -->
            <div class="flex items-center">
              <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 class="text-xl font-semibold text-gray-900">RBAC Task Manager</h1>
            </div>

            <!-- Navigation Links -->
            <div class="hidden sm:ml-8 sm:flex sm:space-x-1">
              <a 
                routerLink="/tasks" 
                routerLinkActive="bg-blue-50 text-blue-700 border-blue-200"
                class="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium border border-transparent transition-all duration-200"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Tasks
              </a>
              <a 
                *ngIf="canAccessAudit$ | async"
                routerLink="/audit" 
                routerLinkActive="bg-blue-50 text-blue-700 border-blue-200"
                class="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium border border-transparent transition-all duration-200"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Audit Logs
              </a>
              <a 
                *ngIf="canAccessPermissions$ | async"
                routerLink="/access-permissions" 
                routerLinkActive="bg-blue-50 text-blue-700 border-blue-200"
                class="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium border border-transparent transition-all duration-200"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                Access & Permissions
              </a>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- User Info -->
            <div class="flex items-center">
              <div class="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ (user$ | async)?.name?.charAt(0) }}
                </span>
              </div>
              <div class="ml-3 hidden sm:block">
                <p class="text-sm font-medium text-gray-900">{{ (user$ | async)?.name }}</p>
                <p class="text-xs text-gray-500">{{ (user$ | async)?.email }}</p>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              (click)="logout()"
              class="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 p-2 rounded-lg transition-colors duration-200"
              title="Log out"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavigationComponent implements OnInit {
  user$: Observable<any>;
  canAccessAudit$: Observable<boolean>;
  canAccessPermissions$: Observable<boolean>;

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.user$ = this.store.select(AuthSelectors.selectUser);
    this.canAccessAudit$ = this.store.select(AuthSelectors.selectCanAccessAudit);
    this.canAccessPermissions$ = this.store.select(AuthSelectors.selectCanAccessPermissions);
  }

  ngOnInit(): void {}

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}