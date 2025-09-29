import type { TaskDto } from '@/types/api';
import type { Task } from '@/types/kanban';
import { Priority } from '@/types/enums';

/**
 * Transforms a TaskDto from the API to a Task for the UI
 */
export function transformTaskDtoToTask(dto: TaskDto): Task {
  // Parse priority string to enum
  let priority: Priority;
  switch (dto.priority?.toLowerCase()) {
    case 'high':
      priority = Priority.High;
      break;
    case 'low':
      priority = Priority.Low;
      break;
    case 'medium':
    default:
      priority = Priority.Medium;
      break;
  }

  return {
    id: dto.id,
    columnId: dto.columnId,
    title: dto.title,
    description: dto.description,
    priority,
    status: dto.status,
    dueDate: dto.dueDate,
    labels: dto.labels || [],
    checklist: dto.checklist || [],
    stickers: dto.stickers || [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    order: dto.order,
    isOverdue: dto.dueDate ? new Date(dto.dueDate) < new Date() : false,
  };
}

/**
 * Helper to get priority string from enum
 */
function getPriorityString(priority: Priority): string {
  switch (priority) {
    case Priority.High:
      return 'High';
    case Priority.Low:
      return 'Low';
    case Priority.Medium:
    default:
      return 'Medium';
  }
}

/**
 * Transforms a Task for the UI to a CreateTaskRequest for the API
 */
export function transformTaskToCreateRequest(task: Partial<Task>): any {
  return {
    columnId: task.columnId,
    title: task.title || '',
    description: task.description || '',
    status: task.status || '',
    priority: task.priority ? getPriorityString(task.priority) : 'Medium',
    dueDate: task.dueDate,
    labels: task.labels,
    checklist: task.checklist,
    stickers: task.stickers,
  };
}

/**
 * Transforms a Task for the UI to an UpdateTaskRequest for the API
 */
export function transformTaskToUpdateRequest(task: Partial<Task>): any {
  return {
    title: task.title || '',
    description: task.description || '',
    status: task.status || '',
    priority: task.priority ? getPriorityString(task.priority) : 'Medium',
    dueDate: task.dueDate,
    labels: task.labels,
    checklist: task.checklist,
    stickers: task.stickers,
  };
}