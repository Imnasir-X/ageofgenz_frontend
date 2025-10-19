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
import { RefreshCw, Search, X, TrendingUp, Clock, BookOpen, Pause, Play, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Article, Category } from '../types';

const HERO_ROTATE_INTERVAL = 7000;

type AccentTheme = {
  badge: string;
  divider: string;
  text: string;
};

const BREAKING_ACCENTS: Record<string, AccentTheme> = {
  politics: { badge: 'bg-blue-600', divider: 'bg-blue-600', text: 'text-blue-600' },
  world: { badge: 'bg-emerald-600', divider: 'bg-emerald-600', text: 'text-emerald-600' },
  culture: { badge: 'bg-rose-600', divider: 'bg-rose-600', text: 'text-rose-600' },
  sports: { badge: 'bg-red-600', divider: 'bg-red-600', text: 'text-red-600' },
  business: { badge: 'bg-amber-600', divider: 'bg-amber-600', text: 'text-amber-600' },
  technology: { badge: 'bg-indigo-600', divider: 'bg-indigo-600', text: 'text-indigo-600' },
  science: { badge: 'bg-cyan-600', divider: 'bg-cyan-600', text: 'text-cyan-600' },
  opinion: { badge: 'bg-purple-600', divider: 'bg-purple-600', text: 'text-purple-600' },
  insights: { badge: 'bg-sky-600', divider: 'bg-sky-600', text: 'text-sky-600' },
  default: { badge: 'bg-orange-500', divider: 'bg-orange-400', text: 'text-orange-500' },
};

const getBreakingAccent = (slug?: string | null, name?: string | null): AccentTheme => {
  const key = (slug || name || 'default').toLowerCase();
  return BREAKING_ACCENTS[key] || BREAKING_ACCENTS.default;
};

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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const pullDistanceRef = useRef<number>(0);
  const updatePullDistance = useCallback((value: number) => {
    pullDistanceRef.current = value;
    setPullDistance(value);
  }, []);
  
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
  const [newsletterBannerVisible, setNewsletterBannerVisible] = useState<boolean>(false);
  const [breakingIndex, setBreakingIndex] = useState<number>(0);
  const [breakingPlaying, setBreakingPlaying] = useState<boolean>(true);
  const breakingTimerRef = useRef<number | null>(null);
  const [breakingAnnouncement, setBreakingAnnouncement] = useState<string>('');
  const [breakingVisible, setBreakingVisible] = useState<boolean>(true);
  
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

  const getCategoryButtonClasses = (isActive: boolean) =>
    `inline-flex items-center whitespace-nowrap rounded-full border border-transparent px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 ${
      isActive
        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200/60'
        : 'bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
    }`;

  // Breaking items: prefer latest, fallback to featured
  const breakingItems = useMemo(() => {
    const pool = latestArticles.length > 0 ? latestArticles : featuredArticles;
    return pool.slice(0, 10);
  }, [latestArticles, featuredArticles]);

  // Auto-rotate breaking items every 6s
  useEffect(() => {
    if (breakingTimerRef.current) {
      window.clearInterval(breakingTimerRef.current);
      breakingTimerRef.current = null;
    }

    if (breakingItems.length <= 1 || !breakingPlaying) {
      return () => {
        if (breakingTimerRef.current) {
          window.clearInterval(breakingTimerRef.current);
          breakingTimerRef.current = null;
        }
      };
    }

    breakingTimerRef.current = window.setInterval(() => {
      setBreakingIndex((i) => (i + 1) % breakingItems.length);
    }, 6000);

    return () => {
      if (breakingTimerRef.current) {
        window.clearInterval(breakingTimerRef.current);
        breakingTimerRef.current = null;
      }
    };
  }, [breakingItems.length, breakingPlaying]);

  useEffect(() => {
    setBreakingVisible(false);
    const id = window.setTimeout(() => setBreakingVisible(true), 40);
    return () => window.clearTimeout(id);
  }, [breakingIndex]);

  // Smart image position based on category or content type
  const getImagePosition = useCallback((article: Article): 'top' | 'center' | 'bottom' => {
    const category = article.category?.name?.toLowerCase() || '';
    
    if (category.includes('sport')) return 'center';
    if (category.includes('politic') || category.includes('opinion')) return 'top';
    if (category.includes('meme') || category.includes('culture')) return 'center';
    if (category.includes('world')) return 'center';
    
    return 'center';
  }, []);

  const goToBreakingSlide = useCallback((index: number) => {
    const total = breakingItems.length;
    if (total === 0) return;
    const normalized = ((index % total) + total) % total;
    setBreakingIndex(normalized);
  }, [breakingItems.length]);

  const goToNextBreaking = useCallback(() => {
    if (breakingItems.length === 0) return;
    setBreakingIndex((i) => (i + 1) % breakingItems.length);
  }, [breakingItems.length]);

  const goToPrevBreaking = useCallback(() => {
    if (breakingItems.length === 0) return;
    setBreakingIndex((i) => (i - 1 + breakingItems.length) % breakingItems.length);
  }, [breakingItems.length]);

  const handleBreakingKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (breakingItems.length <= 1) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setBreakingPlaying(false);
      goToNextBreaking();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setBreakingPlaying(false);
      goToPrevBreaking();
    }
  }, [breakingItems.length, goToNextBreaking, goToPrevBreaking]);


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

  type FadeRevealProps = {
    children: React.ReactNode;
    delay?: number;
    className?: string;
  };

  const FadeReveal: React.FC<FadeRevealProps> = ({ children, delay = 0, className }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const node = ref.current;
      if (!node) return;

      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.15, rootMargin: '0px 0px -10%' });

      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const baseClasses = 'transition-all duration-700 ease-out will-change-transform';
    const visibilityClasses = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${visibilityClasses} ${className || ''}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  };

  useEffect(() => {
    if (breakingItems.length === 0) {
      setBreakingAnnouncement('');
      return;
    }
    const current = breakingItems[breakingIndex];
    if (!current) return;
    const categoryName = formatCategoryName(current.category?.name || current.category_name || 'Breaking');
    setBreakingAnnouncement(`${categoryName}: ${current.title || 'Breaking update available'}`);
  }, [breakingItems, breakingIndex]);

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

  const secondaryFeatured = useMemo(() => displayedFeatured.slice(1, 4), [displayedFeatured]);


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
  }, [goToNextHero, goToPrevHero, resetHeroSwipeTracking]);

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

  // Show newsletter card when user reaches 70% scroll or after 30 seconds
  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && localStorage.getItem('newsletterDismissed') === '1';
    const subscribed = typeof window !== 'undefined' && localStorage.getItem('newsletterSubscribed') === '1';
    if (dismissed || subscribed) return;

    let triggered = false;
    const triggerNewsletter = () => {
      if (triggered) return;
      triggered = true;
      setShowNewsletterCard(true);
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight || 1;
      const clientHeight = doc.clientHeight || 1;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      const progress = scrollTop / maxScroll; // 0.0 -> 1.0

      if (progress >= 0.7) {
        triggerNewsletter();
        window.removeEventListener('scroll', onScroll);
      }
    };

    // Initial check in case the user has already scrolled enough
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    const timer = window.setTimeout(() => {
      triggerNewsletter();
      window.removeEventListener('scroll', onScroll);
    }, 30000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!showNewsletterCard) {
      setNewsletterBannerVisible(false);
      return;
    }

    const t = window.setTimeout(() => setNewsletterBannerVisible(true), 40);
    return () => window.clearTimeout(t);
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

  const refreshLatest = useCallback(async () => {
    await loadLatestPage(1, activeCategory !== 'all' ? activeCategory : undefined);
    setLatestPage(1);
    setLiveUpdatesCount(0);
  }, [activeCategory, loadLatestPage]);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    updatePullDistance(0);
    setIsRefreshing(true);
    try {
      await refreshLatest();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshLatest, updatePullDistance]);

  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 0 || loadingLatest || isRefreshing || showSearch) {
        startY = 0;
        return;
      }
      startY = event.touches[0]?.clientY ?? 0;
      updatePullDistance(0);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (startY === 0) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const distance = Math.max(0, currentY - startY);
      if (distance > 0) {
        if (event.cancelable) {
          event.preventDefault();
        }
        updatePullDistance(distance);
      } else {
        updatePullDistance(0);
      }
    };

    const resetPull = () => {
      startY = 0;
      updatePullDistance(0);
    };

    const handleTouchEnd = () => {
      if (startY === 0) return;
      const finalDistance = pullDistanceRef.current;
      resetPull();
      if (finalDistance >= 90) {
        void triggerRefresh();
      }
    };

    const handleTouchCancel = () => {
      if (startY === 0) return;
      resetPull();
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [loadingLatest, isRefreshing, showSearch, triggerRefresh, updatePullDistance]);

  // Observe sentinel for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && latestHasMore && !loadingMoreLatest && !isRefreshing) {
        loadLatestPage(latestPage + 1, activeCategory !== 'all' ? activeCategory : undefined);
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [latestHasMore, loadingMoreLatest, latestPage, activeCategory, loadLatestPage, isRefreshing]);

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

        {/* Breaking News - single featured card */}
        {breakingItems.length > 0 && (() => {
          const current = breakingItems[breakingIndex];
          if (!current) return null;

          const href = current.slug ? `/article/${current.slug}` : '#';
          const dateText = new Date(current.date || current.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const categoryText = (current.category?.name || current.category_name || 'World').toUpperCase();
          const img = current.featured_image_url || current.image || current.featured_image || '/api/placeholder/1200/675';
          const accent = getBreakingAccent(current.category?.slug, current.category?.name);
          const authorName = current.author?.name || 'Staff';

          return (
            <div className="mx-auto mb-5 max-w-6xl px-2 sm:px-4">
              <div
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6"
                role="region"
                aria-roledescription="carousel"
                aria-label="Breaking news headlines"
              >
                <div className="sr-only" aria-live={breakingPlaying ? 'polite' : 'off'} role="status">
                  {breakingAnnouncement}
                </div>
                <div
                  tabIndex={0}
                  onKeyDown={handleBreakingKeyDown}
                  className={`group mx-auto block w-full max-w-[600px] rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all duration-500 will-change-transform ${breakingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                >
                  <Link to={href} className="group inline-block mb-3">
                    <h2 className="font-serif font-extrabold tracking-tight text-gray-900 leading-snug text-xl sm:text-2xl md:text-[28px] underline decoration-gray-900 decoration-1 underline-offset-4 transition-colors group-hover:text-orange-500">
                      {current.title || 'Untitled Article'}
                    </h2>
                  </Link>

                  <Link
                    to={href}
                    className="block overflow-hidden rounded-xl border border-gray-100 bg-gray-100 mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <div className="aspect-[18/9] sm:aspect-[20/9]">
                      <img
                        src={img}
                        alt={current.title || 'Breaking image'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/api/placeholder/1200/675'; }}
                      />
                    </div>
                  </Link>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-500 mb-2">
                    <span className={`${accent.badge} inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white`}>
                      {categoryText}
                    </span>
                    <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
                    <span className="flex items-center gap-1">
                      <Clock size={12} className={accent.text} />
                      {dateText}
                    </span>
                    <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
                    <span>By {authorName}</span>
                    <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />
                    <span>{breakingIndex + 1} of {breakingItems.length}</span>
                  </div>
                  {current.excerpt && (
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {current.excerpt}
                    </p>
                  )}
                </div>
                {breakingItems.length > 1 && (
                  <div className="flex flex-col items-center gap-4 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous breaking story"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        onClick={() => { setBreakingPlaying(false); goToPrevBreaking(); }}
                      >
                        <ChevronLeft size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={breakingPlaying ? 'Pause breaking news rotation' : 'Play breaking news rotation'}
                        aria-pressed={!breakingPlaying}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        onClick={() => setBreakingPlaying((playing) => !playing)}
                      >
                        {breakingPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Next breaking story"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        onClick={() => { setBreakingPlaying(false); goToNextBreaking(); }}
                      >
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {breakingItems.map((_, idx) => {
                        const isActive = idx === breakingIndex;
                        return (
                          <button
                            key={`breaking-dot-${idx}`}
                            type="button"
                            aria-label={`Go to breaking story ${idx + 1}`}
                            aria-pressed={isActive}
                            onClick={() => { setBreakingPlaying(false); goToBreakingSlide(idx); }}
                            className={`h-2 rounded-full transition-all ${isActive ? 'w-8 bg-orange-400' : 'w-2 bg-gray-300 hover:bg-orange-300'}`}
                          >
                            <span className="sr-only">Breaking story {idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Enhanced Search Results Section */}
        <SearchResultsSection />

        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="w-full">
            {/* Category Tabs */}
            <section className="mb-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-gray-800">Browse by Category</h3>
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500">Tap to filter</div>
              </div>
              {loadingCategories ? (
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <span key={`cat-skel-${i}`} className="h-10 w-24 rounded-full bg-gray-200 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="relative -mx-2 overflow-hidden rounded-full bg-orange-50/60 px-2 py-2 shadow-inner">
                  <div className="flex gap-2 overflow-x-auto pb-1 pl-1 pr-4 md:justify-center" role="tablist" aria-label="Article categories">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      aria-pressed={activeCategory === 'all'}
                      className={getCategoryButtonClasses(activeCategory === 'all')}
                    >
                      All
                    </button>
                    {popularCategories.map((cat) => {
                      const isActive = activeCategory === cat.slug;
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => setActiveCategory(cat.slug)}
                          aria-pressed={isActive}
                          className={getCategoryButtonClasses(isActive)}
                        >
                          {formatCategoryName(cat.name)}
                        </button>
                      );
                    })}
                  </div>
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
                      <FadeReveal>
                        <ArticleCard
                          key={`featured-${displayedFeatured[0].id}`}
                          article={displayedFeatured[0]}
                          imagePosition={getImagePosition(displayedFeatured[0])}
                          variant="large"
                        />
                      </FadeReveal>
                    </div>
                    {/* Secondary sidebar-styled list (desktop and up) */}
                    {secondaryFeatured.length > 0 && (
                      <div className="hidden lg:block lg:col-span-4">
                        <div className="flex flex-col gap-3">
                          {secondaryFeatured.slice(0, 3).map((a, idx) => (
                            <FadeReveal key={`featured-${a.id}`} delay={120 + idx * 60}>
                              <ArticleCard
                                article={a}
                                imagePosition={getImagePosition(a)}
                                variant="sidebarLarge"
                              />
                            </FadeReveal>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {secondaryFeatured.length > 0 && (
                    <div className="mt-6 lg:hidden">
                      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
                        {secondaryFeatured.slice(0, 3).map((a, idx) => (
                          <div key={`featured-mobile-${a.id}`} className="snap-start shrink-0 w-64">
                            <FadeReveal delay={idx * 80} className="h-full">
                              <ArticleCard
                                article={a}
                                imagePosition={getImagePosition(a)}
                                variant="compact"
                              />
                            </FadeReveal>
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={() => { void triggerRefresh(); }}
                    disabled={isRefreshing}
                    aria-live="polite"
                    aria-busy={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Refreshing latest stories...
                      </>
                    ) : (
                      <>
                        {liveUpdatesCount} new article{liveUpdatesCount>1?'s':''} - tap to load
                      </>
                    )}
                  </button>
                </div>
              )}
              {(isRefreshing || pullDistance > 0) && (
                <div className="mb-4 flex items-center justify-center text-xs text-gray-500 sm:hidden">
                  <Loader2
                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-500' : pullDistance > 90 ? 'text-blue-500' : 'text-gray-300'} transition-colors`}
                    aria-hidden="true"
                  />
                  <span>
                    {isRefreshing
                      ? 'Refreshing latest stories...'
                      : pullDistance > 90
                        ? 'Release to refresh'
                        : 'Pull down to refresh'}
                  </span>
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
              <div className="relative mt-8 h-16 sm:h-12">
                <div className="pointer-events-none sticky bottom-6 flex justify-center">
                  <div className="pointer-events-auto">
                    {loadingMoreLatest ? (
                      <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-600 shadow-md backdrop-blur">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Loading more stories...
                      </div>
                    ) : latestHasMore ? (
                      <button
                        type="button"
                        onClick={() => loadLatestPage(latestPage + 1, activeCategory !== 'all' ? activeCategory : undefined)}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                        disabled={isRefreshing}
                        aria-label="Load more latest stories"
                      >
                        Load more stories
                        <ChevronRight className="h-4 w-4 text-white/70" aria-hidden="true" />
                      </button>
                    ) : (
                      <div className="rounded-full bg-white/90 px-4 py-2 text-sm text-gray-500 shadow-sm backdrop-blur">
                        You reached the end
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div ref={sentinelRef} className="h-1" />
            </section>
          </div>

          
        </div>
      </div>

      {showNewsletterCard && !showSearch && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] px-3 sm:px-4">
          <div
            className={`pointer-events-auto relative mx-auto max-w-4xl rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-2xl backdrop-blur transition-all duration-500 ease-out ${newsletterBannerVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            role="region"
            aria-label="Newsletter signup"
          >
            <button
              type="button"
              aria-label="Dismiss newsletter prompt"
              className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:text-gray-800"
              onClick={() => {
                localStorage.setItem('newsletterDismissed', '1');
                setShowNewsletterCard(false);
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Newsletter</p>
                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Stay a step ahead of the headlines</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Get the latest stories, breaking alerts, and weekend reads delivered straight to your inbox.
                </p>
              </div>
              <div className="w-full sm:w-auto [&>div]:border-none [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none">
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
