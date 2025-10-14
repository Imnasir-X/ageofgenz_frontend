import React from 'react';
import { RefreshCw } from 'lucide-react';
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
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-md shadow-sm overflow-hidden">
    <div className="aspect-[16/10] bg-gray-200" />
    <div className="p-2">
      <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-11/12 bg-gray-300 rounded mb-1" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
    </div>
  </div>
);

const CategoryGrid: React.FC<Props> = ({ articles, loading, loadingMore, error, onRetry, hasMore, onLoadMore, emptyMessage }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={`s-${i}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <RefreshCw size={16} className="mr-2" /> Try Again
          </button>
        )}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">{emptyMessage || 'No articles available yet.'}</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-busy={loadingMore ? 'true' : 'false'}>
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} variant="compact" />
        ))}
      </div>
      {hasMore && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-60"
            disabled={loadingMore}
            aria-live="polite"
            aria-busy={loadingMore ? 'true' : 'false'}
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
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
