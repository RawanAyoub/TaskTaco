import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Loader2, Calendar, Tag, CheckSquare } from 'lucide-react';
import { DatePicker } from '@/components/task/DatePicker';
import { LabelManager } from '@/components/task/LabelManager';
import { ChecklistManager } from '@/components/task/ChecklistManager';
import { StickerSelector } from '@/components/task/StickerSelector';
import type { Task } from '@/types/kanban';
import type { ChecklistItem } from '@/components/task/ChecklistManager';
import { Priority } from '@/types/enums';

interface EditTaskDialogProps {
  task: Task;
  onTaskUpdate: (
    taskId: number,
    title: string,
    description: string,
    priority: string,
    dueDate?: Date,
    labels?: string[],
    checklist?: ChecklistItem[],
    stickers?: string[]
  ) => Promise<void>;
  trigger: React.ReactNode;
}

export function EditTaskDialog({ task, onTaskUpdate, trigger }: EditTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

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
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    labels: Array.isArray(task.labels) ? [...task.labels] : [],
    checklist: Array.isArray(task.checklist) ? [...task.checklist] : [],
    stickers: Array.isArray(task.stickers) ? [...task.stickers] : []
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form to current task data when closing
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: getPriorityString(task.priority),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        labels: Array.isArray(task.labels) ? [...task.labels] : [],
        checklist: Array.isArray(task.checklist) ? [...task.checklist] : [],
        stickers: Array.isArray(task.stickers) ? [...task.stickers] : []
      });
      setError(null);
      setActiveTab('basic');
    }
  };

  const handleInputChange = (field: 'title' | 'description' | 'priority', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsUpdating(true);
      setError(null);
      
      await onTaskUpdate(
        task.id,
        formData.title.trim(),
        formData.description.trim(),
        formData.priority,
        formData.dueDate,
        formData.labels,
        formData.checklist,
        formData.stickers
      );
      
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const isTitleNearLimit = formData.title.length > 80;
  const isDescriptionNearLimit = formData.description.length > 400;

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        {trigger}
      </ModalTrigger>
      <ModalContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onKeyDown={handleKeyDown}>
        <ModalHeader>
          <ModalTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Task
          </ModalTitle>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Progress:</span>
            <div className="flex gap-1">
              <div className={`w-2 h-2 rounded-full ${formData.title.trim() ? 'bg-primary' : 'bg-muted'}`} title="Title" />
              <div className={`w-2 h-2 rounded-full ${formData.dueDate ? 'bg-secondary' : 'bg-muted'}`} title="Due date" />
              <div className={`w-2 h-2 rounded-full ${formData.labels.length > 0 ? 'bg-accent' : 'bg-muted'}`} title="Labels" />
              <div className={`w-2 h-2 rounded-full ${formData.checklist.length > 0 ? 'bg-primary/70' : 'bg-muted'}`} title="Checklist" />
              <div className={`w-2 h-2 rounded-full ${formData.stickers.length > 0 ? 'bg-secondary/70' : 'bg-muted'}`} title="Stickers" />
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Edit className="w-4 h-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="organize" className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Organize
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-1">
                <CheckSquare className="w-4 h-4" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-foreground font-medium">
                  Title *
                </Label>
                <Input
                  id="task-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter task title..."
                  maxLength={100}
                  autoFocus
                />
                <div className="flex justify-between text-xs">
                  <span className={`ml-2 text-xs ${isTitleNearLimit ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                    {formData.title.length}/100 characters
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description" className="text-foreground font-medium">Description</Label>
                <Textarea
                  id="task-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your task in detail... (optional)"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs">
                  <span className={`ml-2 text-xs ${isDescriptionNearLimit ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                    {formData.description.length}/500 characters
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-priority" className="text-foreground font-medium">Priority</Label>
                <select
                  id="task-priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value="Low">🟢 Low Priority</option>
                  <option value="Medium">🟡 Medium Priority</option>
                  <option value="High">🔴 High Priority</option>
                </select>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Due Date</Label>
                <DatePicker
                  value={formData.dueDate}
                  onChange={(date?: Date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  placeholder="Set a due date for this task..."
                />
                <p className="text-xs text-muted-foreground">
                  Tasks past their due date will be highlighted as overdue.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="organize" className="space-y-4 mt-4">
              <LabelManager
                value={formData.labels}
                onChange={(labels) => setFormData(prev => ({ ...prev, labels }))}
                maxLabels={10}
              />
              
              <StickerSelector
                value={formData.stickers}
                onChange={(stickers) => setFormData(prev => ({ ...prev, stickers }))}
                maxStickers={5}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <ChecklistManager
                value={formData.checklist}
                onChange={(checklist) => setFormData(prev => ({ ...prev, checklist }))}
                maxItems={20}
              />
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || isUpdating}
              className="min-w-[120px]"
              style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Task
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd> to update quickly
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}