import { useState } from 'react';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { DataTable, EmptyState, ErrorState, Field, NativeSelect, PageHeader, Panel, RowsSkeleton, Switch } from '../components/common';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import type { Category } from '../types';

type Form = { id?: number; name: string; description: string; parent: number | null; is_active: boolean };
const BLANK: Form = { name: '', description: '', parent: null, is_active: true };

export default function Categories() {
  const list = useApi(() => studioApi.categories(), []);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const byId = new Map((list.data ?? []).map((c) => [c.id, c]));

  const save = async () => {
    if (!form || !form.name.trim()) return;
    setSaving(true);
    try {
      const body = { name: form.name.trim(), description: form.description, parent: form.parent, is_active: form.is_active };
      if (form.id) await studioApi.updateCategory(form.id, body);
      else await studioApi.createCategory(body);
      toast(form.id ? 'Category saved' : 'Category created');
      setForm(null);
      list.reload();
    } catch (err) {
      toast('Could not save', { tone: 'error', description: errorText(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Categories" description="Sections and sub-sections. A category with articles can be hidden but not deleted." actions={<Button onClick={() => setForm(BLANK)}><FolderPlus /> New category</Button>} />
      <Panel bodyClassName="p-0 sm:p-0">
        {list.error ? <div className="p-4"><ErrorState message={list.error} onRetry={list.reload} /></div> : list.loading && !list.data ? <div className="p-4"><RowsSkeleton /></div> : !list.data?.length ? (
          <EmptyState title="No categories yet" />
        ) : (
          <div className="px-4 pb-2 sm:px-2">
            <DataTable>
              <thead><tr><th>Name</th><th>Parent</th><th className="text-right">Articles</th><th>Visible</th><th className="w-24" /></tr></thead>
              <tbody>
                {list.data.map((c) => (
                  <tr key={c.id}>
                    <td><span className="font-medium">{c.name}</span><span className="block font-mono text-xs text-muted-foreground">/{c.slug}</span></td>
                    <td className="text-muted-foreground">{c.parent ? byId.get(c.parent)?.name ?? '–' : '–'}</td>
                    <td className="text-right font-mono tabular-nums">{c.article_count}</td>
                    <td>
                      <Switch
                        label={`${c.name} visible`}
                        checked={c.is_active}
                        onCheckedChange={async (v) => {
                          try {
                            await studioApi.updateCategory(c.id, { is_active: v });
                            list.setData((prev) => prev?.map((x) => (x.id === c.id ? { ...x, is_active: v } : x)) ?? prev);
                          } catch (err) {
                            toast('Could not update', { tone: 'error', description: errorText(err) });
                          }
                        }}
                      />
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" size="icon-sm" aria-label={`Edit ${c.name}`} onClick={() => setForm({ id: c.id, name: c.name, description: c.description, parent: c.parent, is_active: c.is_active })}><Pencil /></Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)} disabled={c.article_count > 0}><Trash2 /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        )}
      </Panel>

      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form?.id ? 'Edit category' : 'New category'}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4">
              <Field label="Name">{(id) => <Input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />}</Field>
              <Field label="Description">{(id) => <Textarea id={id} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}</Field>
              <Field label="Parent">
                {(id) => (
                  <NativeSelect id={id} className="w-full" value={form.parent ?? ''} onChange={(e) => setForm({ ...form, parent: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">None (top level)</option>
                    {list.data?.filter((c) => c.id !== form.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </NativeSelect>
                )}
              </Field>
              <div className="flex items-center justify-between"><span className="text-sm">Visible on the site</span><Switch label="Visible on the site" checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!form?.name.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        tone="destructive"
        title={`Delete ${deleting?.name ?? 'category'}?`}
        description="This removes the category. Links to its page will stop working."
        confirmLabel="Delete category"
        onConfirm={async () => {
          if (!deleting) return;
          await studioApi.deleteCategory(deleting.id);
          toast('Category deleted');
          list.reload();
        }}
      />
    </div>
  );
}
