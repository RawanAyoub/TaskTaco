'use client';

import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
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
import { Trash2, Pencil, Plus, Calendar, Clock, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';
import { AIPrdExportModal } from '@/components/AIPrdExportModal';
import { CreateTaskDialog, CreateColumnDialog, EditTaskDialog, ConfirmDialog } from '@/components/dialogs';
import type { ChecklistItem } from '@/components/task/ChecklistManager';

import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';

const colorFor = (name: string) => {
  const key = name.toLowerCase();
  if (key.includes('progress')) return 'hsl(var(--primary))';
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

const formatDueDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    const isOverdue = isPast(date) && !isToday(date);
    
    let displayText: string;
    let icon = Calendar;
    let colorClass = 'text-muted-foreground';
    
    if (isToday(date)) {
      displayText = 'Today';
      icon = Clock;
  colorClass = 'text-primary';
    } else if (isTomorrow(date)) {
      displayText = 'Tomorrow';
      icon = Calendar;
      colorClass = 'text-blue-600';
    } else if (isOverdue) {
      displayText = format(date, 'MMM dd');
      icon = Clock;
      colorClass = 'text-red-600';
    } else {
      displayText = format(date, 'MMM dd');
      icon = Calendar;
      colorClass = 'text-muted-foreground';
    }
    
    return { displayText, icon, colorClass, isOverdue };
  } catch {
    return { displayText: 'Invalid date', icon: Calendar, colorClass: 'text-muted-foreground', isOverdue: false };
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
  const [expandedChecklists, setExpandedChecklists] = useState<Set<number>>(new Set());

  const toggleChecklistExpansion = (taskId: number) => {
    setExpandedChecklists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

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
      // Don't update state if server move failed; error will be shown via setError from calling context if needed
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

  const handleUpdateTask = async (
    taskId: number, 
    title: string, 
    description: string, 
    priority: string,
    dueDate?: Date,
    labels?: string[],
    checklist?: ChecklistItem[],
    stickers?: string[]
  ) => {
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
    // optimistic change with all enhanced fields
    setTasksByColumn((m) => ({
      ...m,
      [colId]: (m[colId] ?? []).map((t) => (t.id === taskId ? { 
        ...t, 
        title, 
        description, 
        priority: priorityEnum,
        dueDate: dueDate?.toISOString(),
        labels: labels || [],
        checklist: checklist || [],
        stickers: stickers || []
      } : t)),
    }));
    
    try {
      // Filter out any checklist items with invalid IDs before sending
      const validChecklist = checklist?.filter(item => item.id && item.id.trim() !== '').map(item => ({
        id: item.id,
        text: item.text,
        done: item.done
      })) || [];

      await Tasks.update(taskId, {
        title,
        description,
        status: task.status,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        labels: labels || [],
        checklist: validChecklist,
        stickers: stickers || []
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
      {statuses.map((status, statusIndex) => {
        const col = columns.find((c) => c.name === status.name);
        const colId = col?.id ?? 0;
        const items = tasksByColumn[colId] ?? [];
        
        // Define gradient colors for each column
        const columnColors = [
          "from-blue-500 to-blue-600", // To Do
          "from-primary/90 to-primary", // In Progress  
          "from-green-500 to-green-600", // Done
          "from-purple-500 to-purple-600", // Additional columns
        ];
        const columnColor = columnColors[statusIndex % columnColors.length];
        
        return (
          <KanbanBoard key={status.name} id={status.name} className="bg-card rounded-lg shadow-sm border border-t-0 border-border/50 overflow-hidden">
            {/* Enhanced Column Header (inside board, full-bleed) */}
            <div className={cn(
              "bg-gradient-to-r px-4 py-2 shadow-sm rounded-t-lg -mx-2 -mt-2",
              columnColor
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {status.name}
                  </h3>
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {items.length}
                  </span>
                </div>
                {col && (
                  <CreateTaskDialog 
                    onTaskCreate={(title, description, priority, dueDate, labels, checklist, stickers) => 
                      handleAddTask(col.id, title, description, priority, dueDate, labels, checklist, stickers)
                    }
                    columnName={col.name}
                    trigger={
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border-white/30 text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Task
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
            <div className="p-3">
              <KanbanCards className="space-y-3">
              {items.map((task, index) => {
                const hasChecklist = task.checklist && task.checklist.length > 0;
                const completedItems = task.checklist?.filter(item => item.done).length || 0;
                const totalItems = task.checklist?.length || 0;
                const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                const isChecklistExpanded = expandedChecklists.has(task.id);
                const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

                return (
                  <KanbanCard
                    key={task.id}
                    id={String(task.id)}
                    name={task.title}
                    parent={status.name}
                    index={index}
                    className="group hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-3">
                      {/* Header with title, priority, and actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                              {task.title}
                            </h3>
                            {task.priority && (
                              <span
                                className="inline-flex items-center"
                                title={`Priority: ${getPriorityName(task.priority)}`}
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    "inline-block w-2.5 h-2.5 rounded-full ring-2",
                                    task.priority === Priority.High
                                      ? "bg-red-500 ring-red-300/50"
                                      : task.priority === Priority.Medium
                                      ? "bg-yellow-400 ring-yellow-200/60"
                                      : "bg-green-500 ring-green-300/50"
                                  )}
                                />
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <EditTaskDialog
                            task={task}
                            onTaskUpdate={handleUpdateTask}
                            trigger={
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit task">
                                <Pencil className="w-3.5 h-3.5" />
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
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive" title="Delete task">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </ConfirmDialog>
                        </div>
                      </div>

                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.slice(0, 3).map((label, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                            >
                              {label}
                            </span>
                          ))}
                          {task.labels.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                              +{task.labels.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stickers */}
                      {task.stickers && task.stickers.length > 0 && (
                        <div className="flex gap-1">
                          {task.stickers.slice(0, 5).map((sticker, idx) => (
                            <span key={idx} className="text-base leading-none">
                              {sticker}
                            </span>
                          ))}
                          {task.stickers.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.stickers.length - 5}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Checklist Progress */}
                      {hasChecklist && (
                        <div className="space-y-2">
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 -mx-1 px-1 py-1 rounded transition-colors"
                            onClick={() => toggleChecklistExpansion(task.id)}
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-foreground">
                                  {completedItems}/{totalItems} completed
                                </span>
                                {isChecklistExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                <div 
                                  className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    progressPercentage === 100 ? "bg-green-500" : "bg-primary"
                                  )}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Expandable checklist items */}
                          {isChecklistExpanded && (
                            <div className="space-y-1 pl-6 border-l-2 border-muted">
                              {task.checklist.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <div className={cn(
                                    "w-3 h-3 rounded-sm border-2 flex items-center justify-center",
                                    item.done ? "bg-green-500 border-green-500" : "border-muted-foreground"
                                  )}>
                                    {item.done && <span className="text-white text-[10px]">✓</span>}
                                  </div>
                                  <span className={cn(
                                    "flex-1 leading-relaxed",
                                    item.done ? "text-muted-foreground line-through" : "text-foreground"
                                  )}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                              {task.checklist.length > 5 && (
                                <div className="text-xs text-muted-foreground pl-5">
                                  +{task.checklist.length - 5} more items
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Due Date */}
                      {dueDateInfo && (
                        <div className="flex justify-start">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-200 shadow-sm",
                              dueDateInfo.isOverdue
                                ? "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 shadow-red-100"
                                : dueDateInfo.displayText.includes("today")
                                ? "bg-gradient-to-r from-primary/10 to-primary/20 text-primary border border-primary/20 shadow-primary/10"
                                : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 shadow-blue-100"
                            )}
                          >
                            <dueDateInfo.icon className="w-3 h-3" />
                            <span>{dueDateInfo.isOverdue && "⚠️ "}Due {dueDateInfo.displayText}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </KanbanCard>
                );
              })}
              </KanbanCards>
            </div>
          </KanbanBoard>
        );
      })}
    </KanbanProvider>
    </div>
  );
};

export { BoardView };
