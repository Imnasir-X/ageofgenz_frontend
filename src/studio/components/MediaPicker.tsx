import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';
import { studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import type { MediaAsset } from '../types';
import { EmptyState, ErrorState, RowsSkeleton } from './common';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

/** Pick an image from the media library. */
export function MediaPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (asset: MediaAsset) => Promise<unknown> }) {
  const [q, setQ] = useState('');
  const query = useDebouncedValue(q, 300);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const media = useApi(() => (open ? studioApi.media({ q: query, page_size: 24 }) : Promise.resolve(null)), [open, query]);

  const confirm = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await onPick(selected);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(48rem,calc(100vw-1.5rem))]">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>Choose the featured image.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search filename, alt text, caption" className="pl-9" aria-label="Search media" />
        </div>
        {media.error ? (
          <ErrorState message={media.error} onRetry={media.reload} />
        ) : media.loading && !media.data ? (
          <RowsSkeleton rows={3} />
        ) : !media.data?.results.length ? (
          <EmptyState title="No images yet">Upload images on the Media page, or upload directly from the article.</EmptyState>
        ) : (
          <ul className="grid max-h-[50dvh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
            {media.data.results.map((asset) => (
              <li key={asset.id}>
                <button
                  type="button"
                  onClick={() => setSelected(asset)}
                  aria-pressed={selected?.id === asset.id}
                  className={cn(
                    'group relative block aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted transition-shadow duration-fast',
                    selected?.id === asset.id && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                  )}
                >
                  <img src={asset.url} alt={asset.alt_text || asset.original_filename} className="size-full object-cover" loading="lazy" />
                  {selected?.id === asset.id && (
                    <span className="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirm} disabled={!selected} loading={busy}>Use this image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
