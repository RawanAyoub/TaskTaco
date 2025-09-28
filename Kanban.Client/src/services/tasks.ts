import { api } from './http';
import type { TaskDto, CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '@/types/api';

export const Tasks = {
  byColumn: (columnId: number) => api<TaskDto[]>(`/task/column/${columnId}`),
  get: (id: number) => api<TaskDto>(`/task/${id}`),
  create: (req: CreateTaskRequest) => api<TaskDto>(`/task`, { method: 'POST', body: JSON.stringify(req) }),
  update: (id: number, req: UpdateTaskRequest) => api<void>(`/task/${id}`, { method: 'PUT', body: JSON.stringify(req) }),
  move: (id: number, req: MoveTaskRequest) => api<void>(`/task/${id}/move`, { method: 'PUT', body: JSON.stringify(req) }),
  delete: (id: number) => api<void>(`/task/${id}`, { method: 'DELETE' }),
};
