import { api } from './http';
import type { BoardDto } from '@/types/api';

export const Boards = {
  list: () => api<BoardDto[]>(`/board`),
  create: (name: string, description?: string) => api<{ id: number }>(`/board`, { method: 'POST', body: JSON.stringify({ name, description }) }),
  update: (id: number, name: string, description?: string) => api<void>(`/board/${id}`, { method: 'PUT', body: JSON.stringify({ name, description }) }),
  delete: (id: number) => api<void>(`/board/${id}`, { method: 'DELETE' }),
};
