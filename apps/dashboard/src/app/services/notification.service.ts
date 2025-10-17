import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  showSuccess(title: string, message: string, duration = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  showError(title: string, message: string, duration = 8000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  showWarning(title: string, message: string, duration = 6000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  showInfo(title: string, message: string, duration = 4000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      timestamp: new Date()
    });
  }

  removeNotification(id: string): void {
    const notifications = this.notifications$.value.filter(n => n.id !== id);
    this.notifications$.next(notifications);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }

  private addNotification(notification: Notification): void {
    const notifications = [...this.notifications$.value, notification];
    this.notifications$.next(notifications);

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
