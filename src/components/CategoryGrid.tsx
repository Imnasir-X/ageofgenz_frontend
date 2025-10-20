import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import type { Article } from '../types';
import ArticleCard from './ArticleCard';

type Props = {
  articles: Article[];
  loading: boolean;
  loadingMore?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
};

const SkeletonCard: React.FC = () => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-300">
    <div className="relative aspect-[5/3] overflow-hidden">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
    </div>
    <div className="space-y-3 px-4 py-5">
      <div className="h-3.5 w-20 animate-pulse rounded-full bg-orange-200/60" />
      <div className="h-4.5 w-full animate-pulse rounded-md bg-slate-200" />
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
    </div>
  </div>
);

const CategoryGrid: React.FC<Props> = ({
  articles,
  loading,
  loadingMore,
  error,
  onRetry,
  hasMore,
  onLoadMore,
  emptyMessage,
  viewMode = 'grid',
}) => {
  const gridClass = useMemo(() => {
    if (viewMode === 'list') {
      return 'space-y-4';
    }
    return 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3';
  }, [viewMode]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={`s-${i}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/80 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <RefreshCw className="h-5 w-5" />
        </div>
        <p className="text-base font-semibold text-red-700">{error}</p>
        <p className="mt-2 text-sm text-red-600/80">
          Something went wrong while loading this category. Please retry or explore another topic.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-50"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry Loading
          </button>
        )}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-orange-50 to-white p-10 text-center shadow-sm">
        <div className="relative">
          <div className="absolute inset-0 -translate-x-1 translate-y-1 rounded-full bg-orange-200 blur-2xl opacity-60" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10">
            <Sparkles className="h-10 w-10 text-orange-500" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">No stories yet but stay tuned!</h3>
          <p className="text-sm text-gray-600 max-w-xl">
            {emptyMessage ||
              'We are curating fresh reporting for this category right now. In the meantime, explore our most popular stories or discover another topic.'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/trending"
            className="inline-flex items-center gap-2 rounded-full border border-orange-400/70 bg-white px-5 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-50"
          >
            <Compass size={16} aria-hidden="true" />
            View Trending
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-50"
          >
            Explore All Categories
          </Link>
        </div>
      </div>
    );
  }

  const cardVariant: 'compact' | 'horizontal' = viewMode === 'list' ? 'horizontal' : 'compact';

  return (
    <>
      <div className={gridClass} aria-busy={loadingMore ? 'true' : 'false'}>
        {articles.map((article) => (
          <div
            key={article.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-2 hover:shadow-md focus-within:-translate-y-2"
          >
            <ArticleCard article={article} variant={cardVariant} imagePosition="center" />
          </div>
        ))}
      </div>
      {hasMore && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-gray-900/20 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            disabled={loadingMore}
            aria-live="polite"
            aria-busy={loadingMore ? 'true' : 'false'}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default CategoryGrid;
