'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DndContext,
  rectIntersection,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
};

export type KanbanBoardProps = {
  id: Status['id'];
  children: ReactNode;
  className?: string;
};

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      data-status={id}
      data-testid="kanban-board"
      className={cn(
        'flex h-full min-h-40 flex-col gap-2 rounded-lg border border-border bg-card p-4 text-xs shadow-lg outline-2 transition-all',
        isOver ? 'outline-orange-500' : 'outline-transparent',
        className
      )}
      // Fallback styles in case Tailwind isn't applied at runtime
      style={{
        border: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--secondary))',
        minHeight: '10rem',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        minWidth: '18rem',
      }}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export type KanbanCardProps = Pick<Feature, 'id' | 'name'> & {
  index: number;
  parent: string;
  children?: ReactNode;
  className?: string;
};

export const KanbanCard = ({
  id,
  name,
  index,
  parent,
  children,
  className,
}: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { index, parent },
    });

  return (
    <Card
      data-testid="kanban-card"
      data-task-id={id}
      className={cn(
        'rounded-lg p-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-card border-border text-card-foreground',
        isDragging && 'cursor-grabbing',
        className
      )}
      // Fallback styles in case Tailwind isn't applied at runtime
      style={{
        border: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        transform: transform
          ? `translateX(${transform.x}px) translateY(${transform.y}px)`
          : 'none',
      }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
    </Card>
  );
};

export type KanbanCardsProps = {
  children: ReactNode;
  className?: string;
};

export const KanbanCards = ({ children, className }: KanbanCardsProps) => (
  <div className={cn('flex flex-1 flex-col gap-2', className)}>{children}</div>
);

export type KanbanHeaderProps =
  | {
      children: ReactNode;
    }
  | {
      name: Status['name'];
      color: Status['color'];
      className?: string;
    };

export const KanbanHeader = (props: KanbanHeaderProps) =>
  'children' in props ? (
    props.children
  ) : (
    <div className={cn('flex shrink-0 items-center gap-2 mb-2', props.className)}>
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: props.color }}
      />
      <p className="m-0 font-bold text-sm text-white">{props.name}</p>
    </div>
  );

export type KanbanProviderProps = {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  className?: string;
};

export const KanbanProvider = ({
  children,
  onDragEnd,
  className,
}: KanbanProviderProps) => (
  <DndContext collisionDetection={rectIntersection} onDragEnd={onDragEnd}>
    <div
      className={cn('grid w-full auto-cols-fr grid-flow-col gap-4', className)}
      // Fallback layout styles for columns when Tailwind isn’t active
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: '1fr',
        gap: '1rem',
        width: '100%',
        alignItems: 'start',
      }}
    >
      {children}
    </div>
  </DndContext>
);