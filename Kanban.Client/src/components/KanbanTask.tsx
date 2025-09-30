import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types/kanban';
import { getPriorityLabel, getPriorityColor } from '../types/enums';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast } from 'date-fns';
import { TaskDetailsPopover } from './task/TaskDetailsPopover';

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



  const priorityColor = getPriorityColor(task.priority);
  const priorityLabel = getPriorityLabel(task.priority);

  const isOverdue = task.dueDate ? isPast(parseISO(task.dueDate)) : false;

  const completedChecklistItems = task.checklist?.filter(item => item.done).length || 0;
  const totalChecklistItems = task.checklist?.length || 0;
  const hasChecklist = totalChecklistItems > 0;

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
        {/* Header with title and priority */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-white text-sm leading-tight flex-1">
            {task.title}
          </h4>
          <div className="flex items-center gap-1 ml-2">
            <TaskDetailsPopover task={task} side="right" align="start" />
            <div className={cn('px-2 py-1 rounded text-xs font-medium border', priorityColor)}>
              {priorityLabel}
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-zinc-300 text-xs mb-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.map((label, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-tasktaco-600 text-white text-xs rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Checklist Progress */}
        {hasChecklist && (
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 flex-1 bg-zinc-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-tasktaco-500 transition-all"
                style={{ width: `${(completedChecklistItems / totalChecklistItems) * 100}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">
              {completedChecklistItems}/{totalChecklistItems}
            </span>
          </div>
        )}

        {/* Stickers */}
        {task.stickers && task.stickers.length > 0 && (
          <div className="flex gap-1 mb-2">
            {task.stickers.map((sticker, index) => (
              <span key={index} className="text-sm">
                {sticker}
              </span>
            ))}
          </div>
        )}

        {/* Footer with due date */}
        <div className="flex items-center justify-between text-xs">
          {task.dueDate && (
            <span className={cn(
              'font-medium',
              isOverdue ? 'text-red-400' : 'text-zinc-400'
            )}>
              Due: {format(parseISO(task.dueDate), 'MMM dd')}
            </span>
          )}
          {task.createdAt && task.createdAt.trim() !== '' && (
            <span className="text-zinc-500 ml-auto">
              {(() => {
                try {
                  return format(parseISO(task.createdAt), 'MMM dd');
                } catch {
                  return 'Invalid date';
                }
              })()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}