import { useEffect, useId, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Button label, e.g. "Publish now". */
  confirmLabel: string;
  /** destructive = red button (delete, unpublish); public = blue (publish, send). */
  tone?: 'destructive' | 'public' | 'default';
  /** When set, the user must type this exact text before the button enables (newsletter send). */
  typedConfirmation?: string;
  onConfirm: () => Promise<unknown> | unknown;
  children?: ReactNode;
}

/**
 * Every destructive or public action in the Studio goes through this dialog.
 * The action only runs from the confirm button; it closes on success and stays open on error.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  tone = 'default',
  typedConfirmation,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  useEffect(() => {
    if (!open) {
      setTyped('');
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const typedOk = !typedConfirmation || typed.trim() === typedConfirmation;

  const run = async () => {
    if (!typedOk || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent role="alertdialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription asChild><div>{description}</div></DialogDescription>}
        </DialogHeader>
        {children}
        {typedConfirmation && (
          <div className="space-y-2">
            <label htmlFor={inputId} className="text-sm text-muted-foreground">
              Type <span className="font-mono font-medium text-foreground">{typedConfirmation}</span> to confirm
            </label>
            <Input
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && run()}
            />
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            onClick={run}
            disabled={!typedOk || busy}
            aria-busy={busy}
          >
            {busy && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
