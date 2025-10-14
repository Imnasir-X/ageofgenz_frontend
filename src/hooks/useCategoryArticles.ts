import { useEffect, useState, useCallback } from 'react';
import type { Article } from '../types';
import { getArticlesByCategory } from '../utils/api';

interface UseCategoryArticles {
  articles: Article[];
  loading: boolean; // initial load
  loadingMore: boolean; // pagination load
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  retry: () => void;
}

export function useCategoryArticles(slug: string): UseCategoryArticles {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchPage = useCallback(async (targetPage: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await getArticlesByCategory(slug, targetPage);
      const list = res.data?.results ?? [];
      setArticles(prev => (append ? [...prev, ...list] : list));
      setHasMore(Boolean(res.data?.next));
    } catch (e: any) {
      setError(e?.message || 'Failed to load articles');
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    // reset when slug changes
    setArticles([]);
    setPage(1);
    setHasMore(false);
    fetchPage(1, false);
  }, [slug, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [page, loading, hasMore, fetchPage]);

  const retry = useCallback(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  return { articles, loading, loadingMore, error, hasMore, page, loadMore, retry };
}

export default useCategoryArticles;
