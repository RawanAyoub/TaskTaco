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
  status: string;
  priority: string;
  order: number;
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
  status: string;
  priority: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
}

export interface MoveTaskRequest {
  newColumnId: number;
  newOrder: number;
}