import { createReducer, on } from '@ngrx/store';
import { AuditState, initialAuditState } from './audit.state';

export type { AuditState };
import * as AuditActions from './audit.actions';

export const auditReducer = createReducer(
  initialAuditState,

  // Load audit logs
  on(AuditActions.loadAuditLogs, (state, { orgId, limit, offset }) => ({
    ...state,
    isLoading: true,
    error: null,
    filters: {
      ...state.filters,
      ...(orgId && { orgId }),
      ...(limit && { limit }),
      ...(offset && { offset }),
    },
  })),

  on(AuditActions.loadAuditLogsSuccess, (state, { logs, total, hasMore }) => ({
    ...state,
    logs,
    total,
    hasMore,
    isLoading: false,
    error: null,
  })),

  on(AuditActions.loadAuditLogsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Filter audit logs
  on(AuditActions.filterAuditLogs, (state, filters) => ({
    ...state,
    filters: { ...state.filters, ...filters },
  })),

  // Clear audit logs
  on(AuditActions.clearAuditLogs, (state) => ({
    ...state,
    logs: [],
    total: 0,
    hasMore: false,
    error: null,
  }))
);
