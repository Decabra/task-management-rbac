import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAuditLog } from '../models/data.types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly apiUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAuditLogs(
    orgId?: string,
    limit?: number,
    offset?: number
  ): Observable<{
    logs: IAuditLog[];
    total: number;
    hasMore: boolean;
  }> {
    let params = new HttpParams();
    
    if (orgId) params = params.set('orgId', orgId);
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    return this.http.get<{
      logs: IAuditLog[];
      total: number;
      hasMore: boolean;
    }>(this.apiUrl, { params });
  }
}
