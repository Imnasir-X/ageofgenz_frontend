import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { articlesApi } from '@/lib/api/client';
import type { Article } from '@/lib/api/types';
import { cn } from '@/lib/utils';

/**
 * Header search. The panel is min(400px, 100vw - 2rem) wide and anchored to the viewport
 * edge on phones, so it never overflows a 320–390px screen (the old fixed 400px did).
 */
export function SearchPopover() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const id = useId();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      articlesApi
        .list({ search: q, signal: controller.signal })
        .then((r) => setResults(r.results.slice(0, 5)))
        .catch(() => setResults([]))
        .finally(() => !controller.signal.aborted && setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapRef} className="sm:relative">
      <Button variant="ghost" size="icon" aria-label={open ? 'Close search' : 'Search'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? <X /> : <Search />}
      </Button>
      {open && (
        <div
          className={cn(
            'absolute right-4 top-[calc(var(--header-h)-0.25rem)] z-50 w-[min(400px,calc(100vw-2rem))] animate-fade-up rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg',
            'sm:right-0 sm:top-12',
          )}
        >
          <form onSubmit={submit} role="search" className="flex gap-2">
            <label htmlFor={`${id}-q`} className="sr-only">
              Search stories
            </label>
            <Input id={`${id}-q`} ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stories, topics, places" autoComplete="off" />
            <Button type="submit" size="icon" aria-label="See all results">
              <ArrowRight />
            </Button>
          </form>
          <div className="mt-2 min-h-[2rem]" aria-live="polite">
            {loading && (
              <p className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </p>
            )}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <p className="px-1 py-2 text-sm text-muted-foreground">No stories match “{query.trim()}” yet.</p>
            )}
            {!loading && results.length > 0 && (
              <ul className="divide-y">
                {results.map((a) => (
                  <li key={a.slug}>
                    <Link to={a.href} onClick={() => setOpen(false)} className="block rounded-md px-1 py-2.5 hover:bg-muted">
                      <span className="eyebrow text-primary">{a.category.name}</span>
                      <span className="mt-0.5 line-clamp-2 block font-display text-[0.95rem] font-medium leading-snug">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {query.trim().length < 2 && <p className="px-1 py-2 text-xs text-muted-foreground">Type two or more characters. Enter shows all results.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
