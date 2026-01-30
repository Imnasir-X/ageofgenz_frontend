import React from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import type { Article } from '../../types';
import ArticleCard from '../ArticleCard';
import { SearchResultsSkeleton } from './Skeletons';

type SearchResultsSectionProps = {
  showSearch: boolean;
  loadingSearch: boolean;
  errorSearch: string | null;
  searchResults: Article[];
  searchQuery: string;
  onClose: () => void;
  onRetry: () => void;
  getImagePosition: (article: Article) => 'top' | 'center' | 'bottom';
};

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  showSearch,
  loadingSearch,
  errorSearch,
  searchResults,
  searchQuery,
  onClose,
  onRetry,
  getImagePosition,
}) => {
  if (!showSearch) return null;

  const hasResults = searchResults.length > 0;
  const showEmpty = !loadingSearch && !errorSearch && !hasResults;
  const showError = !loadingSearch && Boolean(errorSearch);
  const showResults = !loadingSearch && !errorSearch && hasResults;
  const errorDetail = errorSearch
    ? errorSearch.toString().replace(/\s+/g, ' ').trim()
    : '';
  const errorSnippet = errorDetail.length > 120 ? `${errorDetail.slice(0, 120)}…` : errorDetail;

  return (
    <section className="mb-12" role="region" aria-label="Search results">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
          {!loadingSearch && !errorSearch && hasResults && (
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {searchResults.length} found
            </span>
          )}
        </div>
        <button
          aria-label="Close search results"
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>

      {loadingSearch && (
        <>
          <span className="sr-only" role="status" aria-live="polite">
            Searching…
          </span>
          <SearchResultsSkeleton />
        </>
      )}

      {showError && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center" role="alert">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-red-500" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">We couldn&apos;t run that search</h3>
          <p className="text-gray-700 mb-2 max-w-md mx-auto">Please try again in a moment.</p>
          {errorSnippet && (
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {errorSnippet}
            </p>
          )}
          <button
            onClick={onRetry}
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          >
            <RefreshCw size={18} className="mr-2" aria-hidden="true" />
            Try Search Again
          </button>
        </div>
      )}

      {showEmpty && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={48} className="text-gray-400" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Results Found</h3>
          <p className="text-gray-700 mb-2 text-lg">
            No articles found for "<span className="font-semibold text-gray-900">{searchQuery}</span>"
          </p>
          <div className="text-gray-700 space-y-1 mt-6">
            <p className="font-medium">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Different keywords</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Broader terms</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Check spelling</span>
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {searchResults.map((article) => (
            <ArticleCard
              key={`search-${article.id}`}
              article={article}
              imagePosition={getImagePosition(article)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchResultsSection;
