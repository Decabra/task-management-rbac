import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
  level?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrganizationDto {
  name: string;
  parentId?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  parentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  create(organization: CreateOrganizationDto): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, organization);
  }

  findAll(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  getHierarchy(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.apiUrl}/hierarchy`);
  }

  findOne(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  update(id: string, organization: UpdateOrganizationDto): Observable<Organization> {
    return this.http.patch<Organization>(`${this.apiUrl}/${id}`, organization);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}