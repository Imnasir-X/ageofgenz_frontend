import React from 'react';
import { BookOpen, ChevronRight, Clock, Loader2 } from 'lucide-react';
import type { Article } from '../../types';
import ArticleCard from '../ArticleCard';
import { ArticleCardSkeleton } from './Skeletons';
import ErrorWithRetry from './ErrorWithRetry';

type LatestNewsSectionProps = {
  latestList: Article[];
  loading: boolean;
  error: string | null;
  liveUpdatesCount: number;
  isRefreshing: boolean;
  pullDistance: number;
  loadingMore: boolean;
  latestHasMore: boolean;
  latestPage: number;
  activeCategory: string;
  activeCategoryLabel: string | null;
  onLoadMore: (page: number, categorySlug?: string) => void;
  onTriggerRefresh: () => void;
  onRetry: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  getImagePosition: (article: Article) => 'top' | 'center' | 'bottom';
  activeTabId: string;
  tabPanelId: string;
};

const LatestNewsSection: React.FC<LatestNewsSectionProps> = ({
  latestList,
  loading,
  error,
  liveUpdatesCount,
  isRefreshing,
  pullDistance,
  loadingMore,
  latestHasMore,
  latestPage,
  activeCategory,
  activeCategoryLabel,
  onLoadMore,
  onTriggerRefresh,
  onRetry,
  sentinelRef,
  getImagePosition,
  activeTabId,
  tabPanelId,
}) => {
  const headingId = `${activeTabId}-latest-heading`;
  const showRefreshBanner = liveUpdatesCount > 0 && latestList.length > 0 && !loading;

  return (
    <section role="tabpanel" id={tabPanelId} aria-labelledby={`${activeTabId} ${headingId}`}>
      <div className="flex items-center gap-3 mb-6">
        <Clock size={28} className="text-blue-500" aria-hidden="true" />
        <div>
          <h2 id={headingId} className="text-3xl font-bold text-gray-900">
            {activeCategory === 'all'
              ? 'Latest News'
              : `Latest in ${activeCategoryLabel ?? 'this category'}`}
          </h2>
          <span className="mt-1 block text-sm font-medium text-gray-700" aria-live="polite">
            {latestList.length} article{latestList.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      {showRefreshBanner && (
        <div className="mb-4">
          <button
            type="button"
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-orange-800 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-70 ${
              pullDistance > 0 || isRefreshing ? 'bg-white text-orange-700' : 'bg-orange-50'
            }`}
            onClick={onTriggerRefresh}
            disabled={isRefreshing}
            aria-live="polite"
            aria-busy={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Refreshing latest stories...
              </>
            ) : (
              <>
                {liveUpdatesCount} new article{liveUpdatesCount > 1 ? 's' : ''} - tap to load
              </>
            )}
          </button>
        </div>
      )}
      {(isRefreshing || pullDistance > 0) && (
        <div className="mb-4 flex justify-center sm:hidden">
          <div className="flex items-center gap-2 rounded-full bg-white/85 p-3 text-sm font-medium text-gray-700 shadow-sm shadow-slate-900/8">
            <Loader2
              className={`h-4 w-4 ${
                isRefreshing ? 'animate-spin text-blue-500' : pullDistance > 90 ? 'text-blue-500' : 'text-gray-300'
              } transition-colors`}
              aria-hidden="true"
            />
            <span>
              {isRefreshing ? 'Refreshing latest stories...' : pullDistance > 90 ? 'Release to refresh' : 'Pull down to refresh'}
            </span>
          </div>
        </div>
      )}
      {loading && latestList.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => {
            const visibilityClass = i >= 8 ? 'hidden xl:block' : i >= 6 ? 'hidden sm:block' : '';
            return (
              <div key={`latest-skeleton-${i}`} className={visibilityClass}>
                <ArticleCardSkeleton />
              </div>
            );
          })}
        </div>
      ) : error && latestList.length === 0 ? (
        <ErrorWithRetry error={error} onRetry={onRetry} section="latest" />
      ) : latestList.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          aria-live="polite"
          aria-atomic="false"
        >
          {latestList.map((article) => (
            <ArticleCard key={`latest-${article.id}`} article={article} imagePosition={getImagePosition(article)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-blue-500" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {activeCategory === 'all'
              ? 'No stories yet'
              : `No ${activeCategoryLabel ?? 'category'} stories yet`}
          </h3>
          <p className="text-gray-700 max-w-md mx-auto">
            {activeCategory === 'all'
              ? 'No stories yet. Check back soon.'
              : `No stories in ${activeCategoryLabel ?? 'this category'} yet. Check back soon.`}
          </p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div className="sticky bottom-0 z-20 bg-gradient-to-t from-white/90 via-white/70 to-transparent px-4 pt-3 pb-3 sm:pt-2 sm:pb-2 sm:shadow-sm sm:shadow-gray-900/5">
          <div className="mx-auto flex max-w-lg items-center justify-center rounded-full border border-gray-200 bg-white/90 px-4 py-2 sm:py-1.5 sm:shadow-sm sm:shadow-gray-900/5 backdrop-blur">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading more stories...
              </div>
            ) : latestHasMore ? (
              <button
                type="button"
                onClick={() => onLoadMore(latestPage + 1, activeCategory !== 'all' ? activeCategory : undefined)}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                disabled={isRefreshing}
                aria-label="Load more latest stories"
              >
                Load more stories
                <ChevronRight className="h-4 w-4 text-white/70" aria-hidden="true" />
              </button>
            ) : (
              <div className="flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700">
                You reached the end
              </div>
            )}
          </div>
        </div>
        <div ref={sentinelRef} className="h-1" />
      </div>
    </section>
  );
};

export default LatestNewsSection;
