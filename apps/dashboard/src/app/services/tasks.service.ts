import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto, ITask } from '../models/data.types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(filters?: TaskFilterDto): Observable<{
    tasks: ITask[];
    total: number;
    hasMore: boolean;
  }> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilterDto];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{
      tasks: ITask[];
      total: number;
      hasMore: boolean;
    }>(this.apiUrl, { params });
  }

  getTask(id: string): Observable<ITask> {
    return this.http.get<ITask>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<ITask> {
    return this.http.post<ITask>(this.apiUrl, task);
  }

  updateTask(id: string, updates: UpdateTaskDto): Observable<ITask> {
    return this.http.patch<ITask>(`${this.apiUrl}/${id}`, updates);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getTasksByStatus(filters?: TaskFilterDto): Observable<{
    TODO: { tasks: ITask[]; total: number; hasMore: boolean };
    IN_PROGRESS: { tasks: ITask[]; total: number; hasMore: boolean };
    DONE: { tasks: ITask[]; total: number; hasMore: boolean };
  }> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilterDto];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{
      TODO: { tasks: ITask[]; total: number; hasMore: boolean };
      IN_PROGRESS: { tasks: ITask[]; total: number; hasMore: boolean };
      DONE: { tasks: ITask[]; total: number; hasMore: boolean };
    }>(`${this.apiUrl}/by-status`, { params });
  }

  getTasksWithSearch(filters?: TaskFilterDto): Observable<{
    TODO: { tasks: ITask[]; total: number; hasMore: boolean };
    IN_PROGRESS: { tasks: ITask[]; total: number; hasMore: boolean };
    DONE: { tasks: ITask[]; total: number; hasMore: boolean };
  }> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilterDto];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{
      TODO: { tasks: ITask[]; total: number; hasMore: boolean };
      IN_PROGRESS: { tasks: ITask[]; total: number; hasMore: boolean };
      DONE: { tasks: ITask[]; total: number; hasMore: boolean };
    }>(`${this.apiUrl}/search`, { params });
  }

  getTotalCounts(): Observable<{
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    TOTAL: number;
  }> {
    return this.http.get<{
      TODO: number;
      IN_PROGRESS: number;
      DONE: number;
      TOTAL: number;
    }>(`${this.apiUrl}/stats`);
  }

  updateTaskOrder(taskId: string, orderIndex: number, status: string): Observable<ITask> {
    return this.http.patch<ITask>(`${this.apiUrl}/${taskId}/order`, {
      orderIndex,
      status
    });
  }
}
