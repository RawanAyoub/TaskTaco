import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { Task } from '@/types/kanban';
import { Priority } from '@/types/enums';

interface EditTaskDialogProps {
  task: Task;
  onTaskUpdate: (taskId: number, title: string, description: string, priority: string) => Promise<void>;
  trigger: React.ReactNode;
}

export function EditTaskDialog({ task, onTaskUpdate, trigger }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getPriorityString = (priority: Priority): string => {
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

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: getPriorityString(task.priority),
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (formData.title.length > 100) {
      setError('Task title must be less than 100 characters');
      return;
    }

    if (formData.description.length > 500) {
      setError('Task description must be less than 500 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onTaskUpdate(
        task.id,
        formData.title.trim(),
        formData.description.trim(),
        formData.priority
      );
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background text-foreground" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Edit Task</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Make changes to your task. Press Ctrl+Enter to save quickly.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-foreground font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              maxLength={100}
              autoFocus
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.title.length}/100
            </div>
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-foreground font-medium">Description</Label>
            <Textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your task... (optional)"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.description.length}/500
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="task-priority" className="text-foreground font-medium">Priority</Label>
            <select
              id="task-priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}