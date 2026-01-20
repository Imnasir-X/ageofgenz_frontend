import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Pause, Play } from 'lucide-react';
import type { Article } from '../../types';
import type { CategoryMeta } from '../../utils/categoryHelpers';
import { getCategoryAccent } from '../../utils/categoryHelpers';
import { getArticleHref } from '../../utils/articleHelpers';
import ProgressiveImage from './ProgressiveImage';
import useHeroCarousel from '../../hooks/useHeroCarousel';

const HERO_ROTATE_INTERVAL = 7000;

type HeroSectionProps = {
  items: Article[];
  isLoading: boolean;
  getArticleCategoryMeta: (article: Article) => CategoryMeta;
};

const HeroSection: React.FC<HeroSectionProps> = ({ items, isLoading, getArticleCategoryMeta }) => {
  const {
    heroIndex,
    heroPlaying,
    setHeroPlaying,
    goToHeroSlide,
    goToNextHero,
    goToPrevHero,
    pointerHandlers,
  } = useHeroCarousel(items.length, HERO_ROTATE_INTERVAL);

  if (items.length === 0) {
    return (
      <section className="mb-10">
        {isLoading ? (
          <div
            className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 shadow-sm animate-pulse"
            aria-hidden="true"
          />
        ) : (
          <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-dashed border-gray-300 shadow-sm p-6 sm:p-10">
            <div className="max-w-xl space-y-3">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Highlight your top story</h2>
              <p className="text-gray-700">
                Add a featured article or mark a piece as featured to populate this hero area. We'll showcase your most recent headline automatically.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} className="text-orange-500" aria-hidden="true" />
                <span>Tip: set at least one article as featured to unlock the carousel experience.</span>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured stories"
        aria-live={heroPlaying ? 'polite' : 'off'}
        aria-atomic="false"
        style={{ touchAction: 'pan-y' }}
        {...pointerHandlers}
      >
        {items.map((article, idx) => {
          const isActive = idx === heroIndex;
          const img = article.featured_image_url || article.featured_image || article.image || '/api/placeholder/1200/675';
          const articleHref = getArticleHref(article);
          const isNavigable = articleHref !== '#';
          const displayTitle = article.title?.trim() || 'Untitled story';
          const displayExcerpt = article.excerpt?.trim() || 'Stay tuned for more details as this story develops.';
          const categoryMeta = getArticleCategoryMeta(article);
          const accent = getCategoryAccent(article.category ?? { name: article.category_name });

          return (
            <div
              key={`hero-${article.id}`}
              className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${items.length}`}
            >
              <div className="aspect-[16/7] w-full overflow-hidden">
                <ProgressiveImage src={img} alt={displayTitle} className="w-full h-full" eager={idx === 0} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-white/90">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${accent.badge} text-white`}>
                    {categoryMeta.name}
                  </span>
                  <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                  <span>By {article.author?.name || 'Staff'}</span>
                  <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                  <span className="inline-flex items-center">
                    <Clock size={14} className="mr-1" />
                    {article.estimated_read_time || 3} min read
                  </span>
                </div>
                {isNavigable ? (
                  <Link
                    to={articleHref}
                    className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded"
                  >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow group-hover:text-white/90 transition-colors">
                      {displayTitle}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow">
                    {displayTitle}
                  </h2>
                )}
                <p className="hidden sm:block mt-2 text-white/90 max-w-3xl line-clamp-2">{displayExcerpt}</p>
              </div>
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 pointer-events-none">
          <div className="flex items-center justify-between gap-3 pointer-events-auto">
            <button
              type="button"
              aria-label="Previous slide"
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
              onClick={goToPrevHero}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              {items.map((_, i) => {
                const isDotActive = i === heroIndex;
                return (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-pressed={isDotActive}
                    onClick={() => goToHeroSlide(i)}
                    className={`group relative h-2 overflow-hidden rounded-full transition-all duration-300 ${isDotActive ? 'w-8 bg-white/30' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                  >
                    <span className="sr-only">Slide {i + 1}</span>
                    <span
                      className={`absolute inset-y-0 left-0 bg-white transition-all duration-[7000ms] ease-linear ${heroPlaying && isDotActive ? 'w-full' : 'w-0'}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={heroPlaying ? 'Pause carousel' : 'Play carousel'}
                aria-pressed={!heroPlaying}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                onClick={() => setHeroPlaying((playing) => !playing)}
              >
                {heroPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
              <button
                type="button"
                aria-label="Next slide"
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                onClick={goToNextHero}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
