import { useEffect, useState } from 'react';
import { articlesApi, ApiError } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import type { Article } from '@/lib/api/types';
import { useDebouncedValue } from './useDebouncedValue';

export const SEARCH_DEBOUNCE_MS = 200;
export const SEARCH_MIN_CHARS = 2;

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SearchState {
  /** The debounced query the results belong to. */
  query: string;
  results: Article[];
  count: number;
  next: string | null;
  status: SearchStatus;
  error: string | null;
  /** True while the input is ahead of the debounced query (typing). */
  pending: boolean;
}

/** Cache key per query + filter so backspacing or reopening the palette is instant. */
export const searchArticles = (q: string, category?: string, page = 1) =>
  cached(`search:${q.toLowerCase()}|${category ?? ''}|${page}`, () => articlesApi.list({ search: q, category, page }), 2 * 60 * 1000);

const friendly = (err: unknown) => {
  if (err instanceof ApiError && err.status === 429) return 'Too many searches in a row. Give it a few seconds.';
  if (err instanceof ApiError && err.status === 0) return 'You seem to be offline. Check your connection.';
  return 'Search is not responding right now. The newsroom server may be waking up.';
};

/** Debounced (~200ms) search against GET /api/articles/?search=. Stale responses are dropped. */
export function useArticleSearch(input: string, opts: { category?: string; delay?: number; enabled?: boolean } = {}): SearchState & { retry: () => void } {
  const { category, delay = SEARCH_DEBOUNCE_MS, enabled = true } = opts;
  const trimmed = input.trim();
  const debounced = useDebouncedValue(trimmed, delay);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<Omit<SearchState, 'pending'>>({ query: '', results: [], count: 0, next: null, status: 'idle', error: null });

  useEffect(() => {
    if (!enabled || debounced.length < SEARCH_MIN_CHARS) {
      setState({ query: debounced, results: [], count: 0, next: null, status: 'idle', error: null });
      return;
    }
    let live = true;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    searchArticles(debounced, category)
      .then((r) => live && setState({ query: debounced, results: r.results, count: r.count, next: r.next, status: 'success', error: null }))
      .catch((err) => live && setState({ query: debounced, results: [], count: 0, next: null, status: 'error', error: friendly(err) }));
    return () => {
      live = false;
    };
  }, [debounced, category, enabled, tick]);

  return {
    ...state,
    pending: enabled && trimmed.length >= SEARCH_MIN_CHARS && trimmed !== debounced,
    retry: () => setTick((t) => t + 1),
  };
}
