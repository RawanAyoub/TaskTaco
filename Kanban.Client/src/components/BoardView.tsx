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
import type { ColumnDto, TaskDto } from '@/types/api';
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

interface BoardViewProps {
  boardId: number;
}

const BoardView: FC<BoardViewProps> = ({ boardId }) => {
  const [columns, setColumns] = useState<ColumnDto[]>([]);
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, TaskDto[]>>({});
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
            const ts = await Tasks.byColumn(c.id);
            return [c.id, ts] as const;
          })
        );
        if (cancelled) return;
        const map: Record<number, TaskDto[]> = {};
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
    if (!fromStatus) return;

    const fromColumn = columns.find((c) => c.name === fromStatus);
    const toColumn = columns.find((c) => c.name === toStatus);
    if (!fromColumn || !toColumn) return;

    const taskId = Number(activeIdStr);
    const prev = structuredClone(tasksByColumn);

    // optimistic: remove from source, append to target
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

    try {
      const newOrder = (tasksByColumn[toColumn.id]?.length ?? 0); // append
      await Tasks.move(taskId, { columnId: toColumn.id, order: newOrder });
    } catch (e) {
      // rollback
      setTasksByColumn(prev);
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

  const handleAddTask = async (columnId: number, title: string, description: string, priority: string) => {
    const status = columns.find((c) => c.id === columnId)?.name ?? '';

    // optimistic insert at end
    const prev = structuredClone(tasksByColumn);
    const tempId = Math.floor(Math.random() * 1e9) * -1; // temporary negative id
    const optimistic: TaskDto = {
      id: tempId,
      columnId,
      title,
      description,
      status,
      priority,
      order: (tasksByColumn[columnId]?.length ?? 0),
    };
    setTasksByColumn((m) => ({
      ...m,
      [columnId]: [...(m[columnId] ?? []), optimistic].map((t, i) => ({ ...t, order: i })),
    }));

    try {
      const created = await Tasks.create({ columnId, title, description, status, priority });
      setTasksByColumn((m) => ({
        ...m,
        [columnId]: (m[columnId] ?? []).map((t) => (t.id === tempId ? created : t)).map((t, i) => ({ ...t, order: i })),
      }));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create task');
      setTasksByColumn(prev);
      throw e; // Re-throw for dialog error handling
    }
  };

  const handleDeleteTask = async (task: TaskDto) => {
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
    
    const colId = task.columnId;
    const prev = structuredClone(tasksByColumn);
    // optimistic change
    setTasksByColumn((m) => ({
      ...m,
      [colId]: (m[colId] ?? []).map((t) => (t.id === taskId ? { ...t, title, description, priority } : t)),
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

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-sm text-destructive">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-3">
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
      <KanbanProvider onDragEnd={handleDragEnd}>
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
                  onTaskCreate={(title, description, priority) => handleAddTask(col.id, title, description, priority)}
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
                        {task.priority && task.priority !== '' && (
                          <span className="text-xs" title={`Priority: ${task.priority}`}>
                            {task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢'}
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
    </>
  );
};

export { BoardView };
