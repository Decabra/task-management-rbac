import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserPermission {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  userName?: string;
  organizationName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePermissionDto {
  userId: string;
  organizationId: string;
  role: string;
}

export interface UpdatePermissionDto {
  userId?: string;
  organizationId?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  // Transform backend response to frontend format
  private transformPermission(permission: any): UserPermission {
    return {
      id: permission.id,
      userId: permission.userId,
      organizationId: permission.orgId, // Map orgId to organizationId
      role: permission.role,
      userName: permission.userName,
      organizationName: permission.organizationName,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    };
  }

  create(permission: CreatePermissionDto): Observable<UserPermission> {
    // Transform frontend DTO to backend DTO format
    const backendDto = {
      userId: permission.userId,
      orgId: permission.organizationId, // Map organizationId to orgId
      role: permission.role
    };
    return this.http.post<any>(this.apiUrl, backendDto).pipe(
      map(response => this.transformPermission(response))
    );
  }

  findAll(): Observable<UserPermission[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(permissions => permissions.map(permission => this.transformPermission(permission)))
    );
  }

  findOne(id: string): Observable<UserPermission> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.transformPermission(response))
    );
  }

  update(id: string, permission: UpdatePermissionDto): Observable<UserPermission> {
    // For permission updates, only role can be changed
    // User and organization cannot be changed after permission creation
    const backendDto: any = {};
    if (permission.role !== undefined) backendDto.role = permission.role;
    
    return this.http.patch<any>(`${this.apiUrl}/${id}`, backendDto).pipe(
      map(response => this.transformPermission(response))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
