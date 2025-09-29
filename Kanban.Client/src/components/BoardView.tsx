'use client';

import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/ui/kanban';
import type { DragEndEvent } from '@dnd-kit/core';
import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { Columns } from '@/services/columns';
import { Tasks } from '@/services/tasks';
import type { ColumnDto, CreateTaskRequest } from '@/types/api';
import type { Task } from '@/types/kanban';
import { Priority } from '@/types/enums';
import { transformTaskDtoToTask } from '@/services/transformers';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { AIPrdExportModal } from '@/components/AIPrdExportModal';
import { CreateTaskDialog, CreateColumnDialog, EditTaskDialog, ConfirmDialog } from '@/components/dialogs';

const colorFor = (name: string) => {
  const key = name.toLowerCase();
  if (key.includes('progress')) return '#F59E0B';
  if (key.includes('done')) return '#10B981';
  return '#6B7280'; // planned/other
};

const getPriorityName = (priority: Priority): string => {
  switch (priority) {
    case Priority.High:
      return 'High';
    case Priority.Low:
      return 'Low';
    case Priority.Medium:
    default:
      return 'Medium';
  }
};

interface BoardViewProps {
  boardId: number;
}

const BoardView: FC<BoardViewProps> = ({ boardId }) => {
  const [columns, setColumns] = useState<ColumnDto[]>([]);
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const cols = await Columns.byBoard(boardId);
        if (cancelled) return;
        setColumns(cols);

        const entries = await Promise.all(
          cols.map(async (c) => {
            const taskDtos = await Tasks.byColumn(c.id);
            const tasks = taskDtos.map(transformTaskDtoToTask);
            return [c.id, tasks] as const;
          })
        );
        if (cancelled) return;
        const map: Record<number, Task[]> = {};
        for (const [cid, ts] of entries) map[cid] = ts;
        setTasksByColumn(map);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load board');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const statuses = useMemo(
    () =>
      columns.map((c) => ({ id: String(c.id), name: c.name, color: colorFor(c.name) })),
    [columns]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const fromStatus: string | undefined = active.data.current?.parent;
    const toStatus = String(over.id);
    if (!fromStatus || fromStatus === toStatus) return; // No change if same column

    const fromColumn = columns.find((c) => c.name === fromStatus);
    const toColumn = columns.find((c) => c.name === toStatus);
    if (!fromColumn || !toColumn) return;

    const taskId = Number(activeIdStr);

    // Calculate new order before move
    const newOrder = (tasksByColumn[toColumn.id]?.length ?? 0);

    try {
      // Move on server first to prevent duplication
      await Tasks.move(taskId, { columnId: toColumn.id, order: newOrder });
      
      // Only update state after successful server move
      setTasksByColumn((prevMap) => {
        const next = { ...prevMap };
        next[fromColumn.id] = (next[fromColumn.id] ?? []).filter((t) => t.id !== taskId);
        const target = next[toColumn.id] ? [...next[toColumn.id]] : [];
        const movedTask = prevMap[fromColumn.id]?.find((t) => t.id === taskId);
        if (movedTask) {
          target.push({ ...movedTask, columnId: toColumn.id });
        }
        next[toColumn.id] = target.map((t, i) => ({ ...t, order: i }));
        return next;
      });
    } catch (e) {
      // Don't update state if server move failed
      console.error('Failed to move task:', e);
    }
  };

  const handleAddColumn = async (name: string) => {
    try {
      const order = columns.length;
      const col = await Columns.create(boardId, name, order);
      setColumns((prev) => [...prev, col].sort((a, b) => a.order - b.order));
      setTasksByColumn((prev) => ({ ...prev, [col.id]: [] }));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create column');
      throw e; // Re-throw for dialog error handling
    }
  };

  const handleAddTask = async (
    columnId: number, 
    title: string, 
    description: string, 
    priority: string,
    dueDate?: Date,
    labels?: string[],
    checklist?: { id: string; text: string; done: boolean }[],
    stickers?: string[]
  ) => {
    const status = columns.find((c) => c.id === columnId)?.name ?? '';

    try {
      // Create task on server first to avoid duplication
      const createRequest: CreateTaskRequest = {
        columnId,
        title,
        description,
        status,
        priority,
        dueDate: dueDate?.toISOString(),
        labels,
        checklist,
        stickers
      };
      
      const createdDto = await Tasks.create(createRequest);
      const created = transformTaskDtoToTask(createdDto);
      
      // Only update state after successful creation
      setTasksByColumn((m) => ({
        ...m,
        [columnId]: [...(m[columnId] ?? []), created].map((t, i) => ({ ...t, order: i })),
      }));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create task');
      throw e; // Re-throw for dialog error handling
    }
  };

  const handleDeleteTask = async (task: Task) => {
    const colId = task.columnId;
    const prev = structuredClone(tasksByColumn);
    // optimistic remove
    setTasksByColumn((m) => ({
      ...m,
      [colId]: (m[colId] ?? []).filter((t) => t.id !== task.id).map((t, i) => ({ ...t, order: i })),
    }));
    try {
      await Tasks.delete(task.id);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to delete task');
      setTasksByColumn(prev);
      throw e; // Re-throw for dialog error handling
    }
  };

  const handleUpdateTask = async (taskId: number, title: string, description: string, priority: string) => {
    const task = Object.values(tasksByColumn).flat().find(t => t.id === taskId);
    if (!task) return;
    
    // Convert priority string to enum
    let priorityEnum: Priority;
    switch (priority.toLowerCase()) {
      case 'high':
        priorityEnum = Priority.High;
        break;
      case 'low':
        priorityEnum = Priority.Low;
        break;
      case 'medium':
      default:
        priorityEnum = Priority.Medium;
        break;
    }
    
    const colId = task.columnId;
    const prev = structuredClone(tasksByColumn);
    // optimistic change
    setTasksByColumn((m) => ({
      ...m,
      [colId]: (m[colId] ?? []).map((t) => (t.id === taskId ? { ...t, title, description, priority: priorityEnum } : t)),
    }));
    
    try {
      await Tasks.update(taskId, {
        title,
        description,
        status: task.status,
        priority,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update task');
      setTasksByColumn(prev);
      throw e; // Re-throw for dialog error handling
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground bg-background p-6">Loading tasks... 🌮</div>;
  if (error) return <div className="text-sm text-destructive bg-background p-6">{error}</div>;

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">Board #{boardId}</div>
        <div className="flex gap-2">
          <AIPrdExportModal boardId={boardId} boardName={`Board #${boardId}`} />
          <CreateColumnDialog 
            onColumnCreate={handleAddColumn}
            trigger={
              <Button 
                variant="outline" 
                size="sm"
                className="border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/10 text-primary hover:text-primary transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            }
          />
        </div>
      </div>
      <KanbanProvider 
        onDragEnd={handleDragEnd}
        draggedTaskContent={(taskId) => {
          // Find the task by ID across all columns
          const task = Object.values(tasksByColumn)
            .flat()
            .find(t => t.id.toString() === taskId);
          
          if (!task) return null;
          
          return (
            <KanbanCard
              key={task.id}
              id={task.id.toString()}
              name={task.title}
              index={0}
              parent="dragging"
              className="shadow-2xl scale-105 rotate-2 opacity-95 bg-card border-border"
            >
              <div className="space-y-2">
                <p className="m-0 font-medium text-sm">{task.title}</p>
                {task.description && (
                  <p className="m-0 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                )}
                {task.priority !== Priority.Medium && (
                  <div className="text-xs text-muted-foreground">
                    Priority: {getPriorityName(task.priority)}
                  </div>
                )}
                {task.dueDate && (
                  <div className="text-xs text-muted-foreground">
                    Due: {task.dueDate}
                  </div>
                )}
                {Array.isArray(task.labels) && task.labels.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {task.labels.map((label, idx) => (
                      <span key={idx} className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {Array.isArray(task.stickers) && task.stickers.length > 0 && (
                  <div className="flex gap-1">
                    {task.stickers.map((sticker, idx) => (
                      <span key={idx} className="text-sm">{sticker}</span>
                    ))}
                  </div>
                )}
              </div>
            </KanbanCard>
          );
        }}
      >
      {statuses.map((status) => {
        const col = columns.find((c) => c.name === status.name);
        const colId = col?.id ?? 0;
        const items = tasksByColumn[colId] ?? [];
        return (
          <KanbanBoard key={status.name} id={status.name}>
            <div className="flex items-center justify-between">
              <KanbanHeader name={status.name} color={status.color} />
              {col && (
                <CreateTaskDialog 
                  onTaskCreate={(title, description, priority, dueDate, labels, checklist, stickers) => 
                    handleAddTask(col.id, title, description, priority, dueDate, labels, checklist, stickers)
                  }
                  columnName={col.name}
                  trigger={
                    <Button variant="ghost" size="sm">
                      + Task
                    </Button>
                  }
                />
              )}
            </div>
            <KanbanCards>
              {items.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  id={String(task.id)}
                  name={task.title}
                  parent={status.name}
                  index={index}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="m-0 font-medium text-sm">{task.title}</p>
                        {task.priority && (
                          <span className="text-xs" title={`Priority: ${getPriorityName(task.priority)}`}>
                            {task.priority === Priority.High ? '🔴' : task.priority === Priority.Medium ? '🟡' : '🟢'}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="m-0 text-xs text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <EditTaskDialog
                        task={task}
                        onTaskUpdate={handleUpdateTask}
                        trigger={
                          <Button variant="ghost" size="icon" title="Edit task">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        title="Delete Task"
                        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone and will permanently remove the task from your board.`}
                        confirmText="Delete Task"
                        variant="destructive"
                        onConfirm={() => handleDeleteTask(task)}
                      >
                        <Button variant="ghost" size="icon" title="Delete task">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </div>
                </KanbanCard>
              ))}
            </KanbanCards>
          </KanbanBoard>
        );
      })}
    </KanbanProvider>
    </div>
  );
};

export { BoardView };
