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

const formatRelativeTime = (value?: string | null): string | null => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return null;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
  const relativeTime = formatRelativeTime(current.updated_at || current.published_at || current.date) ?? '';
  const categoryMeta = getArticleCategoryMeta(current);
  const categoryText = categoryMeta.topLevelName.toUpperCase();
  const accent = getCategoryAccent(current.category ?? { name: current.category_name });
  const hasMultiple = items.length > 1;

  return (
    <div className="mx-auto mb-5 w-full px-2 sm:px-4">
      <div
        className="overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-4"
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
          className={`flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-opacity duration-300 ${
            breakingVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Link to={href} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Breaking
            </span>
            <span
              className={`${accent.badge} hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white`}
            >
              {categoryText}
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900 truncate sm:text-base">
              {current.title || 'Untitled Article'}
            </span>
            {relativeTime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} className={accent.text} />
                {relativeTime}
              </span>
            )}
          </Link>
          {hasMultiple && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="Previous breaking story"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => {
                  setBreakingPlaying(false);
                  goToPrevBreaking();
                }}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={breakingPlaying ? 'Pause breaking news rotation' : 'Play breaking news rotation'}
                aria-pressed={!breakingPlaying}
                className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => setBreakingPlaying((playing) => !playing)}
              >
                {breakingPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
              <button
                type="button"
                aria-label="Next breaking story"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => {
                  setBreakingPlaying(false);
                  goToNextBreaking();
                }}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              <span className="text-[11px] font-semibold text-gray-500">
                {breakingIndex + 1} / {items.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakingTicker;
