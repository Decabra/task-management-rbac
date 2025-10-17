import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthSelectors from '../../store/auth/auth.selectors';
import { UserService, User, CreateUserDto, UpdateUserDto } from '../../services/user.service';
import { OrganizationService, Organization, CreateOrganizationDto, UpdateOrganizationDto } from '../../services/organization.service';
import { PermissionService, UserPermission, CreatePermissionDto, UpdatePermissionDto } from '../../services/permission.service';
import { ToastService } from '../../services/toast.service';
import { NavigationComponent } from '../shared/navigation.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog.component';


@Component({
  selector: 'app-access-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavigationComponent, ConfirmationDialogComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Access Control -->
        <div *ngIf="!canAccessPermissions()" class="bg-white shadow rounded-lg p-8 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p class="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p class="text-sm text-gray-500">Only OWNER role users can manage users, organizations, and permissions.</p>
        </div>

        <!-- Main Content - Only for OWNER users -->
        <div *ngIf="canAccessPermissions()">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Access & Permissions</h1>
            <p class="mt-2 text-gray-600">Manage users, organizations, and permissions</p>
          </div>

        <!-- Users Section -->
        <div class="bg-white shadow rounded-lg mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">Users</h2>
              <button
                (click)="openUserModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add User
              </button>
            </div>
            <!-- Search Input -->
            <div class="mb-4">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="usersSearchQuery" 
                  (input)="onUsersSearchChange()"
                  placeholder="Search users by name or email..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let user of filteredUsers">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="{
                            'bg-red-100 text-red-800': user.role === 'OWNER',
                            'bg-blue-100 text-blue-800': user.role === 'ADMIN',
                            'bg-green-100 text-green-800': user.role === 'VIEWER'
                          }">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="editUser(user)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      *ngIf="!isCurrentUser(user.id)"
                      (click)="deleteUser(user)"
                      class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      [disabled]="user.role === 'OWNER' || isDeletingUser"
                    >
                      {{ isDeletingUser ? 'Deleting...' : 'Delete' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination Controls -->
          <div class="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ (usersPageIndex * usersPageSize) + 1 }} to {{ Math.min((usersPageIndex + 1) * usersPageSize, usersTotalCount) }} of {{ usersTotalCount }} users
              </div>
              <div class="flex items-center space-x-2">
                <label class="text-sm text-gray-700">Rows per page:</label>
                <select 
                  [(ngModel)]="usersPageSize" 
                  (change)="onUsersPageChange({pageSize: usersPageSize, pageIndex: 0})"
                  class="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <div class="flex items-center space-x-1">
                  <button 
                    (click)="onUsersPageChange({pageSize: usersPageSize, pageIndex: 0})"
                    [disabled]="usersPageIndex === 0"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button 
                    (click)="onUsersPageChange({pageSize: usersPageSize, pageIndex: usersPageIndex - 1})"
                    [disabled]="usersPageIndex === 0"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <span class="px-3 py-1 text-sm text-gray-700">
                    Page {{ usersPageIndex + 1 }} of {{ Math.ceil(usersTotalCount / usersPageSize) }}
                  </span>
                  <button 
                    (click)="onUsersPageChange({pageSize: usersPageSize, pageIndex: usersPageIndex + 1})"
                    [disabled]="usersPageIndex >= Math.ceil(usersTotalCount / usersPageSize) - 1"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                  <button 
                    (click)="onUsersPageChange({pageSize: usersPageSize, pageIndex: Math.ceil(usersTotalCount / usersPageSize) - 1})"
                    [disabled]="usersPageIndex >= Math.ceil(usersTotalCount / usersPageSize) - 1"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Organizations Section -->
        <div class="bg-white shadow rounded-lg mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">Organizations</h2>
              <button
                (click)="openOrganizationModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Organization
              </button>
            </div>
            <!-- Search Input -->
            <div class="mb-4">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="organizationsSearchQuery" 
                  (input)="onOrganizationsSearchChange()"
                  placeholder="Search organizations by name or parent..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Organization</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let org of filteredOrganizations">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ org.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ org.parentName || 'Root Organization' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="editOrganization(org)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      (click)="deleteOrganization(org)"
                      class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      [disabled]="isDeletingOrganization"
                    >
                      {{ isDeletingOrganization ? 'Deleting...' : 'Delete' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination Controls -->
          <div class="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ (organizationsPageIndex * organizationsPageSize) + 1 }} to {{ Math.min((organizationsPageIndex + 1) * organizationsPageSize, organizationsTotalCount) }} of {{ organizationsTotalCount }} organizations
              </div>
              <div class="flex items-center space-x-2">
                <label class="text-sm text-gray-700">Rows per page:</label>
                <select 
                  [(ngModel)]="organizationsPageSize" 
                  (change)="onOrganizationsPageChange({pageSize: organizationsPageSize, pageIndex: 0})"
                  class="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <div class="flex items-center space-x-1">
                  <button 
                    (click)="onOrganizationsPageChange({pageSize: organizationsPageSize, pageIndex: 0})"
                    [disabled]="organizationsPageIndex === 0"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button 
                    (click)="onOrganizationsPageChange({pageSize: organizationsPageSize, pageIndex: organizationsPageIndex - 1})"
                    [disabled]="organizationsPageIndex === 0"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <span class="px-3 py-1 text-sm text-gray-700">
                    Page {{ organizationsPageIndex + 1 }} of {{ Math.ceil(organizationsTotalCount / organizationsPageSize) }}
                  </span>
                  <button 
                    (click)="onOrganizationsPageChange({pageSize: organizationsPageSize, pageIndex: organizationsPageIndex + 1})"
                    [disabled]="organizationsPageIndex >= Math.ceil(organizationsTotalCount / organizationsPageSize) - 1"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                  <button 
                    (click)="onOrganizationsPageChange({pageSize: organizationsPageSize, pageIndex: Math.ceil(organizationsTotalCount / organizationsPageSize) - 1})"
                    [disabled]="organizationsPageIndex >= Math.ceil(organizationsTotalCount / organizationsPageSize) - 1"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Permissions Section -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">User Permissions</h2>
              <button
                (click)="openPermissionModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Permission
              </button>
            </div>
            <!-- Search Input -->
            <div class="mb-4">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="permissionsSearchQuery" 
                  (input)="onPermissionsSearchChange()"
                  placeholder="Search permissions by user, organization, or role..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let permission of filteredUserPermissions">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ permission.userName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ permission.organizationName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="{
                            'bg-red-100 text-red-800': permission.role === 'OWNER',
                            'bg-blue-100 text-blue-800': permission.role === 'ADMIN',
                            'bg-green-100 text-green-800': permission.role === 'VIEWER'
                          }">
                      {{ permission.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      *ngIf="!isCurrentUser(permission.userId)"
                      (click)="editPermission(permission)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      *ngIf="!isCurrentUser(permission.userId)"
                      (click)="deletePermission(permission)"
                      class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      [disabled]="isDeletingPermission"
                    >
                      {{ isDeletingPermission ? 'Deleting...' : 'Delete' }}
                    </button>
                    <span *ngIf="isCurrentUser(permission.userId)" class="text-gray-500 text-sm">
                      Cannot modify own permissions
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination Controls -->
          <div class="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ (permissionsPageIndex * permissionsPageSize) + 1 }} to {{ Math.min((permissionsPageIndex + 1) * permissionsPageSize, permissionsTotalCount) }} of {{ permissionsTotalCount }} permissions
              </div>
              <div class="flex items-center space-x-2">
                <label class="text-sm text-gray-700">Rows per page:</label>
                <select 
                  [(ngModel)]="permissionsPageSize" 
                  (change)="onPermissionsPageChange({pageSize: permissionsPageSize, pageIndex: 0})"
                  class="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <div class="flex items-center space-x-1">
                  <button 
                    (click)="onPermissionsPageChange({pageSize: permissionsPageSize, pageIndex: 0})"
                    [disabled]="permissionsPageIndex === 0"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    First
                  </button>
                  <button 
                    (click)="onPermissionsPageChange({pageSize: permissionsPageSize, pageIndex: permissionsPageIndex - 1})"
                    [disabled]="permissionsPageIndex === 0"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <span class="px-3 py-1 text-sm text-gray-700">
                    Page {{ permissionsPageIndex + 1 }} of {{ Math.ceil(permissionsTotalCount / permissionsPageSize) }}
                  </span>
                  <button 
                    (click)="onPermissionsPageChange({pageSize: permissionsPageSize, pageIndex: permissionsPageIndex + 1})"
                    [disabled]="permissionsPageIndex >= Math.ceil(permissionsTotalCount / permissionsPageSize) - 1"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                  <button 
                    (click)="onPermissionsPageChange({pageSize: permissionsPageSize, pageIndex: Math.ceil(permissionsTotalCount / permissionsPageSize) - 1})"
                    [disabled]="permissionsPageIndex >= Math.ceil(permissionsTotalCount / permissionsPageSize) - 1"
                    class="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Modal -->
        <div *ngIf="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-10 mx-auto p-0 border-0 w-full max-w-2xl shadow-xl rounded-lg bg-white">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-xl font-semibold text-white">
                      {{ editingUser ? 'Edit User' : 'Add New User' }}
                    </h3>
                    <p class="text-blue-100 text-sm">
                      {{ editingUser ? 'Update user details and save changes' : 'Fill in the details to create a new user' }}
                    </p>
                  </div>
                </div>
                <button 
                  (click)="closeUserModal()"
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
              <form [formGroup]="userForm" (ngSubmit)="saveUser()">
                <!-- Name Field -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Full Name *
                    </span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="name"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter the user's full name"
                  />
                  <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="mt-2 text-sm text-red-600">
                    Name is required and must be at least 2 characters long
                  </div>
                </div>
                
                <!-- Email Field -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      Email Address *
                    </span>
                  </label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter the user's email address"
                  />
                  <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="mt-2 text-sm text-red-600">
                    Please enter a valid email address
                  </div>
                </div>
                
                <!-- Password Fields (only for new users) -->
                <div *ngIf="!editingUser" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <!-- Password Field -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3">
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Password *
                      </span>
                    </label>
                    <input 
                      type="password" 
                      formControlName="password"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter a secure password"
                    />
                    <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="mt-2 text-sm text-red-600">
                      Password is required and must be at least 6 characters long
                    </div>
                  </div>
                  
                  <!-- Confirm Password Field -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3">
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Confirm Password *
                      </span>
                    </label>
                    <input 
                      type="password" 
                      formControlName="confirmPassword"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Confirm the password"
                    />
                     <div *ngIf="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched" class="mt-2 text-sm text-red-600">
                       <div *ngIf="userForm.get('confirmPassword')?.errors?.['required']">Please confirm the password</div>
                       <div *ngIf="userForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</div>
                     </div>
                  </div>
                </div>
                
                <!-- Modal Footer -->
                <div class="bg-gray-50 px-6 py-4 rounded-b-lg -mx-6 -mb-6">
                  <div class="flex justify-end space-x-3">
                    <button 
                      type="button"
                      (click)="closeUserModal()"
                      class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                    >
                      <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Cancel
                    </button>
                     <button
                       type="submit"
                       [disabled]="userForm.invalid || isCreatingUser || isUpdatingUser"
                       class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center"
                     >
                       <svg *ngIf="!editingUser && !isCreatingUser" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                       </svg>
                       <svg *ngIf="editingUser && !isUpdatingUser" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                       </svg>
                       <svg *ngIf="isCreatingUser || isUpdatingUser" class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                       </svg>
                       {{ editingUser ? (isUpdatingUser ? 'Updating...' : 'Update User') : (isCreatingUser ? 'Creating...' : 'Create User') }}
                     </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Organization Modal -->
        <div *ngIf="showOrganizationModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-10 mx-auto p-0 border-0 w-full max-w-2xl shadow-xl rounded-lg bg-white">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-xl font-semibold text-white">
                      {{ editingOrganization ? 'Edit Organization' : 'Add New Organization' }}
                    </h3>
                    <p class="text-blue-100 text-sm">
                      {{ editingOrganization ? 'Update organization details and save changes' : 'Fill in the details to create a new organization' }}
                    </p>
                  </div>
                </div>
                <button 
                  (click)="closeOrganizationModal()"
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
              <form [formGroup]="organizationForm" (ngSubmit)="saveOrganization()">
                <!-- Name Field -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Organization Name *
                    </span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="name"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter the organization name"
                  />
                  <div *ngIf="organizationForm.get('name')?.invalid && organizationForm.get('name')?.touched" class="mt-2 text-sm text-red-600">
                    Organization name is required and must be at least 2 characters long
                  </div>
                </div>
                
                <!-- Parent Organization Field -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                      </svg>
                      Parent Organization
                    </span>
                  </label>
                  <select
                    formControlName="parentId"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
                  >
                    <option value="">Root Organization (No Parent)</option>
                    <option *ngFor="let org of availableParentOrganizations" [value]="org.id">
                      {{ org.name }}
                    </option>
                  </select>
                  <div class="mt-2 text-sm text-gray-600">
                    Select a parent organization if this organization should be a child of another organization
                  </div>
                </div>
                
                <!-- Modal Footer -->
                <div class="bg-gray-50 px-6 py-4 rounded-b-lg -mx-6 -mb-6">
                  <div class="flex justify-end space-x-3">
                    <button 
                      type="button"
                      (click)="closeOrganizationModal()"
                      class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                    >
                      <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Cancel
                    </button>
                     <button
                       type="submit"
                       [disabled]="organizationForm.invalid || isCreatingOrganization || isUpdatingOrganization"
                       class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center"
                     >
                       <svg *ngIf="!editingOrganization && !isCreatingOrganization" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                       </svg>
                       <svg *ngIf="editingOrganization && !isUpdatingOrganization" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                       </svg>
                       <svg *ngIf="isCreatingOrganization || isUpdatingOrganization" class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                       </svg>
                       {{ editingOrganization ? (isUpdatingOrganization ? 'Updating...' : 'Update Organization') : (isCreatingOrganization ? 'Creating...' : 'Create Organization') }}
                     </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Permission Modal -->
        <div *ngIf="showPermissionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-10 mx-auto p-0 border-0 w-full max-w-2xl shadow-xl rounded-lg bg-white">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-xl font-semibold text-white">
                      {{ editingPermission ? 'Edit Permission' : 'Add New Permission' }}
                    </h3>
                    <p class="text-blue-100 text-sm">
                      {{ editingPermission ? 'Update permission details and save changes' : 'Assign user permissions to organizations' }}
                    </p>
                  </div>
                </div>
                <button 
                  (click)="closePermissionModal()"
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
              <form [formGroup]="permissionForm" (ngSubmit)="savePermission()">
                <!-- User Field -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                      Select User *
                    </span>
                  </label>
                  <select
                    formControlName="userId"
                    [disabled]="!!editingPermission"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose a user to assign permissions</option>
                    <option *ngFor="let user of users" [value]="user.id">
                      {{ user.name }} ({{ user.email }})
                    </option>
                  </select>
                  <div *ngIf="permissionForm.get('userId')?.invalid && permissionForm.get('userId')?.touched" class="mt-2 text-sm text-red-600">
                    Please select a user
                  </div>
                </div>
                
                <!-- Organization Field -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Select Organization *
                    </span>
                  </label>
                  <select
                    formControlName="organizationId"
                    [disabled]="!!editingPermission"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose an organization</option>
                    <option *ngFor="let org of organizations" [value]="org.id">
                      {{ org.name }}
                    </option>
                  </select>
                  <div *ngIf="permissionForm.get('organizationId')?.invalid && permissionForm.get('organizationId')?.touched" class="mt-2 text-sm text-red-600">
                    Please select an organization
                  </div>
                </div>
                
                <!-- Role Field -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                      Select Role *
                    </span>
                  </label>
                  <select
                    formControlName="role"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
                  >
                    <option value="">Choose a role for this user</option>
                    <option *ngFor="let role of availableRoles" [value]="role">
                      {{ role }}
                    </option>
                  </select>
                  <div *ngIf="permissionForm.get('role')?.invalid && permissionForm.get('role')?.touched" class="mt-2 text-sm text-red-600">
                    Please select a role
                  </div>
                  <div class="mt-2 text-sm text-gray-600">
                    <strong>Role Permissions:</strong><br>
                    • <strong>OWNER:</strong> Full access to all features and data<br>
                    • <strong>ADMIN:</strong> Manage users and organizations, view all data<br>
                    • <strong>VIEWER:</strong> Read-only access to assigned organization data
                  </div>
                </div>
                
                <!-- Modal Footer -->
                <div class="bg-gray-50 px-6 py-4 rounded-b-lg -mx-6 -mb-6">
                  <div class="flex justify-end space-x-3">
                    <button 
                      type="button"
                      (click)="closePermissionModal()"
                      class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                    >
                      <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Cancel
                    </button>
                     <button
                       type="submit"
                       [disabled]="permissionForm.invalid || isCreatingPermission || isUpdatingPermission"
                       class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center"
                     >
                       <svg *ngIf="!editingPermission && !isCreatingPermission" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                       </svg>
                       <svg *ngIf="editingPermission && !isUpdatingPermission" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                       </svg>
                       <svg *ngIf="isCreatingPermission || isUpdatingPermission" class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                       </svg>
                       {{ editingPermission ? (isUpdatingPermission ? 'Updating...' : 'Update Permission') : (isCreatingPermission ? 'Creating...' : 'Create Permission') }}
                     </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <app-confirmation-dialog
      [isOpen]="showDeleteConfirmation"
      [title]="deleteType === 'user' ? 'Delete User' : deleteType === 'organization' ? 'Delete Organization' : 'Delete Permission'"
      [message]="deleteMessage"
      confirmText="Delete"
      cancelText="Cancel"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()">
    </app-confirmation-dialog>
  `,
})
export class AccessPermissionsComponent implements OnInit {
  // Make Math available in template
  Math = Math;
  
  // Confirmation Dialog Properties
  showDeleteConfirmation = false;
  deleteType: 'user' | 'organization' | 'permission' | null = null;
  itemToDelete: any = null;
  deleteMessage = '';
  
  // Current user information
  currentUser: any = null;
  userRole: string = '';
  
  // Data
  users: User[] = [];
  organizations: Organization[] = [];
  userPermissions: UserPermission[] = [];

  // Pagination and Search
  usersPageSize = 5;
  usersPageIndex = 0;
  usersTotalCount = 0;
  usersSearchQuery = '';

  organizationsPageSize = 5;
  organizationsPageIndex = 0;
  organizationsTotalCount = 0;
  organizationsSearchQuery = '';

  permissionsPageSize = 5;
  permissionsPageIndex = 0;
  permissionsTotalCount = 0;
  permissionsSearchQuery = '';

  // Filtered data for display
  filteredUsers: User[] = [];
  filteredOrganizations: Organization[] = [];
  filteredUserPermissions: UserPermission[] = [];

  // Loading states
  isCreatingUser = false;
  isUpdatingUser = false;
  isDeletingUser = false;
  isCreatingOrganization = false;
  isUpdatingOrganization = false;
  isDeletingOrganization = false;
  isCreatingPermission = false;
  isUpdatingPermission = false;
  isDeletingPermission = false;

  // Modal states
  showUserModal = false;
  showOrganizationModal = false;
  showPermissionModal = false;

  // Editing states
  editingUser: User | null = null;
  editingOrganization: Organization | null = null;
  editingPermission: UserPermission | null = null;

  // Forms
  userForm: FormGroup;
  organizationForm: FormGroup;
  permissionForm: FormGroup;

  // Available options
  availableParentOrganizations: Organization[] = [];
  availableRoles: string[] = [];

  // User role and current user
  userRole$: Observable<string>;
  currentUser$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private userService: UserService,
    private organizationService: OrganizationService,
    private permissionService: PermissionService,
    private toastService: ToastService
  ) {
    this.userRole$ = this.store.select(AuthSelectors.selectUserRole);
    this.currentUser$ = this.store.select(AuthSelectors.selectUser);
    
    // Initialize forms
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.organizationForm = this.fb.group({
      name: ['', Validators.required],
      parentId: ['']
    });

    this.permissionForm = this.fb.group({
      userId: ['', Validators.required],
      organizationId: ['', Validators.required],
      role: ['', Validators.required]
    });

    // Set up role-based available roles
    this.userRole$.subscribe(role => {
      if (role === 'OWNER') {
        this.availableRoles = ['ADMIN', 'VIEWER'];
      } else if (role === 'ADMIN') {
        this.availableRoles = ['VIEWER'];
      }
    });
  }

  isCurrentUser(userId: string): boolean {
    let isCurrent = false;
    this.currentUser$.subscribe(user => {
      isCurrent = user?.id === userId;
    }).unsubscribe();
    return isCurrent;
  }

  // Password match validator
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  // Extract error message from backend response
  getErrorMessage(error: any): string {
    // Handle different error response formats
    if (error?.error?.message) {
      return error.error.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error?.error) {
      return error.error.error;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    // Fallback to generic message
    return 'An unexpected error occurred. Please try again.';
  }

  // Pagination and Search Methods
  onUsersPageChange(event: any): void {
    this.usersPageSize = event.pageSize;
    this.usersPageIndex = event.pageIndex;
    this.applyUsersFilters();
  }

  onOrganizationsPageChange(event: any): void {
    this.organizationsPageSize = event.pageSize;
    this.organizationsPageIndex = event.pageIndex;
    this.applyOrganizationsFilters();
  }

  onPermissionsPageChange(event: any): void {
    this.permissionsPageSize = event.pageSize;
    this.permissionsPageIndex = event.pageIndex;
    this.applyPermissionsFilters();
  }

  onUsersSearchChange(): void {
    this.usersPageIndex = 0; // Reset to first page when searching
    this.applyUsersFilters();
  }

  onOrganizationsSearchChange(): void {
    this.organizationsPageIndex = 0; // Reset to first page when searching
    this.applyOrganizationsFilters();
  }

  onPermissionsSearchChange(): void {
    this.permissionsPageIndex = 0; // Reset to first page when searching
    this.applyPermissionsFilters();
  }

  applyUsersFilters(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.usersSearchQuery.trim()) {
      const query = this.usersSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Sort by created_at in descending order (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order
    });

    this.usersTotalCount = filtered.length;

    // Apply pagination
    const startIndex = this.usersPageIndex * this.usersPageSize;
    const endIndex = startIndex + this.usersPageSize;
    this.filteredUsers = filtered.slice(startIndex, endIndex);
  }

  applyOrganizationsFilters(): void {
    let filtered = [...this.organizations];

    // Apply search filter
    if (this.organizationsSearchQuery.trim()) {
      const query = this.organizationsSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(query) ||
        (org.parentName && org.parentName.toLowerCase().includes(query))
      );
    }

    // Sort by created_at in descending order (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order
    });

    this.organizationsTotalCount = filtered.length;

    // Apply pagination
    const startIndex = this.organizationsPageIndex * this.organizationsPageSize;
    const endIndex = startIndex + this.organizationsPageSize;
    this.filteredOrganizations = filtered.slice(startIndex, endIndex);
  }

  applyPermissionsFilters(): void {
    let filtered = [...this.userPermissions];

    // Apply search filter
    if (this.permissionsSearchQuery.trim()) {
      const query = this.permissionsSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(permission => 
        (permission.userName && permission.userName.toLowerCase().includes(query)) ||
        (permission.organizationName && permission.organizationName.toLowerCase().includes(query)) ||
        permission.role.toLowerCase().includes(query)
      );
    }

    // Sort by created_at in descending order (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order
    });

    this.permissionsTotalCount = filtered.length;

    // Apply pagination
    const startIndex = this.permissionsPageIndex * this.permissionsPageSize;
    const endIndex = startIndex + this.permissionsPageSize;
    this.filteredUserPermissions = filtered.slice(startIndex, endIndex);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadData();
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

  canAccessPermissions(): boolean {
    return this.userRole === 'OWNER';
  }

  loadData(): void {
    // Only load data if user can access permissions (OWNER role)
    if (!this.canAccessPermissions()) {
      this.users = [];
      this.organizations = [];
      this.userPermissions = [];
      return;
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found. Please log in first.');
      this.users = [];
      this.organizations = [];
      this.userPermissions = [];
      return;
    }
    
    // Load users
    this.userService.findAll().subscribe({
          next: (users) => {
            this.users = users;
            this.applyUsersFilters();
          },
      error: (error) => {
        console.error('Error loading users:', error);
        console.error('Error details:', error.status, error.message);
        if (error.status === 401) {
          console.error('Authentication failed. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
        }
        this.users = []; // Empty array instead of mock data
      }
    });

    // Load organizations
    this.organizationService.getHierarchy().subscribe({
          next: (organizations) => {
            this.organizations = organizations;
            // Ensure parentName is set for all organizations
            this.updateParentNames();
            this.updateAvailableParentOrganizations();
            this.applyOrganizationsFilters();
          },
      error: (error) => {
        console.error('Error loading organizations:', error);
        console.error('Error details:', error.status, error.message);
        if (error.status === 401) {
          console.error('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
        }
        this.organizations = []; // Empty array instead of mock data
        this.updateAvailableParentOrganizations();
      }
    });

    // Load user permissions
    this.permissionService.findAll().subscribe({
          next: (permissions) => {
            this.userPermissions = permissions;
            this.applyPermissionsFilters();
          },
      error: (error) => {
        console.error('Error loading permissions:', error);
        console.error('Error details:', error.status, error.message);
        if (error.status === 401) {
          console.error('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
        }
        this.userPermissions = []; // Empty array instead of mock data
      }
    });
  }

  updateParentNames(): void {
    // Update parentName for all organizations based on parentId
    this.organizations.forEach(org => {
      if (org.parentId && !org.parentName) {
        const parent = this.organizations.find(p => p.id === org.parentId);
        if (parent) {
          org.parentName = parent.name;
        }
      }
    });
  }

  updateAvailableParentOrganizations(): void {
    this.availableParentOrganizations = this.organizations.filter(org => 
      !this.editingOrganization || org.id !== this.editingOrganization.id
    );
  }

  // User methods
  openUserModal(): void {
    this.editingUser = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.showUserModal = true;
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.setValue('');
    this.userForm.get('confirmPassword')?.setValue('');
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.valid && !this.isCreatingUser && !this.isUpdatingUser) {
      const formValue = this.userForm.value;
      
      if (this.editingUser) {
        // Update existing user
        this.isUpdatingUser = true;
        const updateData: UpdateUserDto = {
          name: formValue.name,
          email: formValue.email
        };
        if (formValue.password) {
          updateData.password = formValue.password;
        }
        
        this.userService.update(this.editingUser.id, updateData).subscribe({
          next: (updatedUser) => {
            const index = this.users.findIndex(u => u.id === this.editingUser!.id);
            if (index !== -1) {
              this.users[index] = updatedUser;
            }
            this.applyUsersFilters();
            this.toastService.success('User updated successfully!');
            this.closeUserModal();
            this.isUpdatingUser = false;
          },
          error: (error) => {
            console.error('Error updating user:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error(errorMessage);
            this.isUpdatingUser = false;
          }
        });
      } else {
        // Create new user
        this.isCreatingUser = true;
        const createData: CreateUserDto = {
          name: formValue.name,
          email: formValue.email,
          password: formValue.password
        };
        
        this.userService.create(createData).subscribe({
          next: (newUser) => {
            this.users.push(newUser);
            this.applyUsersFilters();
            this.toastService.success('User created successfully!');
            this.closeUserModal();
            this.isCreatingUser = false;
          },
          error: (error) => {
            console.error('Error creating user:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error(errorMessage);
            this.isCreatingUser = false;
          }
        });
      }
    }
  }

  deleteUser(user: User): void {
    if (user.role !== 'OWNER' && !this.isDeletingUser) {
      this.itemToDelete = user;
      this.deleteType = 'user';
      this.deleteMessage = `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`;
      this.showDeleteConfirmation = true;
    }
  }

  // Organization methods
  openOrganizationModal(): void {
    this.editingOrganization = null;
    this.organizationForm.reset();
    this.updateAvailableParentOrganizations();
    this.showOrganizationModal = true;
  }

  editOrganization(org: Organization): void {
    this.editingOrganization = org;
    this.organizationForm.patchValue({
      name: org.name,
      parentId: org.parentId || ''
    });
    this.updateAvailableParentOrganizations();
    this.showOrganizationModal = true;
  }

  closeOrganizationModal(): void {
    this.showOrganizationModal = false;
    this.editingOrganization = null;
    this.organizationForm.reset();
  }

  saveOrganization(): void {
    if (this.organizationForm.valid && !this.isCreatingOrganization && !this.isUpdatingOrganization) {
      const formValue = this.organizationForm.value;
      
      if (this.editingOrganization) {
        // Update existing organization
        this.isUpdatingOrganization = true;
        const updateData: UpdateOrganizationDto = {
          name: formValue.name,
          parentId: formValue.parentId || undefined
        };
        
        this.organizationService.update(this.editingOrganization.id, updateData).subscribe({
          next: (updatedOrg) => {
            const index = this.organizations.findIndex(o => o.id === this.editingOrganization!.id);
            if (index !== -1) {
              // Update the parentName field based on the new parentId
              const parentName = formValue.parentId ? 
                this.organizations.find(o => o.id === formValue.parentId)?.name : undefined;
              this.organizations[index] = { 
                ...updatedOrg, 
                parentName 
              };
            }
            this.applyOrganizationsFilters();
            this.toastService.success('Organization updated successfully!');
            this.closeOrganizationModal();
            this.isUpdatingOrganization = false;
          },
          error: (error) => {
            console.error('Error updating organization:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error(errorMessage);
            this.isUpdatingOrganization = false;
          }
        });
      } else {
        // Create new organization
        this.isCreatingOrganization = true;
        const createData: CreateOrganizationDto = {
          name: formValue.name,
          parentId: formValue.parentId || undefined
        };
        
        this.organizationService.create(createData).subscribe({
          next: (newOrg) => {
            // Add the parentName field based on the selected parentId
            const parentName = formValue.parentId ? 
              this.organizations.find(o => o.id === formValue.parentId)?.name : undefined;
            const orgWithParentName = { 
              ...newOrg, 
              parentName 
            };
            this.organizations.push(orgWithParentName);
            this.applyOrganizationsFilters();
            this.toastService.success('Organization created successfully!');
            this.closeOrganizationModal();
            this.isCreatingOrganization = false;
          },
          error: (error) => {
            console.error('Error creating organization:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error(errorMessage);
            this.isCreatingOrganization = false;
          }
        });
      }
    }
  }

  deleteOrganization(org: Organization): void {
    if (!this.isDeletingOrganization) {
      this.itemToDelete = org;
      this.deleteType = 'organization';
      this.deleteMessage = `Are you sure you want to delete organization "${org.name}"? This action cannot be undone.`;
      this.showDeleteConfirmation = true;
    }
  }

  // Permission methods
  openPermissionModal(): void {
    this.editingPermission = null;
    this.permissionForm.reset();
    this.showPermissionModal = true;
  }

  editPermission(permission: UserPermission): void {
    this.editingPermission = permission;
    this.permissionForm.patchValue({
      userId: permission.userId,
      organizationId: permission.organizationId,
      role: permission.role
    });
    this.showPermissionModal = true;
  }

  closePermissionModal(): void {
    this.showPermissionModal = false;
    this.editingPermission = null;
    this.permissionForm.reset();
  }

  savePermission(): void {
    if (this.permissionForm.valid && !this.isCreatingPermission && !this.isUpdatingPermission) {
      const formValue = this.permissionForm.value;
      
      if (this.editingPermission) {
        // Update existing permission - only role can be changed
        this.isUpdatingPermission = true;
        const updateData: UpdatePermissionDto = {
          role: formValue.role
        };
        
        this.permissionService.update(this.editingPermission.id, updateData).subscribe({
          next: (updatedPermission) => {
            const index = this.userPermissions.findIndex(p => p.id === this.editingPermission!.id);
            if (index !== -1) {
              this.userPermissions[index] = updatedPermission;
            }
            this.applyPermissionsFilters();
            this.toastService.success('Permission updated successfully!');
            this.closePermissionModal();
            this.isUpdatingPermission = false;
          },
          error: (error) => {
            console.error('Error updating permission:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error(errorMessage);
            this.isUpdatingPermission = false;
          }
        });
      } else {
        // Create new permission
        this.isCreatingPermission = true;
        const createData: CreatePermissionDto = {
          userId: formValue.userId,
          organizationId: formValue.organizationId,
          role: formValue.role
        };
        
        this.permissionService.create(createData).subscribe({
          next: (newPermission) => {
            this.userPermissions.push(newPermission);
            this.applyPermissionsFilters();
            this.toastService.success('Permission created successfully!');
            this.closePermissionModal();
            this.isCreatingPermission = false;
          },
          error: (error) => {
            console.error('Error creating permission:', error);
            const errorMessage = this.getErrorMessage(error);
            this.toastService.error(errorMessage);
            this.isCreatingPermission = false;
          }
        });
      }
    }
  }

  deletePermission(permission: UserPermission): void {
    if (!this.isDeletingPermission) {
      this.itemToDelete = permission;
      this.deleteType = 'permission';
      this.deleteMessage = `Are you sure you want to delete this permission for "${permission.userName}" in "${permission.organizationName}"? This action cannot be undone.`;
      this.showDeleteConfirmation = true;
    }
  }

  // Confirmation Dialog Methods
  confirmDelete(): void {
    if (!this.itemToDelete || !this.deleteType) return;

    switch (this.deleteType) {
      case 'user':
        this.confirmDeleteUser();
        break;
      case 'organization':
        this.confirmDeleteOrganization();
        break;
      case 'permission':
        this.confirmDeletePermission();
        break;
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.deleteType = null;
    this.itemToDelete = null;
    this.deleteMessage = '';
  }

  private confirmDeleteUser(): void {
    if (this.itemToDelete && !this.isDeletingUser) {
      this.isDeletingUser = true;
      this.showDeleteConfirmation = false;
      
      this.userService.remove(this.itemToDelete.id).subscribe({
        next: () => {
          const index = this.users.findIndex(u => u.id === this.itemToDelete.id);
          if (index !== -1) {
            this.users.splice(index, 1);
          }
          this.applyUsersFilters();
          this.toastService.success('User deleted successfully!');
          this.isDeletingUser = false;
          this.itemToDelete = null;
          this.deleteType = null;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          const errorMessage = this.getErrorMessage(error);
          this.toastService.error(errorMessage);
          this.isDeletingUser = false;
        }
      });
    }
  }

  private confirmDeleteOrganization(): void {
    if (this.itemToDelete && !this.isDeletingOrganization) {
      this.isDeletingOrganization = true;
      this.showDeleteConfirmation = false;
      
      this.organizationService.remove(this.itemToDelete.id).subscribe({
        next: () => {
          const index = this.organizations.findIndex(o => o.id === this.itemToDelete.id);
          if (index !== -1) {
            this.organizations.splice(index, 1);
          }
          this.applyOrganizationsFilters();
          this.toastService.success('Organization deleted successfully!');
          this.isDeletingOrganization = false;
          this.itemToDelete = null;
          this.deleteType = null;
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
          const errorMessage = this.getErrorMessage(error);
          this.toastService.error(errorMessage);
          this.isDeletingOrganization = false;
        }
      });
    }
  }

  private confirmDeletePermission(): void {
    if (this.itemToDelete && !this.isDeletingPermission) {
      this.isDeletingPermission = true;
      this.showDeleteConfirmation = false;
      
      this.permissionService.remove(this.itemToDelete.id).subscribe({
        next: () => {
          const index = this.userPermissions.findIndex(p => p.id === this.itemToDelete.id);
          if (index !== -1) {
            this.userPermissions.splice(index, 1);
          }
          this.applyPermissionsFilters();
          this.toastService.success('Permission deleted successfully!');
          this.isDeletingPermission = false;
          this.itemToDelete = null;
          this.deleteType = null;
        },
        error: (error) => {
          console.error('Error deleting permission:', error);
          const errorMessage = this.getErrorMessage(error);
          this.toastService.error(errorMessage);
          this.isDeletingPermission = false;
        }
      });
    }
  }
}
