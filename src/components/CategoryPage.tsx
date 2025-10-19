import React, { useEffect, useMemo, useState } from 'react';
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

  const categoryIcon = useMemo(() => {
    const glyphBySlug: Record<string, ReactElement> = {
      politics: <Flame className="h-full w-full" aria-hidden="true" />,
      world: <Compass className="h-full w-full" aria-hidden="true" />,
      technology: <Sparkles className="h-full w-full" aria-hidden="true" />,
    };
    return glyphBySlug[slug] || <Sparkles className="h-full w-full" aria-hidden="true" />;
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

  const progressLabel = useMemo(() => {
    const count = sortedArticles.length;
    if (loadingMore) {
      return `Loading ${count + 6} of ${hasMore ? 'many' : count} articles…`;
    }
    if (loading) {
      return 'Gathering the latest stories…';
    }
    return `Loaded ${count}${hasMore ? '+' : ''} articles`;
  }, [sortedArticles.length, loadingMore, loading, hasMore]);

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
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,153,102,0.22),transparent_55%)]" />

        <Helmet>
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

        <div className="relative mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
          <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_80px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,176,120,0.35),transparent_55%)]" />
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
                <p className="max-w-2xl text-base text-white/80 sm:text-lg">{description}</p>
              </div>
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 via-orange-500/10 to-orange-600/20 text-white shadow-[0_30px_60px_rgba(255,146,43,0.2)]">
                <div className="h-12 w-12 text-orange-200">{categoryIcon}</div>
              </div>
            </div>
          </header>

          <main id="main-content" className="relative -mt-8 space-y-8">
            <section
              className="rounded-3xl border border-white/10 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.15)] backdrop-blur-md transition-all duration-300 ease-out sm:p-8"
              aria-live="polite"
            >
              <div className="sticky top-20 z-20 -mx-6 mb-6 border-b border-slate-200/70 bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
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
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-500'
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
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-orange-400">{progressLabel}</p>
              </div>

              <CategoryGrid
                articles={sortedArticles}
                loading={loading}
                loadingMore={loadingMore}
                error={error}
                onRetry={retry}
                hasMore={hasMore}
                onLoadMore={loadMore}
                emptyMessage={emptyMessage}
                viewMode={viewMode}
                progressLabel={progressLabel}
              />
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-md transition-all duration-300 ease-out sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Related Categories</h2>
                  <p className="text-sm text-slate-500">Expand your feed with these curated beats.</p>
                </div>
                <Link
                  to="/trending"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-50"
                >
                  Discover more
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedCategories.map((cat, idx) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-white via-white/95 to-white/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-[0_30px_65px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    style={{ transitionDelay: `${idx * 40}ms` }}
                  >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100 opacity-50 blur-2xl transition group-hover:opacity-80" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="relative mt-6 space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                      <p className="text-sm text-slate-500">{cat.description}</p>
                    </div>
                    <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
                      Explore <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>

        <button
          type="button"
          onClick={() => setShowQuickFilters((prev) => !prev)}
          className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_18px_35px_rgba(255,115,55,0.4)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:hidden"
          aria-label="Toggle filters"
        >
          <Filter className="h-6 w-6" aria-hidden="true" />
        </button>

        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-36 right-5 z-40 hidden h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/20 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:flex"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {showQuickFilters && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border border-white/10 bg-white p-6 shadow-2xl">
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
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'border border-slate-200 text-slate-600'
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
                <button
                  type="button"
                  onClick={() => setShowQuickFilters(false)}
                  className="mt-4 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-orange-500/30"
                >
                  Apply
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
