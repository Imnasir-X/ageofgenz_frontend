import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowUp,
  ArrowUpRight,
  Compass,
  Filter,
  Flame,
  Home,
  LayoutGrid,
  Rows,
  Sparkles,
} from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import CategoryGrid from './CategoryGrid';
import useCategoryArticles from '../hooks/useCategoryArticles';
import type { Article } from '../types';

const CATEGORY_ICON_MAP: Record<string, (className: string) => ReactElement> = {
  politics: (className) => <Flame className={className} aria-hidden="true" />,
  world: (className) => <Compass className={className} aria-hidden="true" />,
  technology: (className) => <Sparkles className={className} aria-hidden="true" />,
  default: (className) => <Sparkles className={className} aria-hidden="true" />,
};
const STORAGE_PREFIX = 'category-preferences';

type Props = {
  slug: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  emptyMessage?: string;
};

const CategoryPage: React.FC<Props> = ({
  slug,
  title,
  description,
  metaTitle,
  metaDescription,
  emptyMessage,
}) => {
  const { articles, loading, loadingMore, error, retry, hasMore, loadMore } =
    useCategoryArticles(slug);

  const [activeSort, setActiveSort] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickFilters, setShowQuickFilters] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const mobileSheetRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${slug}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        sort?: 'latest' | 'popular' | 'trending';
        view?: 'grid' | 'list';
        search?: string;
      };
      if (parsed.sort) setActiveSort(parsed.sort);
      if (parsed.view) setViewMode(parsed.view);
      if (parsed.search) setSearchQuery(parsed.search);
    } catch {
      // ignore malformed storage
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({
      sort: activeSort,
      view: viewMode,
      search: searchQuery,
    });
    window.localStorage.setItem(`${STORAGE_PREFIX}:${slug}`, payload);
  }, [activeSort, viewMode, searchQuery, slug]);

  const pageTitle = metaTitle || `${title} | The Age of GenZ`;
  const pageDescription = metaDescription || description;
  const canonicalUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: pageDescription,
    url: canonicalUrl,
  } as const;

  useEffect(() => {
    setShowQuickFilters(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!showQuickFilters || typeof window === 'undefined') return;

    const handleTouchStart = (event: TouchEvent) => {
      if (!mobileSheetRef.current) return;
      if (!mobileSheetRef.current.contains(event.target as Node)) return;
      touchStartRef.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const delta = event.touches[0].clientY - touchStartRef.current;
      if (delta > 80) {
        setShowQuickFilters(false);
        touchStartRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      touchStartRef.current = null;
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showQuickFilters]);

  const categoryIcon = useMemo(() => {
    const renderIcon = CATEGORY_ICON_MAP[slug] || CATEGORY_ICON_MAP.default;
    return renderIcon('h-full w-full');
  }, [slug]);

  const normalizeDate = (article: Article) =>
    article.published_at || article.updated_at || article.created_at || article.date;

  const sortedArticles = useMemo(() => {
    const data = [...articles];
    switch (activeSort) {
      case 'popular':
        data.sort((a, b) => (b.view_count || b.views) - (a.view_count || a.views));
        break;
      case 'trending':
        data.sort((a, b) => {
          const aScore = (a.view_count || a.views) + (a.is_featured ? 1000 : 0);
          const bScore = (b.view_count || b.views) + (b.is_featured ? 1000 : 0);
          return bScore - aScore;
        });
        break;
      default:
        data.sort(
          (a, b) => new Date(normalizeDate(b)).getTime() - new Date(normalizeDate(a)).getTime(),
        );
        break;
    }
    return data;
  }, [articles, activeSort]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return sortedArticles;
    const query = searchQuery.trim().toLowerCase();
    return sortedArticles.filter((article) => {
      const haystack = `${article.title} ${article.excerpt ?? ''} ${
        article.description ?? ''
      }`.toLowerCase();
      return haystack.includes(query);
    });
  }, [sortedArticles, searchQuery]);

  const relatedCategories = useMemo(
    () =>
      [
        {
          name: 'Trending Now',
          slug: 'trending',
          description: 'Big conversations curated daily.',
        },
        {
          name: 'Global Briefing',
          slug: 'world',
          description: 'Updates from every continent.',
        },
        {
          name: 'Tech & Innovation',
          slug: 'technology',
          description: 'Signals from the future.',
        },
        {
          name: 'Politics & Policy',
          slug: 'politics',
          description: 'Power plays decoded.',
        },
      ].filter((item) => item.slug !== slug),
    [slug],
  );

  const filterOptions: Array<{ value: typeof activeSort; label: string }> = useMemo(
    () => [
      { value: 'latest', label: 'Latest' },
      { value: 'popular', label: 'Popular' },
      { value: 'trending', label: 'Trending' },
    ],
    [],
  );

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-slate-950 pb-16">

        <Helmet>
          <html lang="en" />
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 rounded bg-white px-3 py-2 text-black shadow"
        >
          Skip to content
        </a>

        <div className="relative mx-auto max-w-6xl space-y-10 px-4 pt-14 sm:px-6 lg:px-8">
          <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-md sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-4">
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-2 text-sm font-medium text-white/70"
                >
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/10"
                  >
                    <Home className="h-4 w-4" aria-hidden="true" />
                    Home
                  </Link>
                  <span className="text-white/50">&gt;</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">{title}</span>
                </nav>
                <h1 className="bg-gradient-to-br from-orange-200 via-orange-400 to-orange-600 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-base text-white/90 sm:text-lg">{description}</p>
              </div>
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-slate-800 text-white shadow-md sm:h-24 sm:w-24">
                <div className="h-10 w-10 text-orange-200 sm:h-12 sm:w-12">{categoryIcon}</div>
              </div>
            </div>
          </header>

          <main id="main-content" className="relative -mt-8 space-y-8">
            <section
              className="rounded-3xl border border-white/10 bg-white p-6 shadow-md transition-all duration-300 ease-out sm:p-8"
              aria-live="polite"
            >
              <div className="sticky top-20 z-20 -mx-6 mb-6 border-b border-slate-200 bg-white px-6 py-4 sm:-mx-8 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                    <Filter className="h-4 w-4 text-orange-500" aria-hidden="true" />
                    Refine Feed
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setActiveSort(option.value)}
                        className={`rounded-full px-4 py-1.5 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                          activeSort === option.value
                            ? 'border border-orange-500 bg-orange-500 text-white shadow-md'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                        viewMode === 'grid'
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-orange-500'
                      }`}
                      aria-pressed={viewMode === 'grid'}
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                        viewMode === 'list'
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-orange-500'
                      }`}
                      aria-pressed={viewMode === 'list'}
                    >
                      <Rows className="h-4 w-4" aria-hidden="true" />
                      List
                    </button>
                  </div>
                  <div className="flex w-full max-w-xs items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-200">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      aria-label="Search articles within category"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-base leading-none text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                        aria-label="Clear search"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <CategoryGrid
                articles={filteredArticles}
                loading={loading}
                loadingMore={loadingMore}
                error={error}
                onRetry={retry}
                hasMore={hasMore}
                onLoadMore={loadMore}
                emptyMessage={emptyMessage}
                viewMode={viewMode}
              />
            </section>

            <section className="rounded-3xl border border-white/10 bg-white p-6 shadow-md transition-all duration-300 ease-out sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Related Categories</h2>
                  <p className="text-sm text-slate-600">Expand your feed with these curated beats.</p>
                </div>
                <Link
                  to="/trending"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Discover more
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {relatedCategories.map((cat) => {
                  const renderIcon = CATEGORY_ICON_MAP[cat.slug] || CATEGORY_ICON_MAP.default;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                        {renderIcon('h-5 w-5')}
                      </div>
                      <div className="relative mt-6 space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                        <p className="text-sm text-slate-600">{cat.description}</p>
                      </div>
                      <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
                        Explore <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </main>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end gap-3 px-5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <button
            type="button"
            onClick={() => setShowQuickFilters((prev) => !prev)}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/30 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="Toggle filters"
          >
            <Filter className="h-6 w-6" aria-hidden="true" />
          </button>

          {showBackToTop && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white text-slate-700 shadow-md shadow-slate-900/15 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {showQuickFilters && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              ref={mobileSheetRef}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl border border-white/10 bg-white p-6 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Filter feed</h3>
                <button
                  type="button"
                  onClick={() => setShowQuickFilters(false)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
                    Sort
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <button
                        key={`mobile-${option.value}`}
                        type="button"
                        onClick={() => setActiveSort(option.value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                          activeSort === option.value
                            ? 'border border-orange-500 bg-orange-500 text-white shadow-md'
                            : 'border border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
                    View
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                        viewMode === 'grid'
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                        viewMode === 'list'
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
                    Search
                  </p>
                  <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-200">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      aria-label="Search articles within category"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-base leading-none text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                        aria-label="Clear search"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickFilters(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full rounded-full bg-orange-500 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-md shadow-orange-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
     </div>
    </ErrorBoundary>
  );
};

export default CategoryPage;




