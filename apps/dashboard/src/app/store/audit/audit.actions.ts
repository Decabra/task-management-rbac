import { createAction, props } from '@ngrx/store';
import { IAuditLog } from '../../models/data.types';

// Load audit logs
export const loadAuditLogs = createAction(
  '[Audit] Load Audit Logs',
  props<{ orgId?: string; limit?: number; offset?: number }>()
);

export const loadAuditLogsSuccess = createAction(
  '[Audit] Load Audit Logs Success',
  props<{ logs: IAuditLog[]; total: number; hasMore: boolean }>()
);

export const loadAuditLogsFailure = createAction(
  '[Audit] Load Audit Logs Failure',
  props<{ error: string }>()
);

// Filter audit logs
export const filterAuditLogs = createAction(
  '[Audit] Filter Audit Logs',
  props<{ orgId?: string; action?: string; entity?: string; userId?: string }>()
);

// Clear audit logs
export const clearAuditLogs = createAction('[Audit] Clear Audit Logs');
