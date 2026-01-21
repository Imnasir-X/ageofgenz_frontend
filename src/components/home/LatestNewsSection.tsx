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
}) => (
  <section role="tabpanel" id={tabPanelId} aria-labelledby={`${activeTabId} latest-heading`}>
    <div className="flex items-center gap-3 mb-6">
      <Clock size={28} className="text-blue-500" aria-hidden="true" />
      <div>
        <h2 id="latest-heading" className="text-3xl font-bold text-gray-900">
          Latest News
        </h2>
        <span className="mt-1 block text-sm font-medium text-gray-700" aria-live="polite">
          {latestList.length} article{latestList.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
    {liveUpdatesCount > 0 && (
      <div className="mb-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-orange-800 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <ArticleCardSkeleton key={`latest-skeleton-${i}`} />
        ))}
      </div>
    ) : error && latestList.length === 0 ? (
      <ErrorWithRetry error={error} onRetry={onRetry} section="latest" />
    ) : latestList.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-live="polite" aria-atomic="false">
        {latestList.map((article) => (
          <div
            key={`latest-${article.id}`}
            className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md"
          >
            <ArticleCard article={article} imagePosition={getImagePosition(article)} />
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen size={40} className="text-blue-500" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {activeCategory === 'all'
            ? 'No Articles Available'
            : `No ${activeCategoryLabel ?? 'category'} articles yet`}
        </h3>
        <p className="text-gray-700 max-w-md mx-auto">
          {activeCategory === 'all'
            ? "Latest articles will appear here once they're published. Start creating content to fill this space!"
            : `We haven't published any stories in ${activeCategoryLabel ?? 'this category'} yet. Check back soon or explore another section above.`}
        </p>
      </div>
    )}

    <div className="mt-8 space-y-4">
      <div className="sticky bottom-0 z-20 bg-gradient-to-t from-white/95 via-white/80 to-transparent px-4 pt-4 pb-4 shadow-md shadow-gray-900/10 shadow-[0_-4px_12px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex max-w-lg items-center justify-center rounded-full border border-gray-200 bg-white/95 px-4 py-2 shadow-lg shadow-gray-900/5 backdrop-blur">
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

export default LatestNewsSection;
