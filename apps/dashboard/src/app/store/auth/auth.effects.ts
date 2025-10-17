import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Login effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message || 'Login failed' }))
          )
        )
      )
    )
  );

  // Login success effect
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          // Store token in localStorage
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
          // Navigate to tasks
          this.router.navigate(['/tasks']);
        })
      ),
    { dispatch: false }
  );

  // Logout effect
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Navigate to login
          this.router.navigate(['/login']);
        }),
        map(() => AuthActions.logoutSuccess())
      )
  );

  // Initialize auth effect
  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeAuth),
      map(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            // Validate token is not expired
            if (this.authService.isTokenValid()) {
              return AuthActions.initializeAuthSuccess({ user, token });
            } else {
              // Token is expired, clear localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              return AuthActions.initializeAuthFailure();
            }
          } catch (error) {
            // Invalid user data, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return AuthActions.initializeAuthFailure();
          }
        } else {
          return AuthActions.initializeAuthFailure();
        }
      })
    )
  );
}
