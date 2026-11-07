import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Archive, ArrowLeft, CalendarClock, Check, ExternalLink, ImagePlus, Images, Loader2, RotateCcw, Save, Send, ShieldCheck, Sparkles, Trash2, Undo2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { CheckFlags, ErrorState, Field, NativeSelect, PageHeader, Panel, RowsSkeleton, StatusBadge, Switch } from '../components/common';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ScheduleDialog } from '../components/ScheduleDialog';
import { MediaPicker } from '../components/MediaPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { fmtDateTime } from '../lib/format';
import { sanitizeArticleHtml } from '../lib/sanitize';
import type { StudioArticle } from '../types';

type Draft = Pick<StudioArticle, 'title' | 'excerpt' | 'tldr' | 'why_it_matters' | 'content' | 'meta_title' | 'meta_description' | 'category' | 'is_featured' | 'source_url'>;
const EMPTY: Draft = { title: '', excerpt: '', tldr: '', why_it_matters: '', content: '', meta_title: '', meta_description: '', category: null, is_featured: false, source_url: '' };
const pick = (a: StudioArticle): Draft => ({
  title: a.title ?? '', excerpt: a.excerpt ?? '', tldr: a.tldr ?? '', why_it_matters: a.why_it_matters ?? '', content: a.content ?? '',
  meta_title: a.meta_title ?? '', meta_description: a.meta_description ?? '', category: a.category, is_featured: a.is_featured, source_url: a.source_url ?? '',
});

type Confirm = null | 'publish' | 'unpublish' | 'archive' | 'delete' | 'remove-image';
const HERMES_STEPS = [
  { step: 'check', label: 'Run checks', icon: ShieldCheck },
  { step: 'seo', label: 'SEO pack', icon: Sparkles },
  { step: 'summaries', label: 'Summaries', icon: Sparkles },
] as const;

export default function ArticleEditor() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const isNew = !idParam;
  const id = Number(idParam);
  const loaded = useApi(() => (isNew ? Promise.resolve(null) : studioApi.article(id)), [idParam]);
  const categories = useApi(() => studioApi.categories(), []);
  const [article, setArticle] = useState<StudioArticle | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saved, setSaved] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [scheduling, setScheduling] = useState(false);
  const [picking, setPicking] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loaded.data) {
      setArticle(loaded.data);
      setDraft(pick(loaded.data));
      setSaved(pick(loaded.data));
    }
  }, [loaded.data]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const applyArticle = (a: StudioArticle) => {
    setArticle(a);
    const p = pick(a);
    setDraft((d) => (JSON.stringify(d) === JSON.stringify(saved) ? p : d));
    setSaved(p);
  };

  const save = async (): Promise<StudioArticle | null> => {
    if (!draft.title.trim()) {
      toast('Add a title first', { tone: 'error' });
      return null;
    }
    setSaving(true);
    try {
      const body = { ...draft, content: sanitizeArticleHtml(draft.content) };
      if (isNew) {
        const created = await studioApi.createArticle(body);
        setSaved(pick(created));
        setDraft(pick(created));
        toast('Draft created');
        navigate(`/studio/articles/${created.id}`, { replace: true });
        return created;
      }
      const updated = await studioApi.updateArticle(id, body);
      setArticle(updated);
      setSaved(pick(updated));
      setDraft(pick(updated));
      toast('Saved');
      return updated;
    } catch (err) {
      toast('Could not save', { tone: 'error', description: errorText(err) });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveIfDirty = async () => (dirty ? save() : article);

  const runStep = async (step: string) => {
    if (!article) return;
    setRunning(step);
    try {
      await saveIfDirty();
      await studioApi.runStep(article.id, step);
      applyArticle(await studioApi.article(article.id));
      toast('Hermes step finished', { description: step === 'check' ? 'Check flags are updated.' : 'Review the suggestions in the fields.' });
    } catch (err) {
      toast('Hermes step failed', { tone: 'error', description: errorText(err) });
    } finally {
      setRunning(null);
    }
  };

  const onUpload = async (file: File | undefined) => {
    if (!file || !article) return;
    try {
      applyArticle(await studioApi.uploadFeatured(article.id, file));
      toast('Image uploaded');
    } catch (err) {
      toast('Upload failed', { tone: 'error', description: errorText(err) });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!isNew && loaded.error) return <ErrorState message={loaded.error} onRetry={loaded.reload} />;
  if (!isNew && !article) return <RowsSkeleton rows={8} />;

  const status = article?.status ?? 'draft';
  const metaTitle = draft.meta_title || draft.title;
  const metaDesc = draft.meta_description || draft.excerpt;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/studio/articles" onClick={(e) => { if (dirty && !window.confirm('Leave without saving? Your changes will be lost.')) e.preventDefault(); }}>
            <ArrowLeft /> Articles
          </Link>
        </Button>
      </div>
      <PageHeader
        title={isNew ? 'New article' : 'Edit article'}
        description={
          article ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              {article.published_at && status === 'published' && <span>Live since {fmtDateTime(article.published_at)}</span>}
              {article.scheduled_for && status !== 'published' && <span>Scheduled {fmtDateTime(article.scheduled_for)}</span>}
              {article.human_approved && <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><Check className="size-3.5" /> Approved{article.approved_by ? ` by ${article.approved_by}` : ''}</span>}
            </span>
          ) : 'Starts as a draft. Nothing goes live until you publish and confirm.'
        }
        actions={
          <>
            {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            <Button variant="outline" onClick={save} loading={saving} disabled={!dirty && !isNew}>
              {!saving && <Save />} Save
            </Button>
            {article && status !== 'published' && status !== 'archived' && (
              <Button onClick={() => setConfirm('publish')}><Send /> Publish</Button>
            )}
            {article && status === 'published' && (
              <Button variant="outline" asChild><a href={`/articles/${article.slug}/`} target="_blank" rel="noopener"><ExternalLink /> View live</a></Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <Panel>
            <div className="space-y-4">
              <Field label="Headline" counter={`${draft.title.length}/300`}>
                {(fid) => <Input id={fid} value={draft.title} maxLength={300} onChange={(e) => set('title', e.target.value)} className="h-12 font-display text-xl sm:text-xl" placeholder="Write a clear, specific headline" />}
              </Field>
              <Field label="Standfirst (excerpt)" hint="One or two sentences shown under the headline and on cards.">
                {(fid) => <Textarea id={fid} rows={2} value={draft.excerpt} onChange={(e) => set('excerpt', e.target.value)} />}
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="TL;DR">{(fid) => <Textarea id={fid} rows={3} value={draft.tldr} onChange={(e) => set('tldr', e.target.value)} />}</Field>
                <Field label="Why it matters">{(fid) => <Textarea id={fid} rows={3} value={draft.why_it_matters} onChange={(e) => set('why_it_matters', e.target.value)} />}</Field>
              </div>
            </div>
          </Panel>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Body</p>
            <RichTextEditor label="Article body" value={draft.content} onChange={(html) => set('content', html)} />
            <p className="text-xs text-muted-foreground">Pasted content is cleaned: scripts, styles, embeds and unsafe links are removed before saving.</p>
          </div>

          <Panel title="Search and sharing" description="What Google and social cards show. Blank fields fall back to the headline and standfirst.">
            <div className="space-y-4">
              <Field label="Meta title" counter={`${draft.meta_title.length}/60`} hint={draft.meta_title.length > 60 ? 'Longer than 60 characters may be cut off in search results.' : undefined}>
                {(fid) => <Input id={fid} value={draft.meta_title} onChange={(e) => set('meta_title', e.target.value)} />}
              </Field>
              <Field label="Meta description" counter={`${draft.meta_description.length}/160`} hint={draft.meta_description.length > 160 ? 'Longer than 160 characters may be cut off.' : undefined}>
                {(fid) => <Textarea id={fid} rows={2} value={draft.meta_description} onChange={(e) => set('meta_description', e.target.value)} />}
              </Field>
              <div className="rounded-md border bg-background p-3" aria-label="Search result preview">
                <p className="truncate text-xs text-muted-foreground">theageofgenz.com › articles › {article?.slug || 'new-article'}</p>
                <p className="mt-0.5 line-clamp-1 text-[1.05rem] text-primary">{metaTitle || 'Headline'}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{metaDesc || 'Description'}</p>
              </div>
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          {article && (
            <Panel title="Checks" description={article.check_status ? `Overall: ${article.check_status.replace('_', ' ')}` : 'Not checked yet'}>
              <div className="space-y-3">
                <ul className="space-y-2">
                  {(['fact', 'risk', 'seo', 'duplicate'] as const).map((k) => (
                    <li key={k}><CheckFlags flags={{ [k]: article.check_flags[k] } as StudioArticle['check_flags']} /></li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  {HERMES_STEPS.map(({ step, label, icon: Icon }) => (
                    <Button key={step} size="sm" variant="outline" onClick={() => runStep(step)} disabled={running !== null}>
                      {running === step ? <Loader2 className="animate-spin" /> : <Icon />} {label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Runs through Hermes. Without HERMES_URL the steps use safe local stubs.</p>
              </div>
            </Panel>
          )}

          <Panel title="Publishing">
            <div className="space-y-3">
              <Field label="Category">
                {(fid) => (
                  <NativeSelect id={fid} className="w-full" value={draft.category ?? ''} onChange={(e) => set('category', e.target.value ? Number(e.target.value) : null)}>
                    <option value="">No category</option>
                    {categories.data?.filter((c) => c.is_active || c.id === draft.category).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </NativeSelect>
                )}
              </Field>
              <Field label="Source URL">{(fid) => <Input id={fid} type="url" value={draft.source_url} onChange={(e) => set('source_url', e.target.value)} placeholder="https://" />}</Field>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm">Featured on home</span>
                <Switch label="Featured on home" checked={draft.is_featured} onCheckedChange={(v) => set('is_featured', v)} />
              </div>
              {article && (
                <div className="grid gap-2 border-t pt-3">
                  {status !== 'published' && status !== 'archived' && (
                    <>
                      <Button variant="outline" size="sm" onClick={async () => {
                        await saveIfDirty();
                        try {
                          applyArticle(await studioApi.approve(article.id));
                          toast('Approved', { description: 'Not published yet.' });
                        } catch (err) { toast('Could not approve', { tone: 'error', description: errorText(err) }); }
                      }} disabled={article.human_approved}>
                        <Check /> {article.human_approved ? 'Approved' : 'Approve'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setScheduling(true)}><CalendarClock /> Schedule</Button>
                    </>
                  )}
                  {status === 'published' && <Button variant="outline" size="sm" onClick={() => setConfirm('unpublish')}><Undo2 /> Unpublish</Button>}
                  {status !== 'archived' ? (
                    <Button variant="ghost" size="sm" onClick={() => setConfirm('archive')}><Archive /> Archive</Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={async () => { applyArticle(await studioApi.restore(article.id)); toast('Restored as a draft'); }}><RotateCcw /> Restore</Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirm('delete')}><Trash2 /> Delete permanently</Button>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Featured image">
            {article ? (
              <div className="space-y-3">
                {article.featured_image_url ? (
                  <img src={article.featured_image_url} alt="" className="aspect-[16/9] w-full rounded-md border object-cover" />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">No image</div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPicking(true)}><Images /> Library</Button>
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><ImagePlus /> Upload</Button>
                  {article.featured_image && <Button variant="ghost" size="sm" onClick={() => setConfirm('remove-image')}><X /> Remove</Button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onUpload(e.target.files?.[0])} aria-label="Upload featured image" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Save the draft first, then add an image.</p>
            )}
          </Panel>
        </aside>
      </div>

      {article && (
        <>
          <ConfirmDialog
            open={confirm === 'publish'}
            onOpenChange={(o) => !o && setConfirm(null)}
            tone="public"
            title="Publish this article?"
            description={<>It goes live on theageofgenz.com for everyone. Publishing also records your approval. PublishGuard, duplicate and Hermes checks still apply and may block it.</>}
            confirmLabel="Publish now"
            onConfirm={async () => {
              await saveIfDirty();
              const res = await studioApi.publish(article.id);
              applyArticle(res.article);
              if (res.published) toast('Published', { description: 'The article is live.' });
              else if (res.reason === 'scheduled_in_future') toast('Approved and scheduled', { description: `Goes live ${fmtDateTime(res.article.scheduled_for)}.` });
              else throw new Error(`Not published: ${res.reason}`);
            }}
          >
            <div className="rounded-md bg-muted/60 p-3"><CheckFlags flags={article.check_flags} /></div>
          </ConfirmDialog>
          <ConfirmDialog
            open={confirm === 'unpublish'}
            onOpenChange={(o) => !o && setConfirm(null)}
            tone="destructive"
            title="Take this article down?"
            description="It disappears from the site and goes back to draft. Its approval is cleared."
            confirmLabel="Unpublish"
            onConfirm={async () => {
              applyArticle(await studioApi.unpublish(article.id));
              toast('Unpublished');
            }}
          />
          <ConfirmDialog
            open={confirm === 'archive'}
            onOpenChange={(o) => !o && setConfirm(null)}
            tone="destructive"
            title="Archive this article?"
            description="Archiving unpublishes it and hides it from the newsroom. You can restore it later."
            confirmLabel="Archive"
            onConfirm={async () => {
              applyArticle(await studioApi.archive(article.id));
              toast('Archived');
            }}
          />
          <ConfirmDialog
            open={confirm === 'delete'}
            onOpenChange={(o) => !o && setConfirm(null)}
            tone="destructive"
            title="Delete permanently?"
            description="This cannot be undone. Archive instead if you might need it again."
            confirmLabel="Delete forever"
            typedConfirmation="DELETE"
            onConfirm={async () => {
              await studioApi.deleteArticle(article.id);
              setSaved(draft);
              toast('Deleted');
              navigate('/studio/articles', { replace: true });
            }}
          />
          <ConfirmDialog
            open={confirm === 'remove-image'}
            onOpenChange={(o) => !o && setConfirm(null)}
            tone="destructive"
            title="Remove the featured image?"
            description="The image stays in the media library."
            confirmLabel="Remove image"
            onConfirm={async () => applyArticle(await studioApi.removeFeatured(article.id))}
          />
          <ScheduleDialog
            open={scheduling}
            onOpenChange={setScheduling}
            initial={article.scheduled_for}
            title={draft.title}
            onSchedule={async (iso) => {
              await saveIfDirty();
              applyArticle(await studioApi.schedule(article.id, iso));
              toast(iso ? `Scheduled for ${fmtDateTime(iso)}` : 'Marked ready');
            }}
          />
          <MediaPicker
            open={picking}
            onOpenChange={setPicking}
            onPick={async (asset) => {
              applyArticle(await studioApi.setFeaturedFromMedia(article.id, asset.id));
              toast('Featured image set');
            }}
          />
        </>
      )}

    </div>
  );
}
