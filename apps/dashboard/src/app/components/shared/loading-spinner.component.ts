import { booleanAttribute, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      class="flex items-center justify-center"
      [ngClass]="containerClass"
    >
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2"
        [ngClass]="spinnerClass"
      ></div>
      <span *ngIf="text" class="ml-2 text-sm text-gray-600">{{ text }}</span>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input({ transform: booleanAttribute }) show = false;
  @Input() text = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'white' | 'gray' = 'primary';

  get containerClass(): string {
    const baseClasses = 'flex items-center justify-center';
    const sizeClasses = {
      sm: 'py-2',
      md: 'py-4',
      lg: 'py-8',
    };
    return `${baseClasses} ${sizeClasses[this.size]}`;
  }

  get spinnerClass(): string {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };

    const colorClasses = {
      primary: 'border-primary-600',
      white: 'border-white',
      gray: 'border-gray-600',
    };

    return `animate-spin rounded-full border-b-2 ${sizeClasses[this.size]} ${
      colorClasses[this.color]
    }`;
  }
}
