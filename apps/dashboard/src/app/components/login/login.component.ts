import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// Temporary interface - will be replaced with @libs/data
interface LoginDto {
  email: string;
  password: string;
}

import * as AuthActions from '../../store/auth/auth.actions';
import * as AuthSelectors from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <!-- Login Card -->
        <div class="bg-white shadow-lg rounded-lg">
          <!-- Header -->
          <div class="text-center p-6">
            <div class="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p class="text-lg text-gray-600">Sign in to your RBAC Task Management account</p>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="px-6 pb-6 space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="Enter your email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              />
              <p
                *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                Please enter a valid email address
              </p>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Enter your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              />
              <p
                *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                class="mt-1 text-sm text-red-600"
              >
                Password must be at least 6 characters
              </p>
            </div>

            <!-- Error Message -->
            <div
              *ngIf="error$ | async as error"
              class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md"
            >
              {{ error }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || (isLoading$ | async)"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              <span *ngIf="!(isLoading$ | async)">Sign In</span>
              <span *ngIf="isLoading$ | async" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            </button>
          </form>

          <!-- Test Credentials -->
          <div class="border-t border-gray-200 px-6 py-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              Test Credentials
            </h3>

            <!-- Owner Role -->
            <div class="mb-4">
              <div class="flex items-center mb-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  OWNER
                </span>
                <span class="ml-2 font-semibold text-gray-800">Full Access</span>
              </div>
              <div class="bg-blue-50 p-3 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-medium">Alice Owner:</span>
                  <span class="text-blue-600 font-mono text-sm">owner@acme.com / password123</span>
                </div>
              </div>
            </div>

            <!-- Admin Roles -->
            <div class="mb-4">
              <div class="flex items-center mb-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ADMIN
                </span>
                <span class="ml-2 font-semibold text-gray-800">Department Admins</span>
              </div>
              <div class="space-y-2">
                <div class="bg-green-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">Sales Admin:</span>
                    <span class="text-green-600 font-mono text-sm">sales-admin@acme.com / password123</span>
                  </div>
                </div>
                <div class="bg-green-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">Engineering Admin:</span>
                    <span class="text-green-600 font-mono text-sm">eng-admin@acme.com / password123</span>
                  </div>
                </div>
                <div class="bg-green-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">Marketing Admin:</span>
                    <span class="text-green-600 font-mono text-sm">marketing-admin@acme.com / password123</span>
                  </div>
                </div>
                <div class="bg-green-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">HR Admin:</span>
                    <span class="text-green-600 font-mono text-sm">hr-admin@acme.com / password123</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Viewer Roles -->
            <div>
              <div class="flex items-center mb-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  VIEWER
                </span>
                <span class="ml-2 font-semibold text-gray-800">Department Viewers</span>
              </div>
              <div class="space-y-2">
                <div class="bg-purple-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">Sales Rep:</span>
                    <span class="text-purple-600 font-mono text-sm">sales-rep@acme.com / password123</span>
                  </div>
                </div>
                <div class="bg-purple-50 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">Junior Dev:</span>
                    <span class="text-purple-600 font-mono text-sm">junior-dev@acme.com / password123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.isLoading$ = this.store.select(AuthSelectors.selectIsLoading);
    this.error$ = this.store.select(AuthSelectors.selectError);
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    this.store.dispatch(AuthActions.initializeAuth());
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: LoginDto = this.loginForm.value;
      this.store.dispatch(AuthActions.login({ credentials }));
    }
  }
}