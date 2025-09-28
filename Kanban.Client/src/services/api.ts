import type {
  Board,
  Column,
  Task,
  CreateBoardRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  MoveColumnRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
} from '../types/kanban';

const API_BASE_URL = 'http://localhost:5090/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Board API
  async getBoards(): Promise<Board[]> {
    return this.request<Board[]>('/board');
  }

  async createBoard(data: CreateBoardRequest): Promise<Board> {
    return this.request<Board>('/board', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBoard(id: number, data: CreateBoardRequest): Promise<void> {
    return this.request<void>(`/board/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBoard(id: number): Promise<void> {
    return this.request<void>(`/board/${id}`, {
      method: 'DELETE',
    });
  }

  // Column API
  async getColumnsByBoard(boardId: number): Promise<Column[]> {
    return this.request<Column[]>(`/column/board/${boardId}`);
  }

  async createColumn(boardId: number, data: CreateColumnRequest): Promise<Column> {
    return this.request<Column>(`/column/board/${boardId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateColumn(id: number, data: UpdateColumnRequest): Promise<void> {
    return this.request<void>(`/column/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async moveColumn(id: number, data: MoveColumnRequest): Promise<void> {
    return this.request<void>(`/column/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteColumn(id: number): Promise<void> {
    return this.request<void>(`/column/${id}`, {
      method: 'DELETE',
    });
  }

  // Task API
  async getTasksByColumn(columnId: number): Promise<Task[]> {
    return this.request<Task[]>(`/task/column/${columnId}`);
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    return this.request<Task>('/task', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: number, data: UpdateTaskRequest): Promise<void> {
    return this.request<void>(`/task/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async moveTask(id: number, data: MoveTaskRequest): Promise<void> {
    return this.request<void>(`/task/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: number): Promise<void> {
    return this.request<void>(`/task/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();