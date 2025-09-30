import { useState } from 'react';
import { Calendar, Tag, CheckSquare, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast } from 'date-fns';
import type { Task } from '@/types/kanban';

interface TaskDetailsPopoverProps {
  task: Task;
  children?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function TaskDetailsPopover({ 
  task, 
  children, 
  side = 'right', 
  align = 'start' 
}: TaskDetailsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate data for display
  const isOverdue = task.dueDate ? isPast(parseISO(task.dueDate)) : false;
  const completedChecklistItems = task.checklist?.filter(item => item.done).length || 0;
  const totalChecklistItems = task.checklist?.length || 0;
  const hasChecklist = totalChecklistItems > 0;

  // Prepare items for display (max 10 items)
  const detailItems = [];

  // Add due date
  if (task.dueDate) {
    detailItems.push({
      type: 'due-date',
      icon: Calendar,
      label: 'Due Date',
      value: format(parseISO(task.dueDate), 'MMM dd, yyyy'),
      className: isOverdue ? 'text-red-500' : 'text-foreground',
    });
  }

  // Add labels (limit to remaining slots, reserve one slot for "more" if needed)
  if (task.labels && task.labels.length > 0) {
    const remainingSlots = 10 - detailItems.length;
    const maxLabelsToShow = task.labels.length > remainingSlots ? remainingSlots - 1 : remainingSlots;
    const labelsToShow = task.labels.slice(0, maxLabelsToShow);
    const moreLabelsCount = task.labels.length - labelsToShow.length;

    labelsToShow.forEach((label, index) => {
      detailItems.push({
        type: 'label',
        icon: Tag,
        label: index === 0 ? 'Labels' : '',
        value: label,
        className: 'text-blue-600',
      });
    });

    if (moreLabelsCount > 0) {
      detailItems.push({
        type: 'label-more',
        icon: Tag,
        label: '',
        value: `+${moreLabelsCount} more`,
        className: 'text-muted-foreground italic',
      });
    }
  }

  // Add checklist items (limit to remaining slots, reserve one slot for "more" if needed)
  if (task.checklist && task.checklist.length > 0) {
    const remainingSlots = 10 - detailItems.length;
    const maxChecklistToShow = task.checklist.length > remainingSlots ? remainingSlots - 1 : remainingSlots;
    const checklistToShow = task.checklist.slice(0, maxChecklistToShow);
    const moreChecklistCount = task.checklist.length - checklistToShow.length;

    checklistToShow.forEach((item, index) => {
      detailItems.push({
        type: 'checklist',
        icon: CheckSquare,
        label: index === 0 ? 'Checklist' : '',
        value: item.text,
        className: item.done ? 'text-green-600 line-through' : 'text-foreground',
      });
    });

    if (moreChecklistCount > 0) {
      detailItems.push({
        type: 'checklist-more',
        icon: CheckSquare,
        label: '',
        value: `+${moreChecklistCount} more items`,
        className: 'text-muted-foreground italic',
      });
    }
  }

  // Add stickers (limit to remaining slots)
  if (task.stickers && task.stickers.length > 0) {
    const remainingSlots = 10 - detailItems.length;
    const stickersToShow = task.stickers.slice(0, remainingSlots);
    const moreStickersCount = task.stickers.length - stickersToShow.length;

    if (stickersToShow.length > 0) {
      detailItems.push({
        type: 'stickers',
        icon: null,
        label: 'Stickers',
        value: stickersToShow.join(' '),
        className: 'text-foreground text-base',
      });
    }

    if (moreStickersCount > 0 && detailItems.length < 10) {
      detailItems.push({
        type: 'stickers-more',
        icon: null,
        label: '',
        value: `+${moreStickersCount} more`,
        className: 'text-muted-foreground italic',
      });
    }
  }

  // Add basic task information if no enhanced details are available
  if (detailItems.length === 0) {
    // Add description if available
    if (task.description) {
      detailItems.push({
        type: 'description',
        icon: null,
        label: 'Description',
        value: task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description,
        className: 'text-foreground',
      });
    }
    
    // Add created date as fallback
    if (task.createdAt) {
      try {
        detailItems.push({
          type: 'created',
          icon: Calendar,
          label: 'Created',
          value: format(parseISO(task.createdAt), 'MMM dd, yyyy'),
          className: 'text-muted-foreground',
        });
      } catch {
        // Ignore invalid dates
      }
    }
  }

  // For debugging: always show button, even if no meaningful details
  if (detailItems.length === 0) {
    detailItems.push({
      type: 'empty',
      icon: null,
      label: '',
      value: 'Click edit to add more details',
      className: 'text-muted-foreground italic',
    });
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 rounded-full"
            title="View task details"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-background/95 backdrop-blur-md border shadow-lg" 
        side={side}
        align={align}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <h4 className="font-medium text-sm text-foreground">Task Details</h4>
            {hasChecklist && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {completedChecklistItems}/{totalChecklistItems} completed
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {detailItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                {item.icon && (
                  <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                )}
                {item.label && (
                  <span className="text-muted-foreground min-w-0 font-medium">
                    {item.label}:
                  </span>
                )}
                <span className={cn('flex-1 min-w-0 break-words', item.className)}>
                  {item.value}
                </span>
              </div>
            ))}
            
            {detailItems.length === 10 && (
              <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                Showing first 10 items
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}