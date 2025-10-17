import { AuthState, initialAuthState } from './auth.state';
import { authReducer } from './auth.reducer';
import * as AuthActions from './auth.actions';

describe('AuthReducer', () => {
  it('should return the initial state', () => {
    const action = { type: 'Unknown' };
    const state = authReducer(initialAuthState, action);
    expect(state).toBe(initialAuthState);
  });

  it('should handle login action', () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    const action = AuthActions.login({ credentials });
    const state = authReducer(initialAuthState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loginSuccess action', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' };
    const token = 'mock-token';
    const response = { accessToken: token, user };
    const action = AuthActions.loginSuccess({ response });
    const state = authReducer(initialAuthState, action);

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle loginFailure action', () => {
    const error = 'Invalid credentials';
    const action = AuthActions.loginFailure({ error });
    const state = authReducer(initialAuthState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle logout action', () => {
    const currentState: AuthState = {
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
      error: null
    };

    const action = AuthActions.logout();
    const state = authReducer(currentState, action);

    expect(state.user).toEqual(currentState.user); // User not cleared yet
    expect(state.token).toBe(currentState.token); // Token not cleared yet
    expect(state.isAuthenticated).toBe(true); // Still authenticated
    expect(state.isLoading).toBe(true); // Loading started
    expect(state.error).toBeNull();
  });

  it('should handle logoutSuccess action', () => {
    const currentState: AuthState = {
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: true,
      error: null
    };

    const action = AuthActions.logoutSuccess();
    const state = authReducer(currentState, action);

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle clearError action', () => {
    const currentState: AuthState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Some error'
    };

    const action = AuthActions.clearError();
    const state = authReducer(currentState, action);

    expect(state.error).toBeNull();
  });
});
