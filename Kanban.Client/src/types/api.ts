export type BoardDto = { id: number; name: string };
export type ColumnDto = { id: number; boardId: number; name: string; order: number };
export type TaskDto = { id: number; columnId: number; title: string; description: string; status: string; priority: string; order: number };

export type CreateTaskRequest = { columnId: number; title: string; description: string; status: string; priority: string };
export type UpdateTaskRequest = { title: string; description: string; status: string; priority: string };
export type MoveTaskRequest = { columnId: number; order: number };
