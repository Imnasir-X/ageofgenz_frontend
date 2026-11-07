import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fromDhakaLocalInput, toDhakaLocalInput } from '../lib/format';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

/** Pick a publish time in Asia/Dhaka. Scheduling marks the article ready; it still publishes only after approval. */
export function ScheduleDialog({ open, onOpenChange, initial, title, onSchedule }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: string | null;
  title: string;
  onSchedule: (iso: string | null) => Promise<unknown>;
}) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(toDhakaLocalInput(initial) || '');
      setError(null);
    }
  }, [open, initial]);

  const iso = fromDhakaLocalInput(value);
  const inPast = iso ? new Date(iso).getTime() < Date.now() : false;

  const submit = async (when: string | null) => {
    setBusy(true);
    setError(null);
    try {
      await onSchedule(when);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not schedule.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule</DialogTitle>
          <DialogDescription>
            <span className="line-clamp-2">{title}</span>
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Publish time (Asia/Dhaka)</span>
          <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <p className="text-xs text-muted-foreground">
          The article is marked ready now. It goes live at this time only if it has been approved and passes the publish checks.
        </p>
        {inPast && <p className="text-xs text-amber-700 dark:text-amber-300">That time is in the past.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => submit(null)} disabled={busy}>Mark ready, no time</Button>
          <Button onClick={() => submit(iso)} disabled={!iso || inPast} loading={busy}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
