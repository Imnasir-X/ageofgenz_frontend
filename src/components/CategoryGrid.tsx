import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { Article } from '../types';
import ArticleCard from './ArticleCard';

type Props = {
  articles: Article[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
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

const CategoryGrid: React.FC<Props> = ({ articles, loading, error, onRetry, hasMore, onLoadMore }) => {
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
      <div className="text-center py-10 text-gray-500">No articles available yet.</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} variant="compact" />
        ))}
      </div>
      {hasMore && onLoadMore && (
        <div className="mt-6 text-center">
          <button onClick={onLoadMore} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">Load more</button>
        </div>
      )}
    </>
  );
};

export default CategoryGrid;

