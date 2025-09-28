import { api } from './http';
import type { ColumnDto } from '@/types/api';

export const Columns = {
  byBoard: (boardId: number) => api<ColumnDto[]>(`/column/board/${boardId}`),
  get: (id: number) => api<ColumnDto>(`/column/${id}`),
  create: (boardId: number, name: string, order: number) => api<ColumnDto>(`/column/board/${boardId}`, { method: 'POST', body: JSON.stringify({ name, order }) }),
  update: (id: number, name: string, order: number) => api<void>(`/column/${id}`, { method: 'PUT', body: JSON.stringify({ name, order }) }),
  move: (id: number, newOrder: number) => api<void>(`/column/${id}/move`, { method: 'PATCH', body: JSON.stringify({ newOrder }) }),
  delete: (id: number) => api<void>(`/column/${id}`, { method: 'DELETE' }),
};
