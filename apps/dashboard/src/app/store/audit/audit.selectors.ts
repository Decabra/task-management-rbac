import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuditState } from './audit.state';

export const selectAuditState = createFeatureSelector<AuditState>('audit');

export const selectAllAuditLogs = createSelector(
  selectAuditState,
  (state) => state.logs
);

export const selectAuditLogsLoading = createSelector(
  selectAuditState,
  (state) => state.isLoading
);

export const selectAuditLogsError = createSelector(
  selectAuditState,
  (state) => state.error
);

export const selectAuditLogsTotal = createSelector(
  selectAuditState,
  (state) => state.total
);

export const selectAuditLogsHasMore = createSelector(
  selectAuditState,
  (state) => state.hasMore
);

export const selectAuditLogsFilters = createSelector(
  selectAuditState,
  (state) => state.filters
);

export const selectAuditLogsByAction = (action: string) =>
  createSelector(selectAllAuditLogs, (logs) =>
    logs.filter((log) => log.action === action)
  );

export const selectAuditLogsByEntity = (entity: string) =>
  createSelector(selectAllAuditLogs, (logs) =>
    logs.filter((log) => log.entity === entity)
  );

export const selectAuditLogsByUser = (userId: string) =>
  createSelector(selectAllAuditLogs, (logs) =>
    logs.filter((log) => log.userId === userId)
  );
