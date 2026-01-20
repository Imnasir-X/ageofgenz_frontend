import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Pause, Play } from 'lucide-react';
import type { Article } from '../../types';
import type { CategoryMeta } from '../../utils/categoryHelpers';
import { getCategoryAccent } from '../../utils/categoryHelpers';
import { getArticleHref } from '../../utils/articleHelpers';
import useBreakingTicker from '../../hooks/useBreakingTicker';

type BreakingTickerProps = {
  items: Article[];
  getArticleCategoryMeta: (article: Article) => CategoryMeta;
};

const BreakingTicker: React.FC<BreakingTickerProps> = ({ items, getArticleCategoryMeta }) => {
  const {
    breakingIndex,
    breakingPlaying,
    setBreakingPlaying,
    breakingVisible,
    goToBreakingSlide,
    goToNextBreaking,
    goToPrevBreaking,
    handleBreakingKeyDown,
  } = useBreakingTicker(items.length);

  const current = items[breakingIndex];

  const announcement = useMemo(() => {
    if (!current) return '';
    const categoryMeta = getArticleCategoryMeta(current);
    return `${categoryMeta.topLevelName}: ${current.title || 'Breaking update available'}`;
  }, [current, getArticleCategoryMeta]);

  if (!current) return null;

  const href = getArticleHref(current);
  const dateText = new Date(current.date || current.published_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const categoryMeta = getArticleCategoryMeta(current);
  const categoryText = categoryMeta.topLevelName.toUpperCase();
  const img = current.featured_image_url || current.image || current.featured_image || '/api/placeholder/1200/675';
  const accent = getCategoryAccent(current.category ?? { name: current.category_name });
  const authorName = current.author?.name || 'Staff';

  return (
    <div className="mx-auto mb-5 max-w-6xl px-2 sm:px-4">
      <div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm p-3 sm:p-5"
        role="region"
        aria-roledescription="carousel"
        aria-label="Breaking news headlines"
      >
        <div className="sr-only" aria-live={breakingPlaying ? 'polite' : 'off'} role="status">
          {announcement}
        </div>
        <div
          tabIndex={0}
          onKeyDown={handleBreakingKeyDown}
          className={`group mx-auto block w-full max-w-[540px] rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all duration-500 will-change-transform ${
            breakingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <Link to={href} className="group inline-block mb-3">
            <h2 className="text-center font-serif font-extrabold tracking-tight text-gray-900 leading-snug text-xl sm:text-2xl md:text-[28px] underline decoration-gray-900 decoration-1 underline-offset-4 transition-colors group-hover:text-orange-500">
              {current.title || 'Untitled Article'}
            </h2>
          </Link>

          <Link
            to={href}
            className="block overflow-hidden rounded-xl border border-gray-100 bg-gray-100 mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div className="aspect-[18/11] sm:aspect-[20/11]">
              <img
                src={img}
                alt={current.title || 'Breaking image'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/api/placeholder/1200/675';
                }}
              />
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-700 mb-2">
            <span
              className={`${accent.badge} inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white`}
            >
              {categoryText}
            </span>
            <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
            <span className="flex items-center gap-1">
              <Clock size={12} className={accent.text} />
              {dateText}
            </span>
            <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
            <span>By {authorName}</span>
            <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
            <span>
              {breakingIndex + 1} of {items.length}
            </span>
          </div>
          {current.excerpt && (
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-2">{current.excerpt}</p>
          )}
        </div>
        {items.length > 1 && (
          <div className="flex flex-col items-center gap-4 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous breaking story"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => {
                  setBreakingPlaying(false);
                  goToPrevBreaking();
                }}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={breakingPlaying ? 'Pause breaking news rotation' : 'Play breaking news rotation'}
                aria-pressed={!breakingPlaying}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => setBreakingPlaying((playing) => !playing)}
              >
                {breakingPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
              <button
                type="button"
                aria-label="Next breaking story"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => {
                  setBreakingPlaying(false);
                  goToNextBreaking();
                }}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {items.map((_, idx) => {
                const isActive = idx === breakingIndex;
                return (
                  <button
                    key={`breaking-dot-${idx}`}
                    type="button"
                    aria-label={`Go to breaking story ${idx + 1}`}
                    aria-pressed={isActive}
                    onClick={() => {
                      setBreakingPlaying(false);
                      goToBreakingSlide(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${isActive ? 'w-8 bg-orange-400' : 'w-2 bg-gray-300 hover:bg-orange-300'}`}
                  >
                    <span className="sr-only">Breaking story {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakingTicker;
