import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserRole = createSelector(
  selectAuthState,
  (state) => state.user?.role || 'VIEWER'
);

export const selectIsOwner = createSelector(
  selectUserRole,
  (role) => role === 'OWNER'
);

export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'ADMIN' || role === 'OWNER'
);

export const selectCanCreateTasks = createSelector(
  selectUserRole,
  (role) => role === 'ADMIN' || role === 'OWNER'
);

export const selectCanEditTasks = createSelector(
  selectUserRole,
  (role) => role === 'ADMIN' || role === 'OWNER'
);

export const selectCanDeleteTasks = createSelector(
  selectUserRole,
  (role) => role === 'ADMIN' || role === 'OWNER'
);

export const selectCanAccessAudit = createSelector(
  selectUserRole,
  (role) => role === 'ADMIN' || role === 'OWNER'
);

export const selectCanAccessPermissions = createSelector(
  selectUserRole,
  (role) => role === 'OWNER'
);
