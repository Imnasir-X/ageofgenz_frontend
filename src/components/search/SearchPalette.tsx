import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, ArrowDown, ArrowRight, ArrowUp, CornerDownLeft, FileText, History, Loader2, RotateCw, Search, TrendingUp, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Highlight } from './Highlight';
import { SEARCH_MIN_CHARS, useArticleSearch } from '@/hooks/useArticleSearch';
import { useAsync } from '@/hooks/useAsync';
import { articlesApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import type { Article } from '@/lib/api/types';
import { addRecentSearch, clearRecentSearches, getRecentSearches } from '@/lib/search/recent';
import { SearchPaletteContext, isTypingTarget, type SearchPaletteApi } from '@/lib/search/palette-context';
import { startArticleLoad, warmArticle } from '@/lib/prefetch';
import { PRIMARY_NAV, SECTIONS } from '@/constants/sections';
import { cn } from '@/lib/utils';

const RESULT_LIMIT = 6;

const groupHeading =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.68rem] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground';

const itemCls =
  'relative flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm outline-none transition-colors duration-fast data-[selected=true]:bg-muted data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50';

function Kbd({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <kbd aria-label={label} className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-mono text-[0.68rem] text-muted-foreground">
      {children}
    </kbd>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-1 p-2" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-4 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

/** The search palette itself. Exported for tests; the app mounts it through SearchPaletteProvider. */
export function SearchPaletteDialog({ open, onOpenChange, initialQuery = '' }: PaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [recents, setRecents] = useState<string[]>([]);
  const search = useArticleSearch(query, { enabled: open });
  const trending = useAsync((signal) => cached('latest', () => articlesApi.latest(signal)), 'latest', { enabled: open });

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setRecents(getRecentSearches());
    }
  }, [open, initialQuery]);

  const q = query.trim();
  const typing = q.length >= SEARCH_MIN_CHARS;
  const busy = typing && (search.pending || search.status === 'loading');
  const results = search.results.slice(0, RESULT_LIMIT);
  const showResults = typing && results.length > 0;
  const settledEmpty = typing && !busy && search.status === 'success' && search.results.length === 0;

  const go = useCallback(
    (to: string, state?: unknown) => {
      onOpenChange(false);
      navigate(to, state ? { state } : undefined);
    },
    [navigate, onOpenChange],
  );

  const openArticle = (a: Article) => {
    if (typing) setRecents(addRecentSearch(q));
    startArticleLoad(a);
    go(a.href, { preview: a });
  };

  const seeAll = (term = q) => {
    if (term.length >= SEARCH_MIN_CHARS) setRecents(addRecentSearch(term));
    go(`/search?q=${encodeURIComponent(term)}`);
  };

  const sections = useMemo(() => PRIMARY_NAV.slice(0, 6).map((k) => SECTIONS[k]), []);
  const latest = (trending.data ?? []).slice(0, 4);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-fast data-[state=open]:duration-base" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-3 z-50 w-[calc(100vw-1.5rem)] max-w-[40rem] -translate-x-1/2 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl sm:top-[12vh]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] data-[state=open]:slide-in-from-top-2',
            'data-[state=closed]:duration-fast data-[state=open]:duration-base',
          )}
        >
          <Dialog.Title className="sr-only">Search stories</Dialog.Title>
          <Command shouldFilter={false} loop label="Search stories" className="flex max-h-[min(36rem,calc(100dvh-1.5rem))] flex-col">
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search stories, topics, places"
                aria-label="Search stories"
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  // Shift+Enter (or Cmd/Ctrl+Enter) jumps straight to the full results page.
                  if (e.key === 'Enter' && (e.shiftKey || e.metaKey || e.ctrlKey) && typing) {
                    e.preventDefault();
                    seeAll();
                  }
                }}
              />
              {busy && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Searching" />}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground sm:size-9"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
              <Dialog.Close
                className="inline-flex h-11 shrink-0 items-center rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground sm:h-auto sm:px-0 sm:hover:bg-transparent"
                aria-label="Close search"
              >
                <span className="sm:hidden">Cancel</span>
                <span className="hidden sm:inline-flex">
                  <Kbd>Esc</Kbd>
                </span>
              </Dialog.Close>
            </div>

            <Command.List className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain p-2', groupHeading)}>
              <div aria-live="polite" className="sr-only">
                {typing && !busy && search.status === 'success' ? `${search.count} ${search.count === 1 ? 'story' : 'stories'} found` : ''}
              </div>

              {!typing && (
                <>
                  {recents.length > 0 && (
                    <Command.Group heading="Recent searches">
                      {recents.map((r) => (
                        <Command.Item key={`recent-${r}`} value={`recent-${r}`} onSelect={() => setQuery(r)} className={itemCls}>
                          <History className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="truncate">{r}</span>
                        </Command.Item>
                      ))}
                      <Command.Item value="recent-clear" onSelect={() => setRecents(clearRecentSearches())} className={cn(itemCls, 'text-muted-foreground')}>
                        <X className="size-4 shrink-0" aria-hidden="true" />
                        Clear recent searches
                      </Command.Item>
                    </Command.Group>
                  )}
                  {latest.length > 0 && (
                    <Command.Group heading="Latest stories">
                      {latest.map((a) => (
                        <Command.Item key={a.slug} value={`latest-${a.slug}`} onSelect={() => openArticle(a)} onMouseEnter={() => warmArticle(a)} className={itemCls}>
                          <TrendingUp className="size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="line-clamp-1 font-display text-[0.98rem] font-medium">{a.title}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}
                  <Command.Group heading="Browse a section">
                    <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                      {sections.map((s) => (
                        <Command.Item
                          key={s.path}
                          value={`section-${s.path}`}
                          onSelect={() => go(s.path)}
                          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border bg-card px-3.5 text-sm font-medium outline-none transition-colors duration-fast data-[selected=true]:border-primary data-[selected=true]:text-primary sm:min-h-9"
                        >
                          {s.label}
                        </Command.Item>
                      ))}
                    </div>
                  </Command.Group>
                </>
              )}

              {typing && busy && !showResults && <ResultSkeleton />}

              {showResults && (
                <Command.Group heading="Stories" className={cn(busy && 'opacity-70 transition-opacity duration-fast')}>
                  {results.map((a) => (
                    <Command.Item key={a.slug} value={`article-${a.slug}`} onSelect={() => openArticle(a)} onMouseEnter={() => warmArticle(a)} className={cn(itemCls, 'items-start')}>
                      <FileText className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="eyebrow block text-primary">{a.category.name}</span>
                        <span className="mt-0.5 line-clamp-2 block font-display text-[1rem] font-medium leading-snug">
                          <Highlight text={a.title} query={search.query} />
                        </span>
                      </span>
                    </Command.Item>
                  ))}
                  <Command.Item value="see-all" onSelect={() => seeAll()} className={cn(itemCls, 'font-medium text-primary')}>
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                    {search.count > results.length ? `See all ${search.count} results for “${q}”` : `Open the search page for “${q}”`}
                  </Command.Item>
                </Command.Group>
              )}

              {settledEmpty && (
                <div className="px-3 py-6">
                  <p className="font-display text-lg font-medium">No stories match “{q}” yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try fewer words, a different spelling, or browse a section.</p>
                  <Command.Group heading="Sections" className="-mx-3 mt-3">
                    {sections.slice(0, 4).map((s) => (
                      <Command.Item key={s.path} value={`empty-section-${s.path}`} onSelect={() => go(s.path)} className={itemCls}>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {s.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </div>
              )}

              {typing && !busy && search.status === 'error' && (
                <div className="px-3 py-6" role="alert">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertCircle className="size-4 text-destructive" aria-hidden="true" /> Search didn’t load.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{search.error}</p>
                  <Command.Group className="-mx-3 mt-3">
                    <Command.Item value="retry" onSelect={search.retry} className={itemCls}>
                      <RotateCw className="size-4 shrink-0" aria-hidden="true" /> Try again
                    </Command.Item>
                  </Command.Group>
                </div>
              )}

              {!typing && q.length > 0 && <p className="px-3 py-3 text-xs text-muted-foreground">Keep typing: two or more characters.</p>}
            </Command.List>

            <div className="hidden items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <Kbd label="Up">
                  <ArrowUp className="size-3" />
                </Kbd>
                <Kbd label="Down">
                  <ArrowDown className="size-3" />
                </Kbd>
                to move
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd label="Enter">
                  <CornerDownLeft className="size-3" />
                </Kbd>
                to open
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <Kbd>Shift</Kbd>
                <Kbd label="Enter">
                  <CornerDownLeft className="size-3" />
                </Kbd>
                all results
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Mounts the palette once and opens it from anywhere: Ctrl/Cmd+K (also while typing),
 * "/" (when not typing in a field), or the header search button via useSearchPalette().
 */
export function SearchPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setInitialQuery('');
        setOpen((v) => !v);
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        setInitialQuery('');
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const api = useMemo<SearchPaletteApi>(
    () => ({
      open: (q = '') => {
        setInitialQuery(q);
        setOpen(true);
      },
      close: () => setOpen(false),
      isOpen: open,
    }),
    [open],
  );

  return (
    <SearchPaletteContext.Provider value={api}>
      {children}
      <SearchPaletteDialog open={open} onOpenChange={setOpen} initialQuery={initialQuery} />
    </SearchPaletteContext.Provider>
  );
}
