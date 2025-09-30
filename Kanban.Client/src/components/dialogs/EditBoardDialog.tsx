import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Loader2 } from 'lucide-react';
import { Boards } from '@/services/boards';

interface EditBoardDialogProps {
  board: { id: number; name: string; description?: string };
  onBoardUpdated: (board: { id: number; name: string; description?: string }) => void;
  trigger?: React.ReactNode;
}

export function EditBoardDialog({ board, onBoardUpdated, trigger }: EditBoardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(board.name);
      setDescription(board.description || '');
      setError(null);
    }
  }, [isOpen, board]);

  const validate = () => {
    const trimmed = name.trim();
    if (!trimmed) return 'Board name is required';
    if (trimmed.length < 2) return 'Board name must be at least 2 characters long';
    if (trimmed.length > 50) return 'Board name must be less than 50 characters';
    if (description.length > 200) return 'Description must be 200 characters or fewer';
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const validation = validate();
    if (validation) { setError(validation); return; }

    try {
      setIsSaving(true);
      setError(null);
      await Boards.update(board.id, name.trim(), description.trim() || undefined);
      onBoardUpdated({ id: board.id, name: name.trim(), description: description.trim() || undefined });
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update board');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="boardName">Board Name <span className="text-destructive">*</span></Label>
            <Input id="boardName" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} maxLength={50} disabled={isSaving} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Keep it short and descriptive</span>
              <span>{name.length}/50</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boardDescription">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="boardDescription" value={description} onChange={(e) => setDescription(e.target.value)} onKeyDown={handleKeyDown} maxLength={200} rows={3} disabled={isSaving} className="resize-none" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Explain what this board is for</span>
              <span>{description.length}/200</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }} disabled={isSaving || !!validate()} className="min-w-[100px]">
              {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : (<><Pencil className="w-4 h-4 mr-2" /> Save</>)}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd> to save
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
