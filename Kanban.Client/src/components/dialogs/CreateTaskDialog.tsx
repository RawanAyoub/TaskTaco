import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Calendar, Tag, CheckSquare } from 'lucide-react';
import { DatePicker } from '@/components/task/DatePicker';
import { LabelManager } from '@/components/task/LabelManager';
import { ChecklistManager } from '@/components/task/ChecklistManager';
import { StickerSelector } from '@/components/task/StickerSelector';
import type { ChecklistItem } from '@/components/task/ChecklistManager';

interface CreateTaskDialogProps {
  onTaskCreate: (
    title: string,
    description: string,
    priority: string,
    dueDate?: Date,
    labels?: string[],
    checklist?: ChecklistItem[],
    stickers?: string[]
  ) => Promise<void>;
  trigger?: React.ReactNode;
  columnName?: string;
}

export function CreateTaskDialog({ onTaskCreate, trigger, columnName }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: undefined as Date | undefined,
    labels: [] as string[],
    checklist: [] as ChecklistItem[],
    stickers: [] as string[]
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: undefined,
      labels: [],
      checklist: [],
      stickers: []
    });
    setError(null);
    setActiveTab('basic');
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
    // Basic fields validation
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

    // Enhanced fields validation
    if (formData.labels.length > 10) {
      setError('Maximum 10 labels allowed');
      return false;
    }
    
    if (formData.labels.some(label => label.length > 50)) {
      setError('Label names must be 50 characters or less');
      return false;
    }

    if (formData.checklist.length > 20) {
      setError('Maximum 20 checklist items allowed');
      return false;
    }

    if (formData.checklist.some(item => item.text.length > 200)) {
      setError('Checklist items must be 200 characters or less');
      return false;
    }

    if (formData.stickers.length > 10) {
      setError('Maximum 10 stickers allowed');
      return false;
    }

    // Due date validation
    if (formData.dueDate && formData.dueDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      setError('Due date cannot be in the past');
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
        formData.priority,
        formData.dueDate,
        formData.labels.length > 0 ? formData.labels : undefined,
        formData.checklist.length > 0 ? formData.checklist : undefined,
        formData.stickers.length > 0 ? formData.stickers : undefined
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background text-foreground border shadow-2xl" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="text-foreground font-semibold">
            Create New Task
            {columnName && <span className="text-muted-foreground"> in {columnName}</span>}
          </DialogTitle>
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Progress:</span>
            <div className="flex gap-1">
              <div className={`w-2 h-2 rounded-full ${formData.title.trim() ? 'bg-green-500' : 'bg-muted'}`} title="Title" />
              <div className={`w-2 h-2 rounded-full ${formData.dueDate ? 'bg-blue-500' : 'bg-muted'}`} title="Due date" />
              <div className={`w-2 h-2 rounded-full ${formData.labels.length > 0 ? 'bg-purple-500' : 'bg-muted'}`} title="Labels" />
              <div className={`w-2 h-2 rounded-full ${formData.checklist.length > 0 ? 'bg-orange-500' : 'bg-muted'}`} title="Checklist" />
              <div className={`w-2 h-2 rounded-full ${formData.stickers.length > 0 ? 'bg-pink-500' : 'bg-muted'}`} title="Stickers" />
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
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
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-foreground font-medium">
                  Title *
                  <span className={`ml-2 text-xs ${isTitleNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}>
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
                <Label htmlFor="task-description" className="text-foreground font-medium">
                  Description
                  <span className={`ml-2 text-xs ${isDescriptionNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}>
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
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <DatePicker
                value={formData.dueDate}
                onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                placeholder="Set due date (optional)"
              />
            </TabsContent>

            <TabsContent value="organize" className="space-y-4 mt-4">
              <LabelManager
                value={formData.labels}
                onChange={(labels) => setFormData(prev => ({ ...prev, labels }))}
              />
              
              <StickerSelector
                value={formData.stickers}
                onChange={(stickers) => setFormData(prev => ({ ...prev, stickers }))}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <ChecklistManager
                value={formData.checklist}
                onChange={(checklist) => setFormData(prev => ({ ...prev, checklist }))}
              />
            </TabsContent>
          </Tabs>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t border-border">
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
                className="min-w-[80px] bg-primary hover:bg-primary/90 text-primary-foreground"
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