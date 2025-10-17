import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';

export type { AuthState };
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.accessToken,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error,
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })),

  // Token refresh
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    token,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.refreshTokenFailure, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: 'Token refresh failed',
  })),

  // Initialize auth
  on(AuthActions.initializeAuth, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.initializeAuthSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.initializeAuthFailure, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })),

  // Clear error
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
