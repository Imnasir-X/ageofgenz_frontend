import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import DonationPlaceholder from '../components/DonationPlaceholder';
import Newsletter from '../components/Newsletter';
import ArticleCard from '../components/ArticleCard';
import { getFeaturedArticles, getArticlesBySearch, getArticles, getLatestArticles, getCategories } from '../utils/api';
import { RefreshCw, Search, X, TrendingUp, Clock, BookOpen } from 'lucide-react';
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
    
    if (category.includes('sport')) return 'center';
    if (category.includes('politic') || category.includes('opinion')) return 'top';
    if (category.includes('meme') || category.includes('culture')) return 'center';
    if (category.includes('world')) return 'center';
    
    return 'center';
  };

  // Enhanced Skeleton Loader Component with Professional Styling
  const ArticleCardSkeleton = () => (
    <div className="article-card bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="animate-pulse">
        {/* Image skeleton with shimmer effect */}
        <div className="aspect-[16/10] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Category and meta row */}
          <div className="flex justify-between items-center">
            <div className="w-20 h-5 bg-orange-200 rounded-full"></div>
            <div className="flex gap-3">
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="w-full h-5 bg-gray-300 rounded"></div>
            <div className="w-4/5 h-5 bg-gray-300 rounded"></div>
          </div>
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-3/5 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Categories Skeleton with Professional Styling
  const CategoriesSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="animate-pulse">
        <div className="w-40 h-6 bg-gray-300 rounded mb-6"></div>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="w-20 h-8 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced Search Results Skeleton
  const SearchResultsSkeleton = () => (
    <section className="mb-12">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-8 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <ArticleCardSkeleton key={`search-skeleton-${i}`} />
          ))}
        </div>
      </div>
    </section>
  );

  // Enhanced Error Component with Better Design
  const ErrorWithRetry = ({ error, onRetry, section }: { error: string; onRetry: () => void; section: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <RefreshCw size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Content</h3>
      <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
      >
        <RefreshCw size={18} className="mr-2" />
        Try Again
      </button>
      <p className="text-gray-500 mt-4 text-sm">
        {section === 'featured' && 'Featured articles will appear here once they\'re added to the system.'}
        {section === 'latest' && 'Latest articles will appear here once they\'re published.'}
      </p>
    </div>
  );

  // Enhanced Search Results Section with Professional Styling
  const SearchResultsSection = () => {
    if (!showSearch) return null;

    return (
      <>
        {loadingSearch && <SearchResultsSkeleton />}
        {errorSearch && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Search Results
              </h2>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                  setErrorSearch(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Error</h3>
              <p className="text-red-600 mb-6 max-w-md mx-auto">{errorSearch}</p>
              <button
                onClick={() => handleSearch(searchQuery)}
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
              <h2 className="text-3xl font-bold text-gray-900">
                Search Results
              </h2>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Results Found</h3>
              <p className="text-gray-600 mb-2 text-lg">
                No articles found for "<span className="font-semibold text-gray-900">{searchQuery}</span>"
              </p>
              <div className="text-gray-500 space-y-1 mt-6">
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
                <h2 className="text-3xl font-bold text-gray-900">
                  Search Results
                </h2>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {searchResults.length} found
                </span>
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

  // Data fetching effects (same as before but with better error handling)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        console.log('🏠 Fetching popular categories...');
        const response = await getCategories();
        console.log('Categories Response:', response.data);
        
        const categories = response.data.slice(0, 6) || [];
        setPopularCategories(categories);
      } catch (err: any) {
        console.error('Categories Error:', err);
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

    const fetchLatestArticles = async () => {
      setLoadingLatest(true);
      setErrorLatest(null);
      try {
        console.log('🏠 Fetching latest articles...');
        const response = await getLatestArticles();
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

    // Staggered loading for better UX
    fetchCategories();
    setTimeout(fetchFeaturedArticles, 100);
    setTimeout(fetchLatestArticles, 300);
  }, []);

  // Retry functions (same as before)
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
      const response = await getLatestArticles();
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

  // Enhanced search function
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
      setSearchResults(articles);
    } catch (err: any) {
      console.error('Search Error:', err);
      setErrorSearch(`Failed to load search results: ${err.response?.data?.detail || err.message}`);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Compact Header Section */}
        <div className="text-center mb-8">
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Enhanced Search Results Section */}
        <SearchResultsSection />

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-8/12">
            {/* Enhanced Featured Stories Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={28} className="text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Featured Stories
                </h2>
              </div>
              {loadingFeatured ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((article) => (
                    <ArticleCard 
                      key={`featured-${article.id}`} 
                      article={article} 
                      imagePosition={getImagePosition(article)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp size={40} className="text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Featured Articles Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Featured articles will appear here once they're added to the system. Check back soon for curated content!
                  </p>
                </div>
              )}
            </section>

            {/* Enhanced Latest News Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Clock size={28} className="text-blue-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Latest News
                </h2>
              </div>
              {loadingLatest ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestArticles.map((article) => (
                    <ArticleCard 
                      key={`latest-${article.id}`} 
                      article={article} 
                      imagePosition={getImagePosition(article)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen size={40} className="text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Articles Available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Latest articles will appear here once they're published. Start creating content to fill this space!
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Enhanced Sidebar */}
          <aside className="lg:w-4/12 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Enhanced Popular Categories */}
              {loadingCategories ? (
                <CategoriesSkeleton />
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-orange-500">
                    Popular Categories
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {popularCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/${category.slug}`}
                        className="inline-flex items-center bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-orange-200"
                      >
                        {formatCategoryName(category.name)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Donation and Newsletter */}
              <DonationPlaceholder />
              <Newsletter />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;