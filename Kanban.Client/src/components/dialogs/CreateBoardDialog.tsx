import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { Boards } from '@/services/boards';

interface CreateBoardDialogProps {
  onBoardCreated: (board: { id: number; name: string }) => void;
  trigger?: React.ReactNode;
}

export function CreateBoardDialog({ onBoardCreated, trigger }: CreateBoardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Board name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Board name must be at least 2 characters long');
      return false;
    }
    if (formData.name.trim().length > 50) {
      setError('Board name must be less than 50 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsCreating(true);
      setError(null);
      
      const result = await Boards.create(formData.name.trim());
      
      // Create board object to return
      const newBoard = {
        id: result.id,
        name: formData.name.trim()
      };
      
      // Notify parent component
      onBoardCreated(newBoard);
      
      // Reset and close dialog
      resetForm();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Create Board
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Board Name */}
          <div className="space-y-2">
            <Label htmlFor="boardName">
              Board Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="boardName"
              placeholder="e.g., Product Roadmap, Sprint Planning..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={50}
              disabled={isCreating}
              className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Choose a descriptive name for your board</span>
              <span>{formData.name.length}/50</span>
            </div>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="boardDescription">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="boardDescription"
              placeholder="Briefly describe what this board will be used for..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={200}
              rows={3}
              disabled={isCreating}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Add context for team members (optional)</span>
              <span>{formData.description.length}/200</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || isCreating}
              className="min-w-[100px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </>
              )}
            </Button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="text-xs text-muted-foreground text-center pt-2">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd> to create quickly
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}