import { createAction, props } from '@ngrx/store';
import { LoginDto, LoginResponseDto } from '../../models/data.types';

// Login actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginDto }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: LoginResponseDto }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Token refresh actions
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ token: string }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure'
);

// Initialize auth from localStorage
export const initializeAuth = createAction('[Auth] Initialize Auth');

export const initializeAuthSuccess = createAction(
  '[Auth] Initialize Auth Success',
  props<{ user: any; token: string }>()
);

export const initializeAuthFailure = createAction('[Auth] Initialize Auth Failure');

// Clear error action
export const clearError = createAction('[Auth] Clear Error');
