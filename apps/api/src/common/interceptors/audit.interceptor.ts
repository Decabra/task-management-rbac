import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from '../../modules/audit-log/audit-log.service';

/**
 * Interceptor to automatically log mutating operations
 * Logs create, update, delete actions for tasks
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, body, params } = request;

    // Determine action based on HTTP method
    let action: string | null = null;
    if (method === 'POST') action = 'create';
    else if (method === 'PATCH' || method === 'PUT') action = 'update';
    else if (method === 'DELETE') action = 'delete';

    // Only log mutating operations
    if (!action || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Extract entity info
          const entity = 'task';
          const entityId = response?.id || params?.id;
          const orgId = response?.orgId || body?.orgId;

          if (!entityId || !orgId) {
            return;
          }

          // Build metadata
          const meta: Record<string, any> = {};

          if (action === 'create') {
            meta.title = response?.title;
            meta.category = response?.category;
            meta.status = response?.status;
          } else if (action === 'update') {
            meta.updates = body;
          } else if (action === 'delete') {
            meta.deletedId = entityId;
          }

          // Log to audit system
          await this.auditLogService.log(
            user.id,
            orgId,
            action,
            entity,
            entityId,
            meta
          );
        } catch (error) {
          // Don't fail the request if audit logging fails
          console.error('Audit logging failed:', error);
        }
      })
    );
  }
}
