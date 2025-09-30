import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  children: React.ReactElement;
}

export function ConfirmDialog({
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      // Let the parent handle the error
      setErrorMessage(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  return (
    <Modal open={open} onOpenChange={(v: boolean) => { setOpen(v); if (!v) setErrorMessage(null); }}>
      <ModalTrigger asChild>
        {children}
      </ModalTrigger>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader>
          <div className="flex items-center gap-3">
            {variant === 'destructive' ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <ModalTitle className="text-lg text-foreground font-semibold">{title}</ModalTitle>
            </div>
          </div>
          <ModalDescription className="text-sm text-muted-foreground mt-3">
            {description}
          </ModalDescription>
        </ModalHeader>
        {errorMessage && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}
        
        <ModalFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                {variant === 'destructive' && <Trash2 className="w-4 h-4 mr-2" />}
                {confirmText}
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}