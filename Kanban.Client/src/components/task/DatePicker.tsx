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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}