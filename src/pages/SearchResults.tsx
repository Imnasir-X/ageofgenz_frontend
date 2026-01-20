import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, Search } from 'lucide-react';
import { getArticlesBySearch } from '../utils/api';
import type { Article } from '../types';
import ArticleCard from '../components/ArticleCard';

const SearchResultSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <div className="w-16 h-4 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="w-12 h-3 bg-gray-200 rounded" />
            <div className="w-8 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-3/4 h-4 bg-gray-200 rounded" />
        <div className="w-full h-3 bg-gray-200 rounded" />
        <div className="w-1/2 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const ErrorWithRetry: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <Search size={48} className="mx-auto text-gray-600 mb-4" />
    <p className="text-gray-500 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mr-3"
    >
      <RefreshCw size={16} className="mr-2" />
      Try Again
    </button>
    <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
      Browse all articles →
    </Link>
  </div>
);

const NoResults: React.FC<{ query: string }> = ({ query }) => (
  <div className="text-center py-12">
    <Search size={64} className="mx-auto text-gray-600 mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
    <p className="text-gray-500 mb-4">
      No results for "<span className="font-medium text-gray-900">{query}</span>"
    </p>
    <div className="text-sm text-gray-600 mb-6 space-y-1">
      <p>Try searching for:</p>
      <p>• Different keywords</p>
      <p>• Broader terms</p>
      <p>• Double-check spelling</p>
    </div>
    <Link to="/" className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors">
      Browse all articles →
    </Link>
  </div>
);

const SearchResults: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const fetchSearchResults = useCallback(
    async (searchTerm: string, signal: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getArticlesBySearch(searchTerm, signal);

        if (signal.aborted) {
          return;
        }

        const maybeResults = response?.data?.results;
        const normalizedResults = Array.isArray(maybeResults)
          ? maybeResults.filter((item): item is Article => Boolean(item))
          : [];

        setArticles(normalizedResults);
      } catch (err: any) {
        if (signal.aborted || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          return;
        }

        setError('Failed to load search results. Please try again later.');
        setArticles([]);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [setArticles, setError, setLoading]
  );

  useEffect(() => {
    const controller = new AbortController();

    if (!trimmedQuery) {
      setArticles([]);
      setError(null);
      setLoading(false);
      return () => controller.abort();
    }

    fetchSearchResults(trimmedQuery, controller.signal);

    return () => controller.abort();
  }, [fetchSearchResults, trimmedQuery, retryNonce]);

  // Get image position based on article category
  const getImagePosition = (article: Article): 'top' | 'center' | 'bottom' => {
    const category = article.category?.name?.toLowerCase() || '';
    if (category.includes('politic') || category.includes('opinion')) return 'top';
    if (category.includes('sport')) return 'center';
    return 'center';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Helmet>
          <title>
            {trimmedQuery
              ? `Search results for "${trimmedQuery}" | The Age of GenZ`
              : 'Search | The Age of GenZ'}
          </title>
          <meta
            name="description"
            content={
              trimmedQuery
                ? `Browse news articles that match your search for "${trimmedQuery}" on The Age of GenZ.`
                : 'Search The Age of GenZ for the latest stories in politics, culture, world news, and technology.'
            }
          />
          <meta name="robots" content="index, follow" />
        </Helmet>
        {/* Header Section */}
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {trimmedQuery ? `Search Results for "${trimmedQuery}"` : 'Search The Age of GenZ'}
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {trimmedQuery
              ? 'Showing results for your search query.'
              : 'Please enter a search query to find articles.'}
          </p>
        </section>

        {/* Results Section */}
        <div className="bg-white rounded border border-gray-200 p-6 shadow-lg mx-auto">
          {loading ? (
            <>
              <div className="animate-pulse mb-4">
                <div className="w-48 h-8 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SearchResultSkeleton key={`search-skeleton-${i}`} />
                ))}
              </div>
            </>
          ) : error ? (
            <ErrorWithRetry
              error={error}
              onRetry={() => {
                if (!trimmedQuery) {
                  setArticles([]);
                  setError(null);
                  setLoading(false);
                  return;
                }
                setRetryNonce((nonce) => nonce + 1);
              }}
            />
          ) : articles.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-500">
                Found {articles.length} article{articles.length !== 1 ? 's' : ''}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {articles.map((article) => {
                  if (!article.id) {
                    return null;
                  }
                  
                  return (
                    <ArticleCard 
                      key={`search-${article.id}`} 
                      article={article}
                      imagePosition={getImagePosition(article)}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <NoResults query={trimmedQuery} />
          )}
        </div>

        {/* Return Link */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
