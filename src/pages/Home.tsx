import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
// Removed DonationPlaceholder per request
import Newsletter from '../components/Newsletter';
import ArticleCard from '../components/ArticleCard';
import { getFeaturedArticles, getArticlesBySearch, getLatestArticles, getCategories } from '../utils/api';
import { RefreshCw, Search, X, TrendingUp, Clock, BookOpen, Megaphone } from 'lucide-react';
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
  const [showNewsletterCard, setShowNewsletterCard] = useState<boolean>(false);
  const [breakingIndex, setBreakingIndex] = useState<number>(0);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Function to format category names professionally
  const formatCategoryName = (name: string): string => {
    const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return formatted;
  };

  // Breaking items: prefer latest, fallback to featured
  const breakingItems = useMemo(() => {
    const pool = latestArticles.length > 0 ? latestArticles : featuredArticles;
    return pool.slice(0, 10);
  }, [latestArticles, featuredArticles]);

  // Auto-rotate breaking items every 6s
  useEffect(() => {
    if (breakingItems.length <= 1) return;
    const id = window.setInterval(() => {
      setBreakingIndex((i) => (i + 1) % breakingItems.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [breakingItems.length]);

  // Smart image position based on category or content type
  const getImagePosition = useCallback((article: Article): 'top' | 'center' | 'bottom' => {
    const category = article.category?.name?.toLowerCase() || '';
    
    if (category.includes('sport')) return 'center';
    if (category.includes('politic') || category.includes('opinion')) return 'top';
    if (category.includes('meme') || category.includes('culture')) return 'center';
    if (category.includes('world')) return 'center';
    
    return 'center';
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                aria-label="Close search results"
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                  setErrorSearch(null);
                }}
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
                aria-label="Close search results"
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
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
                aria-label="Close search results"
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
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

    // Load all in parallel for better perceived performance
    void Promise.allSettled([
      fetchCategories(),
      fetchFeaturedArticles(),
      fetchLatestArticles(),
    ]);
  }, []);

  // Retry functions (same as before)
  const retryFeatured = useCallback(async () => {
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
  }, []);

  // Show newsletter card when user reaches ~middle of the page
  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && localStorage.getItem('newsletterDismissed') === '1';
    const subscribed = typeof window !== 'undefined' && localStorage.getItem('newsletterSubscribed') === '1';
    if (dismissed || subscribed) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight || 1;
      const clientHeight = doc.clientHeight || 1;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      const progress = scrollTop / maxScroll; // 0.0 -> 1.0

      if (progress >= 0.5) {
        setShowNewsletterCard(true);
        window.removeEventListener('scroll', onScroll);
      }
    };

    // Initial check in case the user has already scrolled enough
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // When the newsletter modal opens, lock scroll and manage focus; restore on close
  useEffect(() => {
    if (!showNewsletterCard) return;

    // lock scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // store previous focus
    prevFocusRef.current = (document.activeElement as HTMLElement) || null;

    // focus the close button once rendered
    const t = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    // esc handler
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewsletterCard(false);
        localStorage.setItem('newsletterDismissed', '1');
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // cleanup
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // restore focus
      prevFocusRef.current?.focus?.();
    };
  }, [showNewsletterCard]);

  const retryLatest = useCallback(async () => {
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
  }, []);

  // Enhanced search function
  const handleSearch = useCallback(async (query: string) => {
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Compact Header Section */}
        <div className="text-center mb-28">
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Breaking News - compact rotating card */}
        {breakingItems.length > 0 && (
          <div className="max-w-6xl mx-auto mb-10">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone size={18} className="text-red-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-900">Breaking</span>
              </div>
              {(() => {
                const a = breakingItems[breakingIndex];
                const href = a?.slug ? `/article/${a.slug}` : '#';
                const dateText = new Date(a?.date || a?.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const img = a?.featured_image_url || a?.image || a?.featured_image || '/api/placeholder/400/250';
                return (
                  <Link to={href} className="block group">
                    <div className="flex items-center gap-3">
                      <div className="w-36 sm:w-44 md:w-52 aspect-[16/10] bg-gray-100 overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={img}
                          alt={a?.title || 'Breaking image'}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/api/placeholder/400/250'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center text-[11px] text-gray-500 mb-1">
                          <Clock size={10} className="mr-1" />
                          {dateText}
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors">
                          {a?.title || 'Untitled Article'}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })()}
            </div>
          </div>
        )}

        {/* Enhanced Search Results Section */}
        <SearchResultsSection />

        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="w-full">
            {/* Enhanced Featured Stories Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={28} className="text-orange-500" aria-hidden="true" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Featured Stories
                </h2>
              </div>
              {loadingFeatured ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <TrendingUp size={40} className="text-orange-500" aria-hidden="true" />
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
                <Clock size={28} className="text-blue-500" aria-hidden="true" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Latest News
                </h2>
              </div>
              {loadingLatest ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <BookOpen size={40} className="text-blue-500" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Articles Available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Latest articles will appear here once they're published. Start creating content to fill this space!
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar removed per request */}
        </div>
      </div>

      {showNewsletterCard && !showSearch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 relative">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => {
              setShowNewsletterCard(false);
              localStorage.setItem('newsletterDismissed', '1');
            }}
          />
          <div
            className="relative rounded-xl shadow-2xl overflow-hidden border border-gray-200 bg-white aspect-[3/2] w-full max-w-[640px]"
            role="dialog"
            aria-modal="true"
            aria-label="Newsletter signup"
          >
            <button
              type="button"
              aria-label="Dismiss newsletter"
              className="absolute top-2 right-2 z-10 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              onClick={() => {
                setShowNewsletterCard(false);
                localStorage.setItem('newsletterDismissed', '1');
              }}
              ref={closeBtnRef}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div className="absolute inset-0 p-4 sm:p-6 flex">
              <div className="w-full h-full overflow-auto">
                <Newsletter 
                  variant="compact"
                  onSubscribed={() => {
                    localStorage.setItem('newsletterSubscribed', '1');
                    setShowNewsletterCard(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
