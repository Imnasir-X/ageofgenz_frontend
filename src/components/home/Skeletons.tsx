import React from 'react';

export const ArticleCardSkeleton: React.FC = () => (
  <div className="article-card bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
    <div className="animate-pulse">
      <div className="aspect-[16/10] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="w-20 h-5 bg-orange-200 rounded-full" />
          <div className="flex gap-3">
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-12 h-4 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-5 bg-gray-300 rounded" />
          <div className="w-4/5 h-5 bg-gray-300 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 rounded" />
          <div className="w-3/5 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const SearchResultsSkeleton: React.FC = () => (
  <section className="mb-12">
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="w-48 h-8 bg-gray-300 rounded" />
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ArticleCardSkeleton key={`search-skeleton-${i}`} />
        ))}
      </div>
    </div>
  </section>
);
