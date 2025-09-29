import { useState } from 'react';
import { Plus, X, GripVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface ChecklistManagerProps {
  value: ChecklistItem[];
  onChange: (checklist: ChecklistItem[]) => void;
  label?: string;
  placeholder?: string;
  maxItems?: number;
}

export function ChecklistManager({ 
  value, 
  onChange, 
  label = "Checklist", 
  placeholder = "Add checklist item...",
  maxItems = 20 
}: ChecklistManagerProps) {
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    const trimmed = newItemText.trim();
    if (trimmed && value.length < maxItems) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: trimmed,
        done: false
      };
      onChange([...value, newItem]);
      setNewItemText('');
    }
  };

  const removeItem = (id: string) => {
    onChange(value.filter(item => item.id !== id));
  };

  const toggleItem = (id: string) => {
    onChange(value.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const updateItemText = (id: string, text: string) => {
    onChange(value.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addItem();
    }
  };

  const completedCount = value.filter(item => item.done).length;
  const progressPercentage = value.length > 0 ? (completedCount / value.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {value.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{value.length} completed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {value.length > 0 && (
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Checklist Items */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item) => (
            <div key={item.id} className="flex items-start gap-2 p-2 border rounded-lg">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-1 cursor-grab" />
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`flex-shrink-0 w-4 h-4 mt-1 border rounded transition-colors ${
                  item.done 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-muted-foreground hover:border-green-500'
                }`}
              >
                {item.done && <Check className="w-3 h-3" />}
              </button>
              <Textarea
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
                className={`flex-1 min-h-[2.5rem] resize-none ${
                  item.done ? 'line-through text-muted-foreground' : ''
                }`}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0 p-1 h-auto text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Item */}
      {value.length < maxItems && (
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={!newItemText.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {value.length >= maxItems && (
        <p className="text-xs text-muted-foreground">Maximum {maxItems} items allowed</p>
      )}

      {newItemText && (
        <p className="text-xs text-muted-foreground">
          Tip: Press Ctrl+Enter to add item
        </p>
      )}
    </div>
  );
}