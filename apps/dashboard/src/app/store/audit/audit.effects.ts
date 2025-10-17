import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as AuditActions from './audit.actions';
import { AuditService } from '../../services/audit.service';

@Injectable()
export class AuditEffects {
  private actions$ = inject(Actions);
  private auditService = inject(AuditService);

  // Load audit logs effect
  loadAuditLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuditActions.loadAuditLogs),
      switchMap(({ orgId, limit, offset }) =>
        this.auditService.getAuditLogs(orgId, limit, offset).pipe(
          map((response) =>
            AuditActions.loadAuditLogsSuccess({
              logs: response.logs,
              total: response.total,
              hasMore: response.hasMore,
            })
          ),
          catchError((error) =>
            of(AuditActions.loadAuditLogsFailure({ error: error.message || 'Failed to load audit logs' }))
          )
        )
      )
    )
  );
}
