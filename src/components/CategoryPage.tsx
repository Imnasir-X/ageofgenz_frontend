import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from './ErrorBoundary';
import CategoryGrid from './CategoryGrid';
import useCategoryArticles from '../hooks/useCategoryArticles';

type Props = {
  slug: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  emptyMessage?: string;
};

const CategoryPage: React.FC<Props> = ({ slug, title, description, metaTitle, metaDescription, emptyMessage }) => {
  const { articles, loading, loadingMore, error, retry, hasMore, loadMore } = useCategoryArticles(slug);

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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-8">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded shadow">Skip to content</a>
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-6 flex items-start justify-between">
            <div className="text-center w-full">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600 text-base max-w-2xl mx-auto">{description}</p>
            </div>
            <nav className="hidden sm:block ml-4">
              <Link to="/" className="text-orange-500 hover:text-orange-600">Home</Link>
            </nav>
          </header>

          <main id="main-content">
            <section className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg" aria-live="polite">
              <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500">Latest</h2>
              <CategoryGrid
                articles={articles}
                loading={loading}
                loadingMore={loadingMore}
                error={error}
                onRetry={retry}
                hasMore={hasMore}
                onLoadMore={loadMore}
                emptyMessage={emptyMessage}
              />
            </section>

            <div className="mt-4 text-center">
              <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">Return to Home</Link>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CategoryPage;
