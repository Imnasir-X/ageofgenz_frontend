import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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

  const heroSlides = useMemo(
    () =>
      items.map((article) => {
        const categoryMeta = getArticleCategoryMeta(article);
        const accent = getCategoryAccent(article.category ?? { name: article.category_name });
        const href = getArticleHref(article);
        const image = article.featured_image_url || article.featured_image || article.image || null;

        return {
          article,
          categoryMeta,
          accent,
          href,
          image,
        };
      }),
    [items, getArticleCategoryMeta, getArticleHref, getCategoryAccent],
  );

  const activeSlide = heroSlides[heroIndex] ?? null;
  const lastViewedKeyRef = useRef<string | null>(null);

  const trackHeroEvent = useCallback((eventName: string, payload: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    const win = window as typeof window & {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: Array<Record<string, unknown>>;
    };
    if (typeof win.gtag === 'function') {
      win.gtag('event', eventName, payload);
      return;
    }
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event: eventName, ...payload });
    }
  }, []);

  const getAnalyticsPayload = useCallback(
    (article?: Article, extra?: Record<string, unknown>) => ({
      slide_index: heroSlides.length > 0 ? heroIndex + 1 : 0,
      slide_total: heroSlides.length,
      article_id: article?.id ?? null,
      article_slug: article?.slug ?? null,
      article_title: article?.title ?? null,
      ...extra,
    }),
    [heroIndex, heroSlides.length],
  );

  const handleTogglePlay = useCallback(() => {
    setHeroPlaying((playing) => {
      const nextState = !playing;
      trackHeroEvent('hero_play_pause_toggled', getAnalyticsPayload(activeSlide?.article, { playing: nextState }));
      return nextState;
    });
  }, [activeSlide, getAnalyticsPayload, setHeroPlaying, trackHeroEvent]);

  const handleHeroKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.currentTarget !== event.target) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevHero();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextHero();
      } else if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space') {
        event.preventDefault();
        handleTogglePlay();
      }
    },
    [goToNextHero, goToPrevHero, handleTogglePlay],
  );

  const preloadImage = useCallback((src?: string | null) => {
    if (!src) return;
    const img = new Image();
    img.src = src;
  }, []);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const prevIndex = (heroIndex - 1 + heroSlides.length) % heroSlides.length;
    const nextIndex = (heroIndex + 1) % heroSlides.length;
    preloadImage(heroSlides[prevIndex]?.image);
    preloadImage(heroSlides[nextIndex]?.image);
  }, [heroIndex, heroSlides, preloadImage]);

  useEffect(() => {
    if (!activeSlide) return;
    const viewKey =
      activeSlide.article.id !== undefined && activeSlide.article.id !== null
        ? `id:${activeSlide.article.id}`
        : activeSlide.article.slug
          ? `slug:${activeSlide.article.slug}`
          : `index:${heroIndex}`;
    if (lastViewedKeyRef.current === viewKey) return;
    lastViewedKeyRef.current = viewKey;
    trackHeroEvent('hero_slide_viewed', getAnalyticsPayload(activeSlide.article));
  }, [activeSlide, getAnalyticsPayload, heroIndex, trackHeroEvent]);

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
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">No featured stories yet</h2>
              <p className="text-gray-700">
                Check back soon for the latest headlines and highlights from our newsroom.
              </p>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div
        className="group relative w-full rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured stories"
        aria-live={heroPlaying ? 'polite' : 'off'}
        aria-atomic="false"
        style={{ touchAction: 'pan-y' }}
        tabIndex={0}
        onKeyDown={handleHeroKeyDown}
        {...pointerHandlers}
      >
        {heroSlides.map((slide, idx) => {
          const { article, categoryMeta, accent, href, image } = slide;
          const isActive = idx === heroIndex;
          const articleHref = href;
          const isNavigable = href !== '#';
          const displayTitle = article.title?.trim() || 'Untitled story';
          const displayExcerpt = article.excerpt?.trim();
          const relativeTime = formatRelativeTime(
            article.updated_at || article.published_at || article.date || article.created_at,
          );
          const authorName = article.author?.name?.trim() || '';
          const showAuthor = authorName.length > 0 && !/\bstaff\b/i.test(authorName);
          const readTime =
            Number.isFinite(article.estimated_read_time) && article.estimated_read_time > 0
              ? article.estimated_read_time
              : null;
          const categoryLabel = (categoryMeta.topLevelName || categoryMeta.name || '').toUpperCase();

          return (
            <div
              key={`hero-${article.id}`}
              className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${items.length}`}
            >
              <div className="aspect-[16/7] w-full overflow-hidden">
                <ProgressiveImage
                  src={image}
                  alt={displayTitle}
                  className="w-full h-full"
                  eager={idx === 0}
                  fallbackGradient={accent.gradient}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 pb-10 sm:p-6 sm:pb-12 md:p-8 md:pb-14">
                <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] sm:text-xs text-white/90">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${accent.badge} text-white`}>
                    {categoryLabel}
                  </span>
                  {relativeTime && (
                    <>
                      <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-white/80" aria-hidden="true" />
                        <span>Updated {relativeTime}</span>
                      </span>
                    </>
                  )}
                  {readTime !== null && (
                    <>
                      <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                      <span>{readTime} min read</span>
                    </>
                  )}
                  {showAuthor && (
                    <>
                      <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                      <span>By {authorName}</span>
                    </>
                  )}
                </div>
                {isNavigable ? (
                  <Link
                    to={articleHref}
                    className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded"
                    onClick={() =>
                      trackHeroEvent('hero_article_clicked', getAnalyticsPayload(article, { href: articleHref }))
                    }
                  >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow line-clamp-3 md:line-clamp-4 group-hover:text-white/90 transition-colors">
                      {displayTitle}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow line-clamp-3 md:line-clamp-4">
                    {displayTitle}
                  </h2>
                )}
                {displayExcerpt && (
                  <p className="hidden sm:block mt-2 text-white/90 max-w-3xl line-clamp-2">
                    {displayExcerpt}
                  </p>
                )}
                {isNavigable && (
                  <Link
                    to={articleHref}
                    className={`group/read hidden md:inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors ${
                      displayExcerpt ? 'mt-3' : 'mt-2'
                    }`}
                    onClick={() =>
                      trackHeroEvent('hero_article_clicked', getAnalyticsPayload(article, { href: articleHref }))
                    }
                  >
                    <span>Read story</span>
                    <ChevronRight
                      size={16}
                      className="transition-transform group-hover/read:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 pointer-events-none">
          <div className="relative flex items-center justify-center gap-3 pointer-events-none">
            <button
              type="button"
              aria-label="Previous slide"
              className="hidden md:inline-flex pointer-events-none absolute left-0 h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto md:focus-visible:opacity-100 md:focus-visible:pointer-events-auto hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              onClick={goToPrevHero}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 pointer-events-auto">
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
              <button
                type="button"
                aria-label={heroPlaying ? 'Pause carousel' : 'Play carousel'}
                aria-pressed={heroPlaying}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto md:focus-visible:opacity-100 md:focus-visible:pointer-events-auto"
                onClick={handleTogglePlay}
              >
                {heroPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
            </div>
            <button
              type="button"
              aria-label="Next slide"
              className="hidden md:inline-flex pointer-events-none absolute right-0 h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto md:focus-visible:opacity-100 md:focus-visible:pointer-events-auto hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              onClick={goToNextHero}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
