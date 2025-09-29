import { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, label = "Due Date", placeholder = "Select date", className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date?: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              <span className="flex-1">{format(value, 'PPP')}</span>
            ) : (
              <span className="flex-1 text-muted-foreground">{placeholder}</span>
            )}
            {value && (
              <X 
                className="h-4 w-4 ml-2 hover:text-destructive" 
                onClick={clearDate}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-4 bg-background border shadow-lg" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Select due date</div>
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border-0 p-0 [--cell-size:2.5rem]"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                nav: "flex items-center justify-between p-1",
                nav_button: "h-9 w-9 border-0 p-0 opacity-50 hover:opacity-100",
                caption: "flex justify-center py-1 relative items-center",
                caption_label: "text-sm font-medium",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-[2.5rem] font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "[&:has([aria-selected].day-outside)]:bg-accent/50 relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                day: "h-[2.5rem] w-[2.5rem] p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible"
              }}
            />
            {value && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                Selected: {format(value, 'EEEE, MMMM do, yyyy')}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}