import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { Article } from '../../types';
import ArticleCard from '../ArticleCard';
import FadeReveal from './FadeReveal';
import { ArticleCardSkeleton } from './Skeletons';
import ErrorWithRetry from './ErrorWithRetry';

type FeaturedStoriesSectionProps = {
  loading: boolean;
  error: string | null;
  displayedFeatured: Article[];
  secondaryFeatured: Article[];
  activeCategory: string;
  activeCategoryLabel: string | null;
  getImagePosition: (article: Article) => 'top' | 'center' | 'bottom';
  onRetry: () => void;
};

const FeaturedStoriesSection: React.FC<FeaturedStoriesSectionProps> = ({
  loading,
  error,
  displayedFeatured,
  secondaryFeatured,
  activeCategory,
  activeCategoryLabel,
  getImagePosition,
  onRetry,
}) => (
  <section className="mb-10 sm:mb-12">
    <div className="flex items-center gap-3 mb-6">
      <TrendingUp size={28} className="text-orange-500" aria-hidden="true" />
      <h2 className="text-3xl font-bold text-gray-900">Featured Stories</h2>
    </div>
    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ArticleCardSkeleton key={`featured-skeleton-${i}`} />
        ))}
      </div>
    ) : error ? (
      <ErrorWithRetry error={error} onRetry={onRetry} section="featured" />
    ) : displayedFeatured.length > 0 ? (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <FadeReveal>
              <ArticleCard
                key={`featured-${displayedFeatured[0].id}`}
                article={displayedFeatured[0]}
                imagePosition={getImagePosition(displayedFeatured[0])}
                variant="large"
              />
            </FadeReveal>
          </div>
          {secondaryFeatured.length > 0 && (
            <div className="hidden lg:block lg:col-span-4">
              <div className="flex flex-col gap-3">
                {secondaryFeatured.slice(0, 3).map((a, idx) => (
                  <FadeReveal key={`featured-${a.id}`} delay={120 + idx * 60}>
                    <ArticleCard article={a} imagePosition={getImagePosition(a)} variant="sidebarLarge" />
                  </FadeReveal>
                ))}
              </div>
            </div>
          )}
        </div>
        {secondaryFeatured.length > 0 && (
          <div className="mt-6 lg:hidden">
            <div className="-mx-4 px-2 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
              {secondaryFeatured.slice(0, 3).map((a, idx) => (
                <div key={`featured-mobile-${a.id}`} className="snap-start shrink-0 w-64">
                  <FadeReveal delay={idx * 80} className="h-full">
                    <ArticleCard article={a} imagePosition={getImagePosition(a)} variant="compact" />
                  </FadeReveal>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUp size={40} className="text-orange-500" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {activeCategory === 'all'
            ? 'No Featured Articles Yet'
            : `No featured stories in ${activeCategoryLabel ?? 'this category'} yet`}
        </h3>
        <p className="text-gray-700 max-w-md mx-auto">
          {activeCategory === 'all'
            ? "Featured articles will appear here once they're added to the system. Check back soon for curated content!"
            : `We're still preparing featured coverage for ${activeCategoryLabel ?? 'this category'}. Try another filter or check back soon!`}
        </p>
      </div>
    )}
  </section>
);

export default FeaturedStoriesSection;
