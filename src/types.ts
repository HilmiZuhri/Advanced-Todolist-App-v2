/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string; // e.g. Work, Personal, Shopping, etc.
  subcategories: string[]; // Custom sub-tags added by user
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
}

export type ViewMode = 'list' | 'board';

export interface FilterState {
  status: 'all' | 'active' | 'completed';
  category: 'all' | string;
  searchQuery: string;
}

export type SortField = 'priority' | 'dueDate' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  order: SortOrder;
}

export interface AppNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  type: 'overdue' | 'due-today' | 'due-soon'; // due-soon: within 24 hours
  message: string;
  read: boolean;
  createdAt: string;
}
