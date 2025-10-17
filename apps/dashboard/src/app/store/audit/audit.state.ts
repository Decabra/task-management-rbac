import { IAuditLog } from '../../models/data.types';

export interface AuditState {
  logs: IAuditLog[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  filters: {
    orgId?: string;
    action?: string;
    entity?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  };
}

export const initialAuditState: AuditState = {
  logs: [],
  total: 0,
  hasMore: false,
  isLoading: false,
  error: null,
  filters: {
    limit: 50,
    offset: 0,
  },
};
