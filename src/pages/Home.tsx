import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import DonationPlaceholder from '../components/DonationPlaceholder';
import Newsletter from '../components/Newsletter';
import ArticleCard from '../components/ArticleCard';
import { getFeaturedArticles, getArticlesBySearch, getArticles, getCategories } from '../utils/api';
import { RefreshCw, Search, X } from 'lucide-react';
import type { Article, Category } from '../types';

const Home: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  
  const [loadingFeatured, setLoadingFeatured] = useState<boolean>(true);
  const [loadingLatest, setLoadingLatest] = useState<boolean>(true);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  
  const [errorFeatured, setErrorFeatured] = useState<string | null>(null);
  const [errorLatest, setErrorLatest] = useState<string | null>(null);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Function to format category names professionally
  const formatCategoryName = (name: string): string => {
    const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return formatted;
  };

  // Smart image position based on category or content type
  const getImagePosition = (article: Article): 'top' | 'center' | 'bottom' => {
    const category = article.category?.name?.toLowerCase() || '';
    
    // Sports often have action at the center
    if (category.includes('sport')) return 'center';
    
    // Politics/Opinion often have headshots - focus on top
    if (category.includes('politic') || category.includes('opinion')) return 'top';
    
    // Memes/Culture can vary - use center as default
    if (category.includes('meme') || category.includes('culture')) return 'center';
    
    // World news often has landscapes - use center
    if (category.includes('world')) return 'center';
    
    // Default to center for others
    return 'center';
  };

  // Skeleton Loader Component for Article Cards
  const ArticleCardSkeleton = () => (
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

  // Categories Skeleton
  const CategoriesSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="animate-pulse">
        <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="w-16 h-6 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Search Results Skeleton
  const SearchResultsSkeleton = () => (
    <section className="mb-8">
      <div className="animate-pulse">
        <div className="w-48 h-8 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <ArticleCardSkeleton key={`search-skeleton-${i}`} />
          ))}
        </div>
      </div>
    </section>
  );

  // Error Component with Retry Button
  const ErrorWithRetry = ({ error, onRetry, section }: { error: string; onRetry: () => void; section: string }) => (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <RefreshCw size={16} className="mr-2" />
        Try Again
      </button>
      <p className="text-gray-500 mt-2">
        {section === 'featured' && 'Please make sure your backend is running and has some featured articles.'}
        {section === 'latest' && 'Please make sure your backend is running and has some articles.'}
      </p>
    </div>
  );

  // Enhanced Search Results with Clear and No Results
  const SearchResultsSection = () => {
    if (!showSearch) return null;

    return (
      <>
        {loadingSearch && <SearchResultsSkeleton />}
        {errorSearch && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold pb-2 border-b-2 border-orange-500">
                Search Results
              </h2>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                  setErrorSearch(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center py-8">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-red-600 mb-4">{errorSearch}</p>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RefreshCw size={16} className="mr-2" />
                Try Search Again
              </button>
            </div>
          </section>
        )}
        {!loadingSearch && !errorSearch && searchResults.length === 0 && showSearch && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold pb-2 border-b-2 border-orange-500">
                Search Results
              </h2>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center py-12">
              <Search size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">
                No results for "<span className="font-medium">{searchQuery}</span>"
              </p>
              <div className="text-sm text-gray-400">
                <p>Try searching for:</p>
                <p>• Different keywords</p>
                <p>• Broader terms</p>
                <p>• Check spelling</p>
              </div>
            </div>
          </section>
        )}
        {searchResults.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold pb-2 border-b-2 border-orange-500">
                Search Results ({searchResults.length})
              </h2>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

  // ⚡ STAGGERED LOADING - Categories first, then featured, then latest
  useEffect(() => {
    // 1. Load categories first (fastest)
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        console.log('🏠 Fetching popular categories...');
        const response = await getCategories();
        console.log('Categories Response:', response.data);
        
        // Take first 6 categories as popular
        const categories = response.data.slice(0, 6) || [];
        setPopularCategories(categories);
      } catch (err: any) {
        console.error('Categories Error:', err);
        // Use your ACTUAL categories as fallback with proper formatting
        setPopularCategories([
          { id: 1, name: 'Culture', slug: 'culture' },
          { id: 2, name: 'Sports', slug: 'sports' },
          { id: 3, name: 'Insights', slug: 'insights' },
          { id: 4, name: 'Memes', slug: 'memes' },
          { id: 5, name: 'World', slug: 'world' },
          { id: 6, name: 'Politics', slug: 'politics' },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    // 2. Load featured articles (medium priority)
    const fetchFeaturedArticles = async () => {
      setLoadingFeatured(true);
      setErrorFeatured(null);
      try {
        console.log('🏠 Fetching featured articles...');
        const response = await getFeaturedArticles();
        console.log('Featured Articles Response:', response.data);
        
        const articles = response.data.results || [];
        if (articles.length === 0) {
          setErrorFeatured('No featured articles found.');
        } else {
          setFeaturedArticles(articles);
        }
      } catch (err: any) {
        console.error('Featured Articles Error:', err);
        setErrorFeatured(`Failed to load featured articles: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoadingFeatured(false);
      }
    };

    // 3. Load latest articles (lowest priority)
    const fetchLatestArticles = async () => {
      setLoadingLatest(true);
      setErrorLatest(null);
      try {
        console.log('🏠 Fetching latest articles...');
        const response = await getArticles();
        console.log('Latest Articles Response:', response.data);
        
        const articles = response.data.results || [];
        if (articles.length === 0) {
          setErrorLatest('No latest articles found.');
        } else {
          setLatestArticles(articles);
        }
      } catch (err: any) {
        console.error('Latest Articles Error:', err);
        setErrorLatest(`Failed to load latest articles: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoadingLatest(false);
      }
    };

    // ⚡ STAGGERED EXECUTION
    fetchCategories(); // Start immediately
    
    setTimeout(() => {
      fetchFeaturedArticles(); // Start after 100ms
    }, 100);
    
    setTimeout(() => {
      fetchLatestArticles(); // Start after 300ms
    }, 300);
  }, []);

  // Retry functions for error recovery
  const retryFeatured = async () => {
    setLoadingFeatured(true);
    setErrorFeatured(null);
    try {
      const response = await getFeaturedArticles();
      const articles = response.data.results || [];
      if (articles.length === 0) {
        setErrorFeatured('No featured articles found.');
      } else {
        setFeaturedArticles(articles);
      }
    } catch (err: any) {
      setErrorFeatured(`Failed to load featured articles: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const retryLatest = async () => {
    setLoadingLatest(true);
    setErrorLatest(null);
    try {
      const response = await getArticles();
      const articles = response.data.results || [];
      if (articles.length === 0) {
        setErrorLatest('No latest articles found.');
      } else {
        setLatestArticles(articles);
      }
    } catch (err: any) {
      setErrorLatest(`Failed to load latest articles: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoadingLatest(false);
    }
  };

  // Enhanced search with Enter key support
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setShowSearch(false);
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setSearchQuery(query);
    setLoadingSearch(true);
    setErrorSearch(null);
    setShowSearch(true);
    
    try {
      console.log('🔍 Searching for:', query);
      const response = await getArticlesBySearch(query);
      console.log('Search Results Response:', response.data);
      
      const articles = response.data.results || [];
      if (articles.length === 0) {
        setSearchResults([]);
        // Don't set error for no results - handle in UI
      } else {
        setSearchResults(articles);
      }
    } catch (err: any) {
      console.error('Search Error:', err);
      setErrorSearch(`Failed to load search results: ${err.response?.data?.detail || err.message}`);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Enhanced Search Results Section */}
      <SearchResultsSection />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-8/12">
          {/* Featured Stories Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-orange-500">
              Featured Stories
            </h2>
            {loadingFeatured ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <ArticleCardSkeleton key={`featured-skeleton-${i}`} />
                ))}
              </div>
            ) : errorFeatured ? (
              <ErrorWithRetry 
                error={errorFeatured} 
                onRetry={retryFeatured} 
                section="featured"
              />
            ) : featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredArticles.map((article) => (
                  <ArticleCard 
                    key={`featured-${article.id}`} 
                    article={article} 
                    imagePosition={getImagePosition(article)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No featured articles available.</p>
                <p className="text-gray-500 mt-2">
                  Add some featured articles in the Django admin panel.
                </p>
              </div>
            )}
          </section>

          {/* Latest News Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-orange-500">
              Latest News
            </h2>
            {loadingLatest ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ArticleCardSkeleton key={`latest-skeleton-${i}`} />
                ))}
              </div>
            ) : errorLatest ? (
              <ErrorWithRetry 
                error={errorLatest} 
                onRetry={retryLatest} 
                section="latest"
              />
            ) : latestArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestArticles.map((article) => (
                  <ArticleCard 
                    key={`latest-${article.id}`} 
                    article={article} 
                    imagePosition={getImagePosition(article)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No latest articles available.</p>
                <p className="text-gray-500 mt-2">
                  Add some articles in the Django admin panel.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Enhanced Sidebar */}
        <aside className="lg:w-4/12 mt-8 lg:mt-0 lg:sticky lg:top-24 self-start">
          <div className="space-y-8">
            {/* Popular Categories with Skeleton */}
            {loadingCategories ? (
              <CategoriesSkeleton />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-orange-500">
                  Popular Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/${category.slug}`}
                      className="text-gray-700 px-3 py-1 text-sm hover:text-orange-500 transition-colors duration-200 font-medium"
                    >
                      {formatCategoryName(category.name)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Donation and Newsletter */}
            <DonationPlaceholder />
            <Newsletter />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;