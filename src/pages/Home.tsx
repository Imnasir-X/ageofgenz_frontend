import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
// Removed DonationPlaceholder per request
import Newsletter from '../components/Newsletter';
import ArticleCard from '../components/ArticleCard';
import { 
  getFeaturedArticles, 
  getArticlesBySearch, 
  getLatestArticles, 
  getCategories,
  getArticles,
  getArticlesByCategory
} from '../utils/api';
import { RefreshCw, Search, X, TrendingUp, Clock, BookOpen, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Article, Category } from '../types';

const HERO_ROTATE_INTERVAL = 7000;

const Home: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Infinite scroll state for Latest
  const [latestList, setLatestList] = useState<Article[]>([]);
  const [latestPage, setLatestPage] = useState<number>(1);
  const [latestHasMore, setLatestHasMore] = useState<boolean>(true);
  const [loadingMoreLatest, setLoadingMoreLatest] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [liveUpdatesCount, setLiveUpdatesCount] = useState<number>(0);
  
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
  
  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const heroTimerRef = useRef<number | null>(null);
  const [heroPlaying, setHeroPlaying] = useState<boolean>(true);
  const heroSwipePointerRef = useRef<number | null>(null);
  const heroSwipeStartXRef = useRef<number | null>(null);
  const heroSwipeLastXRef = useRef<number | null>(null);

  // Font size adjuster removed per request

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

  // Progressive image component (simple LQ placeholder fade-in)
  const ProgressiveImage: React.FC<{ src: string | null | undefined; alt: string; className?: string; eager?: boolean }> = ({ src, alt, className, eager = false }) => {
    const [loaded, setLoaded] = useState(false);
    const imgSrc = src || '/api/placeholder/1200/675';
    return (
      <div className={`relative ${className || ''}`}>
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${loaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}></div>
        <img
          src={imgSrc}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' as any : 'auto' as any}
          onLoad={() => setLoaded(true)}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/api/placeholder/1200/675'; setLoaded(true); }}
          className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        />
      </div>
    );
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

  // Hero items - prefer featured then latest
  const heroItems = useMemo(() => {
    const pool = featuredArticles.length > 0 ? featuredArticles : latestArticles;
    return pool.slice(0, 5);
  }, [featuredArticles, latestArticles]);

  const displayedFeatured = useMemo(() => {
    if (activeCategory === 'all') return featuredArticles;
    return featuredArticles.filter(a => (a.category?.slug || a.category?.name?.toLowerCase()) === activeCategory);
  }, [featuredArticles, activeCategory]);

  const secondaryFeatured = useMemo(() => displayedFeatured.slice(1, 5), [displayedFeatured]);

  // Auto-rotate hero
  useEffect(() => {
    if (heroTimerRef.current) {
      window.clearInterval(heroTimerRef.current);
      heroTimerRef.current = null;
    }

    if (heroItems.length <= 1 || !heroPlaying) {
      return () => {
        if (heroTimerRef.current) {
          window.clearInterval(heroTimerRef.current);
          heroTimerRef.current = null;
        }
      };
    }

    heroTimerRef.current = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroItems.length);
    }, HERO_ROTATE_INTERVAL);

    return () => {
      if (heroTimerRef.current) {
        window.clearInterval(heroTimerRef.current);
        heroTimerRef.current = null;
      }
    };
  }, [heroItems.length, heroPlaying, heroIndex]);

  const goToHeroSlide = useCallback((index: number) => {
    if (heroItems.length === 0) return;
    const safeIndex = ((index % heroItems.length) + heroItems.length) % heroItems.length;
    setHeroIndex(safeIndex);
  }, [heroItems.length]);

  const goToNextHero = useCallback(() => {
    if (heroItems.length === 0) return;
    setHeroIndex((i) => (i + 1) % heroItems.length);
  }, [heroItems.length]);

  const goToPrevHero = useCallback(() => {
    if (heroItems.length === 0) return;
    setHeroIndex((i) => (i - 1 + heroItems.length) % heroItems.length);
  }, [heroItems.length]);

  const HERO_SWIPE_THRESHOLD = 48;

  const handleHeroPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (heroItems.length <= 1) return;
    heroSwipePointerRef.current = event.pointerId;
    heroSwipeStartXRef.current = event.clientX;
    heroSwipeLastXRef.current = event.clientX;
  }, [heroItems.length]);

  const handleHeroPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (heroSwipePointerRef.current !== event.pointerId || heroSwipeStartXRef.current === null) return;
    heroSwipeLastXRef.current = event.clientX;
  }, []);

  const resetHeroSwipeTracking = useCallback(() => {
    heroSwipePointerRef.current = null;
    heroSwipeStartXRef.current = null;
    heroSwipeLastXRef.current = null;
  }, []);

  const handleHeroPointerEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (heroSwipePointerRef.current !== event.pointerId || heroSwipeStartXRef.current === null) {
      return;
    }
    const endX = heroSwipeLastXRef.current ?? event.clientX;
    const deltaX = endX - heroSwipeStartXRef.current;
    resetHeroSwipeTracking();
    if (Math.abs(deltaX) < HERO_SWIPE_THRESHOLD) return;
    if (deltaX < 0) {
      goToNextHero();
    } else {
      goToPrevHero();
    }
  }, [goToNextHero, goToPrevHero]);

  const handleHeroPointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (heroSwipePointerRef.current !== event.pointerId) return;
    resetHeroSwipeTracking();
  }, [resetHeroSwipeTracking]);

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
        // SWR-style cache for featured
        const cachedRaw = localStorage.getItem('featuredCache');
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            const ageMs = Date.now() - (cached.timestamp || 0);
            if (cached.articles && ageMs < 10 * 60 * 1000) {
              setFeaturedArticles(cached.articles);
              setLoadingFeatured(false);
            }
          } catch {}
        }
        console.log('🏠 Fetching featured articles...');
        const response = await getFeaturedArticles();
        console.log('Featured Articles Response:', response.data);
        const articles = response.data.results || [];
        if (articles.length === 0) {
          setErrorFeatured('No featured articles found.');
        } else {
          setFeaturedArticles(articles);
          // Update cache
          localStorage.setItem('featuredCache', JSON.stringify({ timestamp: Date.now(), articles }));
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
          // Seed infinite list with first batch if empty
          if (latestList.length === 0) setLatestList(articles);
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

  // Load a page for infinite scroll (all or by category)
  const loadLatestPage = useCallback(async (page: number, categorySlug?: string) => {
    setLoadingMoreLatest(true);
    try {
      let response;
      if (categorySlug && categorySlug !== 'all') {
        response = await getArticlesByCategory(categorySlug, page);
      } else {
        response = await getArticles(page);
      }
      const results = response.data.results || [];
      setLatestList((prev) => (page === 1 ? results : [...prev, ...results]));
      setLatestHasMore(Boolean(response.data.next));
      setLatestPage(page);
    } catch (err) {
      console.error('Load latest page error:', err);
      setLatestHasMore(false);
    } finally {
      setLoadingMoreLatest(false);
    }
  }, []);

  // Observe sentinel for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && latestHasMore && !loadingMoreLatest) {
        loadLatestPage(latestPage + 1, activeCategory !== 'all' ? activeCategory : undefined);
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [latestHasMore, loadingMoreLatest, latestPage, activeCategory, loadLatestPage]);

  // Initialize infinite list
  useEffect(() => {
    // If nothing loaded yet, load first page
    if (latestList.length === 0 && !loadingLatest) {
      loadLatestPage(1);
    }
  }, [loadingLatest, latestList.length, loadLatestPage]);

  // React to category changes
  useEffect(() => {
    setLatestPage(0);
    setLatestHasMore(true);
    loadLatestPage(1, activeCategory !== 'all' ? activeCategory : undefined);
  }, [activeCategory, loadLatestPage]);

  // Live updates: poll for new articles
  useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const res = await getArticles(1);
        const newest = res.data.results || [];
        if (newest.length > 0 && latestList.length > 0) {
          const latestTopId = latestList[0]?.id;
          const idx = newest.findIndex(a => a.id === latestTopId);
          if (idx > 0) {
            setLiveUpdatesCount(idx);
          }
        }
      } catch {}
    }, 60000);
    return () => window.clearInterval(id);
  }, [latestList]);

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
        

        {/* Hero Carousel */}
        {heroItems.length > 0 ? (
          <section className="mb-10">
            <div
              className="relative w-full rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured stories"
              aria-live={heroPlaying ? 'polite' : 'off'}
              aria-atomic="false"
              style={{ touchAction: 'pan-y' }}
              onPointerDown={handleHeroPointerDown}
              onPointerMove={handleHeroPointerMove}
              onPointerUp={handleHeroPointerEnd}
              onPointerCancel={handleHeroPointerCancel}
              onPointerLeave={handleHeroPointerCancel}
            >
              {heroItems.map((article, idx) => {
                const isActive = idx === heroIndex;
                const img = article.featured_image_url || article.featured_image || article.image || '/api/placeholder/1200/675';
                const articleHref = article.slug ? `/article/${article.slug}` : '#';
                const isNavigable = Boolean(article.slug);
                const displayTitle = article.title?.trim() || 'Untitled story';
                const displayExcerpt = article.excerpt?.trim() || 'Stay tuned for more details as this story develops.';
                return (
                  <div
                    key={`hero-${article.id}`}
                    className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Slide ${idx + 1} of ${heroItems.length}`}
                  >
                    <div className="aspect-[16/7] w-full overflow-hidden">
                      <ProgressiveImage src={img} alt={displayTitle} className="w-full h-full" eager={idx === 0} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
                      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-white/90">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white">
                          {formatCategoryName(article.category?.name || 'General')}
                        </span>
                        <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                        <span>By {article.author?.name || 'Staff'}</span>
                        <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                        <span className="inline-flex items-center">
                          <Clock size={14} className="mr-1" />
                          {article.estimated_read_time || 3} min read
                        </span>
                      </div>
                      {isNavigable ? (
                        <Link
                          to={articleHref}
                          className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded"
                        >
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow group-hover:text-white/90 transition-colors">
                            {displayTitle}
                          </h2>
                        </Link>
                      ) : (
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow">
                          {displayTitle}
                        </h2>
                      )}
                      <p className="hidden sm:block mt-2 text-white/90 max-w-3xl line-clamp-2">{displayExcerpt}</p>
                    </div>
                  </div>
                )
              })}
              {/* Controls */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 pointer-events-none">
                <div className="flex items-center justify-between gap-3 pointer-events-auto">
                  <button
                    type="button"
                    aria-label="Previous slide"
                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    onClick={goToPrevHero}
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <div className="flex items-center gap-2">
                    {heroItems.map((_, i) => {
                      const isDotActive = i === heroIndex;
                      return (
                        <button
                          key={`dot-${i}`}
                          type="button"
                          aria-label={`Go to slide ${i + 1}`}
                          aria-pressed={isDotActive}
                          onClick={() => goToHeroSlide(i)}
                          className={`group relative h-2 overflow-hidden rounded-full transition-all duration-300 ${isDotActive ? 'w-8 bg-white/30' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                        >
                          <span className="sr-only">Slide {i + 1}</span>
                          <span
                            className={`absolute inset-y-0 left-0 bg-white transition-all duration-[7000ms] ease-linear ${heroPlaying && isDotActive ? 'w-full' : 'w-0'}`}
                            aria-hidden="true"
                          />
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={heroPlaying ? 'Pause carousel' : 'Play carousel'}
                      aria-pressed={!heroPlaying}
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                      onClick={() => setHeroPlaying((playing) => !playing)}
                    >
                      {heroPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      aria-label="Next slide"
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                      onClick={goToNextHero}
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-10">
            {(loadingFeatured || loadingLatest) ? (
              <div
                className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 shadow-sm animate-pulse"
                aria-hidden="true"
              />
            ) : (
              <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-dashed border-gray-300 shadow-sm p-6 sm:p-10">
                <div className="max-w-xl space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Highlight your top story</h2>
                  <p className="text-gray-600">Add a featured article or mark a piece as featured to populate this hero area. We'll showcase your most recent headline automatically.</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} className="text-orange-500" aria-hidden="true" />
                    <span>Tip: set at least one article as featured to unlock the carousel experience.</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {/* Ad Slot */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="w-full h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">Ad Placement</div>
        </div>

        {/* Breaking News - styled like reference (headline > image > meta + rule > excerpt) */}
        {breakingItems.length > 0 && (
          <div className="max-w-6xl mx-auto mb-5">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
              {(() => {
                const a = breakingItems[breakingIndex];
                const href = a?.slug ? `/article/${a.slug}` : '#';
                const dateText = new Date(a?.date || a?.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const categoryText = (a?.category?.name || a?.category_name || 'World').toUpperCase();
                const img = a?.featured_image_url || a?.image || a?.featured_image || '/api/placeholder/1200/675';
                return (
                  <div className="block max-w-[640px] mx-auto">
                    {/* Headline - large with underline like reference */}
                    <Link to={href} className="group inline-block mb-4">
                      <h2 className="font-serif font-extrabold tracking-tight text-gray-900 leading-snug text-xl sm:text-2xl underline decoration-gray-900 decoration-1 underline-offset-4">
                        {a?.title || 'Untitled Article'}
                      </h2>
                    </Link>

                    {/* Large image with 16:10 ratio similar to screenshot */}
                    <Link to={href} className="block rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <div className="aspect-[16/9]">
                        <img
                          src={img}
                          alt={a?.title || 'Breaking image'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/api/placeholder/1200/675'; }}
                        />
                      </div>
                    </Link>

                    {/* Meta row */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-gray-700 mb-1">
                      <span className="text-orange-500 font-semibold uppercase">{categoryText}</span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" /> {dateText}
                      </span>
                    </div>
                    {/* Orange divider like the reference */}
                    <div className="w-10 h-0.5 bg-orange-400 mb-2"></div>

                    {/* Excerpt */}
                    {a?.excerpt && (
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-1">
                        {a.excerpt}
                      </p>
                    )}
                  </div>
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
            {/* Category Tabs */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Browse by Category</h3>
                <div className="text-xs text-gray-500">Tap to filter</div>
              </div>
              {loadingCategories ? (
                <div className="flex flex-wrap gap-2">
                  {[1,2,3,4,5,6].map(i => (
                    <span key={`cat-skel-${i}`} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-full text-sm border ${activeCategory==='all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                  >
                    All
                  </button>
                  {popularCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${activeCategory===cat.slug ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {formatCategoryName(cat.name)}
                    </button>
                  ))}
                </div>
              )}
            </section>
            {/* Enhanced Featured Stories Section */}
            <section className="mb-10 sm:mb-12">
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
              ) : displayedFeatured.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Large lead story */}
                    <div className="lg:col-span-8">
                      <ArticleCard
                        key={`featured-${displayedFeatured[0].id}`}
                        article={displayedFeatured[0]}
                        imagePosition={getImagePosition(displayedFeatured[0])}
                        variant="large"
                      />
                    </div>
                    {/* Secondary compact/horizontal list (desktop and up) */}
                    {secondaryFeatured.length > 0 && (
                      <div className="hidden lg:flex lg:col-span-4 lg:flex-col lg:space-y-4">
                        {secondaryFeatured.map((a) => (
                          <ArticleCard
                            key={`featured-${a.id}`}
                            article={a}
                            imagePosition={getImagePosition(a)}
                            variant="horizontal"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {secondaryFeatured.length > 0 && (
                    <div className="mt-6 lg:hidden">
                      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
                        {secondaryFeatured.map((a) => (
                          <div key={`featured-mobile-${a.id}`} className="snap-start shrink-0 w-64">
                            <ArticleCard
                              article={a}
                              imagePosition={getImagePosition(a)}
                              variant="compact"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
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

            {/* Ad Slot */}
            <div className="mb-10">
              <div className="w-full h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">Ad Placement</div>
            </div>

            {/* Enhanced Latest News Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Clock size={28} className="text-blue-500" aria-hidden="true" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Latest News
                </h2>
              </div>
              {liveUpdatesCount > 0 && (
                <div className="mb-4">
                  <button
                    type="button"
                    className="w-full px-4 py-2 rounded-xl bg-green-50 text-green-800 border border-green-200 hover:bg-green-100"
                    onClick={async () => {
                      try {
                        await loadLatestPage(1, activeCategory !== 'all' ? activeCategory : undefined);
                        setLiveUpdatesCount(0);
                      } catch {}
                    }}
                  >
                    {liveUpdatesCount} new article{liveUpdatesCount>1?'s':''} — tap to load
                  </button>
                </div>
              )}
              {loadingLatest && latestList.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <ArticleCardSkeleton key={`latest-skeleton-${i}`} />
                  ))}
                </div>
              ) : errorLatest && latestList.length === 0 ? (
                <ErrorWithRetry 
                  error={errorLatest} 
                  onRetry={retryLatest} 
                  section="latest"
                />
              ) : latestList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {latestList.map((article) => (
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

              {/* Load More / Infinite Scroll Sentinel */}
              <div className="mt-6 flex items-center justify-center">
                {loadingMoreLatest ? (
                  <div className="text-gray-500 text-sm">Loading more…</div>
                ) : latestHasMore ? (
                  <button
                    type="button"
                    onClick={() => loadLatestPage(latestPage + 1, activeCategory !== 'all' ? activeCategory : undefined)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  >
                    Load More
                  </button>
                ) : (
                  <div className="text-gray-500 text-sm">You reached the end</div>
                )}
              </div>
              <div ref={sentinelRef} className="h-1" />
            </section>
          </div>

          
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
