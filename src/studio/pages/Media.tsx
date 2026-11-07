import { useRef, useState } from 'react';
import { ImagePlus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { toast } from '@/lib/toast';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { EmptyState, ErrorState, Field, PageHeader, Pager, RowsSkeleton } from '../components/common';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { fmtDate } from '../lib/format';
import type { MediaAsset } from '../types';

const PAGE = 24;

export default function Media() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(q, 300);
  const list = useApi(() => studioApi.media({ q: query, page, page_size: PAGE }), [query, page]);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) await studioApi.uploadMedia(file, { alt_text: '' });
      toast(files.length > 1 ? `${files.length} images uploaded` : 'Image uploaded');
      list.reload();
    } catch (err) {
      toast('Upload failed', { tone: 'error', description: errorText(err) });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Media"
        description="Images stored on Cloudinary. Add alt text so every reader gets the picture."
        actions={
          <>
            <Button onClick={() => fileRef.current?.click()} loading={uploading}>{!uploading && <ImagePlus />} Upload</Button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} aria-label="Upload images" />
          </>
        }
      />
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search filename, alt text, caption" className="pl-9" aria-label="Search media" />
      </div>
      {list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : list.loading && !list.data ? <RowsSkeleton /> : !list.data?.results.length ? (
        <div className="rounded-lg border bg-card"><EmptyState title="No images yet">Upload an image to start the library.</EmptyState></div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {list.data.results.map((asset) => (
              <li key={asset.id} className="group overflow-hidden rounded-lg border bg-card">
                <button type="button" className="block aspect-[4/3] w-full overflow-hidden bg-muted" onClick={() => setEditing(asset)} aria-label={`Edit ${asset.original_filename}`}>
                  <img src={asset.url} alt={asset.alt_text} loading="lazy" className="size-full object-cover transition-transform duration-slow ease-standard motion-safe:group-hover:scale-[1.02]" />
                </button>
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-xs font-medium" title={asset.original_filename}>{asset.original_filename || asset.public_id}</p>
                  <p className="font-mono text-[0.68rem] text-muted-foreground">{asset.width}×{asset.height} · {fmtDate(asset.created_at)}</p>
                  {!asset.alt_text && <p className="text-[0.68rem] text-amber-700 dark:text-amber-300">No alt text</p>}
                </div>
              </li>
            ))}
          </ul>
          <Pager page={page} count={list.data.count} pageSize={PAGE} onPage={setPage} />
        </>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="w-[min(40rem,calc(100vw-1.5rem))]">
          <DialogHeader><DialogTitle>Image details</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
              <img src={editing.url} alt={editing.alt_text} className="aspect-[4/3] w-full rounded-md border object-cover" />
              <div className="space-y-3">
                <Field label="Alt text" hint="Describe what is in the image.">{(id) => <Input id={id} value={editing.alt_text} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} />}</Field>
                <Field label="Caption">{(id) => <Input id={id} value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} />}</Field>
                <Field label="Credit">{(id) => <Input id={id} value={editing.credit} onChange={(e) => setEditing({ ...editing, credit: e.target.value })} />}</Field>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" className="text-destructive sm:mr-auto" onClick={() => { setDeleting(editing); setEditing(null); }}><Trash2 /> Delete</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={saving} onClick={async () => {
              if (!editing) return;
              setSaving(true);
              try {
                await studioApi.updateMedia(editing.id, { alt_text: editing.alt_text, caption: editing.caption, credit: editing.credit });
                toast('Saved');
                setEditing(null);
                list.reload();
              } catch (err) {
                toast('Could not save', { tone: 'error', description: errorText(err) });
              } finally {
                setSaving(false);
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        tone="destructive"
        title="Delete this image from the library?"
        description="Articles that already use it keep their image. The library entry is removed."
        confirmLabel="Delete image"
        onConfirm={async () => {
          if (!deleting) return;
          await studioApi.deleteMedia(deleting.id);
          toast('Image deleted');
          list.reload();
        }}
      />
    </div>
  );
}
