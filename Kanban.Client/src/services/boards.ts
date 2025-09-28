import { api } from './http';
import type { BoardDto } from '@/types/api';

export const Boards = {
  list: () => api<BoardDto[]>(`/board`),
  create: (name: string) => api<{ id: number }>(`/board`, { method: 'POST', body: JSON.stringify({ name }) }),
  update: (id: number, name: string) => api<void>(`/board/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  delete: (id: number) => api<void>(`/board/${id}`, { method: 'DELETE' }),
};
