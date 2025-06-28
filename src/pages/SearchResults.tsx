import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { getArticlesBySearch } from '../utils/api';
import type { Article } from '../types';
import ArticleCard from '../components/ArticleCard';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Skeleton Loader Component for Search Results
  const SearchResultSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="aspect-[16/10] bg-gray-200"></div>
        {/* Content skeleton */}
        <div className="p-3">
          {/* Category and meta row */}
          <div className="flex justify-between items-center mb-1.5">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="w-12 h-3 bg-gray-200 rounded"></div>
              <div className="w-8 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          {/* Title */}
          <div className="w-full h-4 bg-gray-200 rounded mb-1"></div>
          <div className="w-3/4 h-4 bg-gray-200 rounded mb-1"></div>
          {/* Description */}
          <div className="w-full h-3 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Error Component with Retry Button
  const ErrorWithRetry = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="text-center py-12">
      <Search size={48} className="mx-auto text-gray-600 mb-4" />
      <p className="text-gray-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mr-3"
      >
        <RefreshCw size={16} className="mr-2" />
        Try Again
      </button>
      <Link 
        to="/" 
        className="text-orange-500 hover:text-orange-600 transition-colors"
      >
        Browse all articles →
      </Link>
    </div>
  );

  // No Results Component
  const NoResults = () => (
    <div className="text-center py-12">
      <Search size={64} className="mx-auto text-gray-600 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
      <p className="text-gray-400 mb-4">
        No results for "<span className="font-medium">{query}</span>"
      </p>
      <div className="text-sm text-gray-500 mb-6">
        <p>Try searching for:</p>
        <p>• Different keywords</p>
        <p>• Broader terms</p>
        <p>• Check spelling</p>
      </div>
      <Link 
        to="/" 
        className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors"
      >
        Browse all articles →
      </Link>
    </div>
  );

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!query.trim()) {
        setArticles([]);
        setLoading(false);
        return;
      }

      console.log('🔍 Searching for:', query);
      const response = await getArticlesBySearch(query);
      console.log('Search Response:', response.data);
      
      const results = response.data.results || [];
      setArticles(results);
      
      if (results.length === 0) {
        // Don't set error for no results - handle in UI
        setArticles([]);
      }
    } catch (err: any) {
      console.error('Search Error:', err);
      setError('Failed to load search results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]);

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
        {/* Header Section */}
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {query ? `Showing results for your search query.` : 'Please enter a search query to find articles.'}
          </p>
        </section>

        {/* Results Section */}
        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg mx-auto">
          {loading ? (
            <>
              <div className="animate-pulse mb-4">
                <div className="w-48 h-8 bg-gray-700 rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <SearchResultSkeleton key={`search-skeleton-${i}`} />
                ))}
              </div>
            </>
          ) : error ? (
            <ErrorWithRetry error={error} onRetry={fetchSearchResults} />
          ) : articles.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500">
                Found {articles.length} article{articles.length !== 1 ? 's' : ''}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {articles.map((article) => {
                  console.log('Rendering Search Result:', article);
                  
                  // Skip if no ID
                  if (!article.id) {
                    console.warn('Skipping article due to missing ID:', article);
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
            <NoResults />
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