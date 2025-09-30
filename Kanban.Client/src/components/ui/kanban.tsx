'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DndContext,
  rectIntersection,
  useDraggable,
  useDroppable,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
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
  isOver ? 'outline-primary' : 'outline-transparent',
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
        isDragging && 'opacity-0 cursor-grabbing',
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
  draggedTaskContent?: (taskId: string) => ReactNode;
};

export const KanbanProvider = ({
  children,
  onDragEnd,
  className,
  draggedTaskContent,
}: KanbanProviderProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDropping(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (activeId) {
      // Start drop animation
      setIsDropping(true);
      
      // Call parent handler immediately for state updates
      onDragEnd(event);
      
      // Clear the overlay after animation completes
      setTimeout(() => {
        setActiveId(null);
        setIsDropping(false);
      }, 300); // Match animation duration
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext 
      collisionDetection={rectIntersection} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      sensors={sensors}
    >
      <div
        className={cn('grid w-full auto-cols-fr grid-flow-col gap-4', className)}
        // Fallback layout styles for columns when Tailwind isn't active
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
      <DragOverlay
        className={cn(
          'transition-all duration-300 ease-out',
          isDropping && 'animate-drop-fade-out'
        )}
      >
        {activeId ? (
          <div className={cn(
            'transition-all duration-300 ease-out',
            isDropping && 'scale-95 opacity-0'
          )}>
            {draggedTaskContent ? (
              draggedTaskContent(activeId)
            ) : (
              <Card className="rounded-lg p-3 shadow-2xl bg-card/95 backdrop-blur-sm border-border text-card-foreground scale-105 rotate-2 opacity-95 pointer-events-none">
                <p className="m-0 font-medium text-sm">Moving task...</p>
              </Card>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};