import { Injectable } from '@angular/core';

export interface ToastOptions {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: ToastOptions[] = [];

  show(options: ToastOptions): void {
    const toast: ToastOptions = {
      duration: 5000,
      ...options
    };
    
    this.toasts.push(toast);
    
    // Auto remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, toast.duration);
    }
  }

  success(message: string, title?: string): void {
    this.show({ message, title, type: 'success' });
  }

  error(message: string, title?: string): void {
    this.show({ message, title, type: 'error' });
  }

  warning(message: string, title?: string): void {
    this.show({ message, title, type: 'warning' });
  }

  info(message: string, title?: string): void {
    this.show({ message, title, type: 'info' });
  }

  remove(toast: ToastOptions): void {
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }

  getToasts(): ToastOptions[] {
    return this.toasts;
  }

  clear(): void {
    this.toasts = [];
  }
}