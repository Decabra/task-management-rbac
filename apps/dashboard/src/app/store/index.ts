import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { authReducer, AuthState } from './auth/auth.reducer';
import { tasksReducer, TasksState } from './tasks/tasks.reducer';
import { auditReducer, AuditState } from './audit/audit.reducer';

export interface AppState {
  auth: AuthState;
  tasks: TasksState;
  audit: AuditState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  tasks: tasksReducer,
  audit: auditReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
