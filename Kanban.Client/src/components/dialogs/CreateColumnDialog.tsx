import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';

interface CreateColumnDialogProps {
  onColumnCreate: (name: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function CreateColumnDialog({ onColumnCreate, trigger }: CreateColumnDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (error) setError(null); // Clear error when user types
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Column name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Column name must be at least 2 characters long');
      return false;
    }
    if (name.trim().length > 30) {
      setError('Column name must be 30 characters or less');
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
      await onColumnCreate(name.trim());
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create column:', error);
      setError(error instanceof Error ? error.message : 'Failed to create column');
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
    <Button 
      variant="outline" 
      size="sm"
      className="border-2 border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/5 transition-all duration-200"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Column
    </Button>
  );

  const charCount = name.length;
  const isNearLimit = charCount > 25;

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        {trigger || defaultTrigger}
      </ModalTrigger>
      <ModalContent className="sm:max-w-[425px]" onKeyDown={handleKeyDown}>
        <ModalHeader>
          <ModalTitle>Create New Column</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Column Name */}
          <div className="space-y-2">
            <Label htmlFor="column-name">
              Column Name *
              <span className={`ml-2 text-xs ${isNearLimit ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                ({charCount}/30)
              </span>
            </Label>
            <Input
              id="column-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter column name (e.g., To Do, In Progress, Done)..."
              maxLength={30}
              className={error?.includes('name') ? 'border-destructive' : ''}
              autoFocus
            />
            <div className="text-xs text-muted-foreground">
              Common examples: To Do, In Progress, Review, Done, Backlog
            </div>
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
                disabled={isCreating || !name.trim()}
                className="min-w-[80px]"
                style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Column'
                )}
              </Button>
            </div>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}