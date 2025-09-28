import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types/kanban';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface KanbanTaskProps {
  task: Task;
  isDragging?: boolean;
}

export function KanbanTask({ task, isDragging = false }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };



  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ai integration': return 'text-orange-400';
      case 'real-time collaboration': return 'text-blue-400';
      case 'cloud migration': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-zinc-700 border-zinc-600 rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all hover:bg-zinc-650',
        isDragging || isSortableDragging ? 'opacity-50 scale-105' : ''
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-white text-sm leading-tight flex-1">
            {task.title}
          </h4>
          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ml-3', getPriorityColor(task.priority))}>
            {task.priority.charAt(0).toUpperCase()}
          </div>
        </div>

        {task.description && (
          <p className={cn('text-xs mb-3 leading-relaxed', getCategoryColor(task.status))}>
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            Mar 1 - Sep 25, 2025
          </span>
        </div>
      </CardContent>
    </Card>
  );
}