import React from 'react';

export const ArticleCardSkeleton: React.FC = () => (
  <div className="article-card bg-white rounded-md shadow-sm overflow-hidden border border-gray-100" aria-hidden="true">
    <div className="animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="w-20 h-4 bg-gray-200 rounded-full" />
          <div className="flex gap-3">
            <div className="w-16 h-3 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-300 rounded" />
          <div className="w-4/5 h-4 bg-gray-300 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 bg-gray-200 rounded" />
          <div className="w-3/5 h-3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const CompactArticleCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100" aria-hidden="true">
    <div className="animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 bg-gray-200 rounded-full" />
          <div className="w-14 h-3 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-300 rounded" />
          <div className="w-3/4 h-4 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const SidebarArticleCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100" aria-hidden="true">
    <div className="animate-pulse">
      <div className="aspect-[5/3] bg-gray-200" />
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 bg-gray-200 rounded-full" />
          <div className="w-12 h-3 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-300 rounded" />
          <div className="w-3/4 h-4 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const LargeArticleCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100" aria-hidden="true">
    <div className="relative animate-pulse">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-3 bg-gray-300 rounded-full" />
          <div className="w-16 h-3 bg-gray-300 rounded" />
          <div className="w-16 h-3 bg-gray-300 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-6 bg-gray-300 rounded" />
          <div className="w-4/5 h-6 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  </div>
);

type SearchResultsSkeletonProps = {
  count?: number;
};

export const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ count = 6 }) => (
  <section className="mb-12" aria-hidden="true">
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="w-48 h-8 bg-gray-300 rounded" />
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <ArticleCardSkeleton key={`search-skeleton-${i}`} />
        ))}
      </div>
    </div>
  </section>
);
