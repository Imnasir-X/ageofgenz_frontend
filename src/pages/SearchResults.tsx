import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/news/StoryCard';
import { EmptyState, ErrorState, StoryRowSkeleton } from '@/components/news/States';
import { Highlight } from '@/components/search/Highlight';
import { SEARCH_MIN_CHARS, searchArticles, useArticleSearch } from '@/hooks/useArticleSearch';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Article } from '@/lib/api/types';
import { addRecentSearch, getRecentSearches } from '@/lib/search/recent';
import { toast } from '@/lib/toast';
import { PRIMARY_NAV, SECTIONS } from '@/constants/sections';
import { cn } from '@/lib/utils';

/** Category filters the backend supports (category__slug + include_subs). Unique slugs only. */
const FILTERS = Array.from(
  new Map(
    PRIMARY_NAV.map((k) => SECTIONS[k])
      .filter((s) => s.category)
      .map((s) => [s.category as string, s.label]),
  ),
).map(([slug, label]) => ({ slug, label }));

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const urlQ = (params.get('q') || '').trim();
  const urlCat = params.get('cat') || undefined;
  const [value, setValue] = useState(urlQ);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Back/forward or a link changing ?q= updates the field; our own debounced URL writes do not
  // (the reader may have typed further since).
  const lastWritten = useRef<string | null>(null);
  useEffect(() => {
    if (urlQ === lastWritten.current) return;
    setValue(urlQ);
  }, [urlQ]);
  useEffect(() => setRecents(getRecentSearches()), []);

  // URL follows the debounced input (replace, so typing does not flood history).
  const debounced = useDebouncedValue(value.trim(), 300);
  useEffect(() => {
    if (debounced === urlQ) return;
    const next = new URLSearchParams(params);
    if (debounced) next.set('q', debounced);
    else next.delete('q');
    lastWritten.current = debounced;
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const search = useArticleSearch(value, { category: urlCat });
  const q = search.query;
  const typing = value.trim().length >= SEARCH_MIN_CHARS;

  // Pagination ("More results"), reset whenever the query or filter changes.
  const [extra, setExtra] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    setExtra([]);
    setPage(1);
    setNext(search.next);
  }, [search.query, search.next, urlCat]);

  // A query that settles with results counts as a recent search.
  useEffect(() => {
    if (search.status === 'success' && search.count > 0 && q.length >= SEARCH_MIN_CHARS) setRecents(addRecentSearch(q));
  }, [search.status, search.count, q]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const r = await searchArticles(q, urlCat, page + 1);
      setExtra((e) => e.concat(r.results));
      setNext(r.next);
      setPage((p) => p + 1);
    } catch {
      toast('Couldn’t load more results', { tone: 'error', description: 'Check your connection and try again.' });
    } finally {
      setLoadingMore(false);
    }
  };

  const setCategory = (slug?: string) => {
    const nextParams = new URLSearchParams(params);
    if (slug) nextParams.set('cat', slug);
    else nextParams.delete('cat');
    if (value.trim()) nextParams.set('q', value.trim());
    setParams(nextParams, { replace: true });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = value.trim();
    const nextParams = new URLSearchParams(params);
    if (term) nextParams.set('q', term);
    else nextParams.delete('q');
    setParams(nextParams);
    inputRef.current?.blur();
  };

  const busy = typing && (search.pending || search.status === 'loading');
  const results = search.results.concat(extra);
  const activeFilter = FILTERS.find((f) => f.slug === urlCat);

  return (
    <>
      <Seo title={urlQ ? `Search: ${urlQ}` : 'Search'} description="Search The Age of GenZ stories by topic, place or person." path="/search/" noindex={Boolean(urlQ)} />
      <div className="container max-w-4xl pt-8 sm:pt-12">
        <p className="eyebrow text-primary">Search</p>
        <form onSubmit={submit} role="search" className="mt-4">
          <label htmlFor="search-q" className="sr-only">
            Search stories
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              id="search-q"
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search stories, topics, places"
              autoComplete="off"
              enterKeyHint="search"
              autoFocus={!urlQ}
              className="h-14 w-full rounded-lg border border-input bg-card pl-12 pr-12 text-lg shadow-sm transition-[border-color,box-shadow] duration-fast ease-standard placeholder:text-muted-foreground focus-visible:border-primary [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  setValue('');
                  inputRef.current?.focus();
                }}
                className="absolute right-1.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </form>

        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by section">
          <FilterChip active={!urlCat} onClick={() => setCategory(undefined)}>
            All sections
          </FilterChip>
          {FILTERS.map((f) => (
            <FilterChip key={f.slug} active={urlCat === f.slug} onClick={() => setCategory(f.slug)}>
              {f.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-8 min-h-[2rem]" aria-live="polite">
          {typing && !busy && search.status === 'success' && (
            <p className="font-display text-2xl font-medium">
              {search.count} {search.count === 1 ? 'result' : 'results'} for “<Highlight text={q} query={q} />”
              {activeFilter && <span className="text-muted-foreground"> in {activeFilter.label}</span>}
            </p>
          )}
          {busy && <p className="sr-only">Searching</p>}
        </div>

        <div className="mt-4">
          {!typing ? (
            <div className="rounded-lg border bg-card p-6">
              <p className="font-display text-xl font-medium">Try a topic, a place or a person.</p>
              {recents.length > 0 && (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">Your recent searches</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {recents.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => setValue(r)}
                          className="inline-flex min-h-11 items-center rounded-full border bg-background px-3.5 text-sm font-medium transition-colors duration-fast hover:border-primary hover:text-primary sm:min-h-9"
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-4 text-sm text-muted-foreground">Or browse a section</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {PRIMARY_NAV.map((k) => (
                  <li key={k}>
                    <Link
                      to={SECTIONS[k].path}
                      className="inline-flex min-h-11 items-center rounded-full bg-muted px-3.5 text-sm font-medium transition-colors duration-fast hover:bg-mist sm:min-h-9"
                    >
                      {SECTIONS[k].label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 hidden text-xs text-muted-foreground sm:block">
                Tip: press <kbd className="rounded border bg-muted px-1 font-mono">/</kbd> or{' '}
                <kbd className="rounded border bg-muted px-1 font-mono">Ctrl K</kbd> on any page to search.
              </p>
            </div>
          ) : busy && results.length === 0 ? (
            <StoryRowSkeleton count={4} className="border-y" />
          ) : search.status === 'error' ? (
            <ErrorState message={search.error ?? undefined} onRetry={search.retry} />
          ) : search.status === 'success' && results.length === 0 ? (
            <EmptyState
              title="Nothing matches yet"
              body={
                activeFilter
                  ? `No ${activeFilter.label} stories match. Try all sections, fewer words, or a different spelling.`
                  : 'Try fewer words, a different spelling, or a broader topic.'
              }
            />
          ) : (
            <>
              <div className={cn('divide-y border-y transition-opacity duration-fast', busy && 'opacity-60')}>
                {results.map((a) => (
                  <StoryCard key={a.slug} article={a} variant="row" />
                ))}
              </div>
              {next && !busy && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" onClick={loadMore} loading={loadingMore}>
                    More results
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-colors duration-fast ease-standard motion-safe:active:scale-[0.97] sm:min-h-9',
        active ? 'border-foreground bg-foreground text-background' : 'bg-card hover:border-foreground/40',
      )}
    >
      {children}
    </button>
  );
}
