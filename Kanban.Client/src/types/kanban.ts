import { Priority } from './enums';

// Value Objects
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

// API Types matching the backend
export interface Board {
  id: number;
  name: string;
}

export interface Column {
  id: number;
  boardId: number;
  name: string;
  order: number;
}

export interface Task {
  id: number;
  columnId: number;
  title: string;
  description: string;
  priority: Priority;
  status: string;
  dueDate?: string; // ISO string
  labels: string[];
  checklist: ChecklistItem[];
  stickers: string[]; // emoji array
  createdAt?: string;
  updatedAt?: string;
  order: number;
  isOverdue?: boolean;
}

// UI State Types
export interface KanbanBoard {
  board: Board;
  columns: Column[];
  tasks: { [columnId: number]: Task[] };
}

// API Request/Response Types
export interface CreateBoardRequest {
  name: string;
}

export interface CreateColumnRequest {
  name: string;
  order: number;
}

export interface UpdateColumnRequest {
  name: string;
  order: number;
}

export interface MoveColumnRequest {
  newOrder: number;
}

export interface CreateTaskRequest {
  columnId: number;
  title: string;
  description: string;
  priority: Priority;
  status: string;
  dueDate?: string;
  labels: string[];
  checklist: ChecklistItem[];
  stickers: string[];
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  priority: Priority;
  status: string;
  dueDate?: string;
  labels: string[];
  checklist: ChecklistItem[];
  stickers: string[];
}

export interface MoveTaskRequest {
  newColumnId: number;
  newOrder: number;
}