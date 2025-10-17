export interface IAuditLog {
  id: string;
  userId: string;
  orgId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  entity: string;
  entityId: string;
  meta?: any;
  createdAt: string;
}
