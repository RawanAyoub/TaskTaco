import { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import type { Column, Task } from '../types/kanban';
import { KanbanTask } from './KanbanTask';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onUpdate: (boardId: number) => void;
}

export function KanbanColumn({ column, tasks, onUpdate }: KanbanColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await fetch(`http://localhost:5000/api/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          columnId: column.id,
          title: newTaskTitle,
          description: newTaskDescription,
          status: 'To Do',
          priority: 'Medium',
        }),
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
      onUpdate(column.boardId);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const getColumnColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'planned': return 'bg-blue-500';
      case 'in progress': return 'bg-orange-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-3 rounded-lg bg-zinc-800 p-4 min-h-[600px] w-80 transition-all',
        isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-3 h-3 rounded-full', getColumnColor(column.name))} />
        <h3 className="font-semibold text-white text-sm">{column.name}</h3>
        <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded-full ml-auto">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanTask key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      {isAddingTask ? (
        <div className="space-y-2">
          <Input
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            autoFocus
          />
          <Input
            placeholder="Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddTask} size="sm">
              Add Task
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setIsAddingTask(true)}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      )}
    </div>
  );
}