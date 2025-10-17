import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface HierarchicalItem {
  id: string;
  name: string;
  parentId?: string | null;
  children?: HierarchicalItem[];
  level?: number;
}

@Component({
  selector: 'app-hierarchical-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <!-- Dropdown Button -->
      <button
        type="button"
        (click)="toggleDropdown($event)"
        class="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        [class.bg-blue-50]="isOpen"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700">
            {{ getDisplayText() }}
          </span>
          <svg 
            class="w-5 h-5 text-gray-400 transition-transform duration-200"
            [class.rotate-180]="isOpen"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      <!-- Dropdown Menu -->
      <div 
        *ngIf="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <!-- Search Input -->
        <div class="p-2 border-b border-gray-200">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="filterItems()"
            placeholder="Search organizations..."
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <!-- Select All/None -->
        <div class="p-2 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center space-x-4">
            <label class="flex items-center text-sm">
              <input
                type="checkbox"
                [checked]="isAllSelected()"
                [indeterminate]="isIndeterminate()"
                (change)="toggleSelectAll()"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-gray-700">
                {{ isAllSelected() ? 'Deselect All' : 'Select All' }}
              </span>
            </label>
            <span class="text-xs text-gray-500">
              {{ selectedItems.length }} selected
            </span>
          </div>
        </div>

        <!-- Hierarchical Items -->
        <div class="py-1">
          <div *ngIf="filteredItems.length === 0" class="px-3 py-2 text-sm text-gray-500">
            No organizations available
          </div>
          <ng-container *ngFor="let item of filteredItems">
            <div 
              class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              [style.padding-left.px]="(item.level || 0) * 20 + 12"
              (click)="toggleItem(item)"
            >
              <input
                type="checkbox"
                [checked]="isSelected(item.id)"
                (change)="toggleItem(item)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                (click)="$event.stopPropagation()"
              />
              <span class="ml-2 text-sm text-gray-700">
                {{ item.name }}
              </span>
              <span *ngIf="item.children && item.children.length > 0" class="ml-2 text-xs text-gray-400">
                ({{ item.children.length }})
              </span>
            </div>
          </ng-container>
        </div>

        <!-- No Results -->
        <div *ngIf="filteredItems.length === 0" class="px-3 py-2 text-sm text-gray-500 text-center">
          No organizations found
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-h-60 {
      max-height: 15rem;
    }
  `]
})
export class HierarchicalMultiSelectComponent implements OnInit, OnDestroy {
  @Input() items: HierarchicalItem[] = [];
  @Input() selectedItems: string[] = [];
  @Input() placeholder: string = 'Select organizations...';
  @Input() maxHeight: string = '15rem';
  
  @Output() selectionChange = new EventEmitter<string[]>();

  isOpen = false;
  searchQuery = '';
  filteredItems: HierarchicalItem[] = [];
  private clickListener?: () => void;

  ngOnInit(): void {
    this.flattenItems();
    this.filterItems();
    
    // Close dropdown when clicking outside
    this.clickListener = () => {
      if (this.isOpen) {
        this.isOpen = false;
      }
    };
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.filterItems();
    }
  }

  toggleItem(item: HierarchicalItem): void {
    if (this.isSelected(item.id)) {
      this.selectedItems = this.selectedItems.filter(id => id !== item.id);
    } else {
      this.selectedItems = [...this.selectedItems, item.id];
    }
    this.selectionChange.emit(this.selectedItems);
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedItems = [];
    } else {
      this.selectedItems = this.filteredItems.map(item => item.id);
    }
    this.selectionChange.emit(this.selectedItems);
  }

  isSelected(id: string): boolean {
    return this.selectedItems.includes(id);
  }

  isAllSelected(): boolean {
    return this.filteredItems.length > 0 && this.filteredItems.every(item => this.isSelected(item.id));
  }

  isIndeterminate(): boolean {
    const selectedCount = this.filteredItems.filter(item => this.isSelected(item.id)).length;
    return selectedCount > 0 && selectedCount < this.filteredItems.length;
  }

  getDisplayText(): string {
    if (this.selectedItems.length === 0) {
      return this.placeholder;
    }
    if (this.selectedItems.length === 1) {
      const item = this.findItemById(this.selectedItems[0]);
      return item ? item.name : '1 selected';
    }
    return `${this.selectedItems.length} organizations selected`;
  }

  filterItems(): void {
    if (!this.searchQuery.trim()) {
      this.filteredItems = [...this.items];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter(item => 
      this.matchesSearch(item, query)
    );
  }

  private matchesSearch(item: HierarchicalItem, query: string): boolean {
    return item.name.toLowerCase().includes(query) ||
           (item.children ? item.children.some(child => this.matchesSearch(child, query)) : false);
  }

  private findItemById(id: string): HierarchicalItem | null {
    for (const item of this.items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findItemInChildren(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private findItemInChildren(children: HierarchicalItem[], id: string): HierarchicalItem | null {
    for (const child of children) {
      if (child.id === id) return child;
      if (child.children) {
        const found = this.findItemInChildren(child.children!, id);
        if (found) return found;
      }
    }
    return null;
  }

  private flattenItems(): void {
    this.items = this.addLevels(this.items, 0);
  }

  private addLevels(items: HierarchicalItem[], level: number): HierarchicalItem[] {
    return items.map(item => ({
      ...item,
      level,
      children: item.children ? this.addLevels(item.children, level + 1) : undefined
    }));
  }
}
