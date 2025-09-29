import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';

interface CreateTaskDialogProps {
  onTaskCreate: (title: string, description: string, priority: string) => Promise<void>;
  trigger?: React.ReactNode;
  columnName?: string;
}

export function CreateTaskDialog({ onTaskCreate, trigger, columnName }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'Medium' });
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleInputChange = (field: 'title' | 'description' | 'priority', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return false;
    }
    if (formData.title.trim().length < 2) {
      setError('Task title must be at least 2 characters long');
      return false;
    }
    if (formData.title.trim().length > 100) {
      setError('Task title must be 100 characters or less');
      return false;
    }
    if (formData.description.length > 500) {
      setError('Task description must be 500 characters or less');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await onTaskCreate(
        formData.title.trim(),
        formData.description.trim(),
        formData.priority
      );
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="w-full">
      <Plus className="w-4 h-4 mr-2" />
      Add Task
    </Button>
  );

  const titleCharCount = formData.title.length;
  const descriptionCharCount = formData.description.length;
  const isTitleNearLimit = titleCharCount > 80;
  const isDescriptionNearLimit = descriptionCharCount > 400;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>
            Create New Task
            {columnName && <span className="text-muted-foreground"> in {columnName}</span>}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">
              Title *
              <span className={`ml-2 text-xs ${isTitleNearLimit ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                ({titleCharCount}/100)
              </span>
            </Label>
            <Input
              id="task-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              maxLength={100}
              className={error?.includes('title') ? 'border-destructive' : ''}
              autoFocus
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description">
              Description
              <span className={`ml-2 text-xs ${isDescriptionNearLimit ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                ({descriptionCharCount}/500)
              </span>
            </Label>
            <Textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description (optional)..."
              maxLength={500}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="task-priority">Priority</Label>
            <select
              id="task-priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background/95 backdrop-blur-sm px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ring-1 ring-black/5 dark:ring-white/10"
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              Tip: Press Ctrl+Enter to create
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || !formData.title.trim()}
                className="min-w-[80px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}