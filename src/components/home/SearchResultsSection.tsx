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

  return (
    <>
      {loadingSearch && <SearchResultsSkeleton />}
      {errorSearch && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
            <button
              aria-label="Close search results"
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-red-500" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Error</h3>
            <p className="text-red-600 mb-6 max-w-md mx-auto">{errorSearch}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
            >
              <RefreshCw size={18} className="mr-2" />
              Try Search Again
            </button>
          </div>
        </section>
      )}
      {!loadingSearch && !errorSearch && searchResults.length === 0 && showSearch && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
            <button
              aria-label="Close search results"
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
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
        </section>
      )}
      {searchResults.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {searchResults.length} found
              </span>
            </div>
            <button
              aria-label="Close search results"
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map((article) => (
              <ArticleCard
                key={`search-${article.id}`}
                article={article}
                imagePosition={getImagePosition(article)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default SearchResultsSection;
