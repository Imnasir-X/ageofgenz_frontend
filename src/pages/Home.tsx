import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  getFeaturedArticles,
  getArticlesBySearch,
  getCategories,
  getArticles,
  getArticlesByCategory,
} from '../utils/api';
import type { Article, Category } from '../types';
import { buildHomeCategories, resolveCategoryMeta } from '../utils/categoryHelpers';
import type { CategoryMeta } from '../utils/categoryHelpers';
import HeroSection from '../components/home/HeroSection';
import BreakingTicker from '../components/home/BreakingTicker';
import SearchResultsSection from '../components/home/SearchResultsSection';
import CategoryTabs from '../components/home/CategoryTabs';
import FeaturedStoriesSection from '../components/home/FeaturedStoriesSection';
import LatestNewsSection from '../components/home/LatestNewsSection';
import NewsletterPrompt from '../components/home/NewsletterPrompt';

type HomeCategoryEntry = {
  slug: string;
  name: string;
  topLevelSlug: string;
  topLevelName: string;
  isLegacy: boolean;
  source: Category;
};

const getArticleKey = (article: Article): string | null => {
  if (article?.id !== null && article?.id !== undefined) return `id:${article.id}`;
  if (article?.slug) return `slug:${article.slug}`;
  if (article?.canonical_url) return `url:${article.canonical_url}`;
  return null;
};

const dedupeArticles = (articles: Article[]): Article[] => {
  const seen = new Set<string>();
  const deduped: Article[] = [];

  articles.forEach((article) => {
    const key = getArticleKey(article);
    if (key) {
      if (seen.has(key)) return;
      seen.add(key);
    }
    deduped.push(article);
  });

  return deduped;
};

const buildKeySet = (articles: Article[]): Set<string> => {
  const keys = new Set<string>();
  articles.forEach((article) => {
    const key = getArticleKey(article);
    if (key) keys.add(key);
  });
  return keys;
};

const Home: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [allLatestList, setAllLatestList] = useState<Article[]>([]);
  
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [rawCategoryData, setRawCategoryData] = useState<Category[] | null>(null);
  const [usingFallbackCategories, setUsingFallbackCategories] = useState<boolean>(true);
  const popularCategories = useMemo(
    () => buildHomeCategories(rawCategoryData ?? undefined),
    [rawCategoryData],
  );
  const homeCategories = useMemo<HomeCategoryEntry[]>(() => {
    const seen = new Set<string>();
    const entries: HomeCategoryEntry[] = [];

    popularCategories.forEach((category) => {
      if (!category || !category.slug) {
        return;
      }
      const meta = resolveCategoryMeta(category);
      if (seen.has(meta.slug)) {
        return;
      }
      seen.add(meta.slug);
      entries.push({
        slug: meta.slug,
        name: meta.name,
        topLevelSlug: meta.topLevelSlug,
        topLevelName: meta.topLevelName,
        isLegacy: meta.isLegacy,
        source: category,
      });
    });

    return entries;
  }, [popularCategories]);
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
  const [loadingLatest, setLoadingLatest] = useState<boolean>(false);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  
  const [errorFeatured, setErrorFeatured] = useState<string | null>(null);
  const [errorLatest, setErrorLatest] = useState<string | null>(null);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  
  
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewsletterCard, setShowNewsletterCard] = useState<boolean>(false);
  const [newsletterBannerVisible, setNewsletterBannerVisible] = useState<boolean>(false);
  

  const tabListId = 'home-category-tabs';
  const tabPanelId = 'home-category-tabpanel';
  const getTabId = useCallback((slug: string) => `home-category-tab-${slug}`, []);
  const activeTabId = getTabId(activeCategory);
  const tabOrder = useMemo(
    () => ['all', ...homeCategories.map((cat) => cat.slug)],
    [homeCategories],
  );
  const getArticleCategoryMeta = useCallback(
    (article: Article): CategoryMeta =>
      resolveCategoryMeta(
        article?.category
          ? {
              slug: article.category.slug,
              name: article.category.name,
              parent_slug: article.category.parent_slug ?? null,
            }
          : { name: article?.category_name },
      ),
    [],
  );
  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, currentSlug: string) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const currentIndex = tabOrder.indexOf(currentSlug);
      if (currentIndex === -1) return;
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabOrder.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else {
        nextIndex = tabOrder.length - 1;
      }
      const nextSlug = tabOrder[nextIndex];
      setActiveCategory(nextSlug);
      if (typeof document !== 'undefined') {
        const nextTab = document.getElementById(getTabId(nextSlug));
        nextTab?.focus();
      }
    },
    [getTabId, setActiveCategory, tabOrder],
  );

  useEffect(() => {
    if (activeCategory === 'all') return;
    if (!homeCategories.some((cat) => cat.slug === activeCategory)) {
      setActiveCategory('all');
    }
  }, [activeCategory, homeCategories]);

  const getCategoryButtonClasses = (isActive: boolean) =>
    `inline-flex items-center whitespace-nowrap rounded-full border border-transparent px-4 py-2 text-sm font-medium cursor-pointer transition-colors transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 ${
      isActive
        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200/60 -translate-y-0.5'
        : 'bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:-translate-y-0.5 hover:shadow-md active:scale-95'
    }`;

  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === 'all') return null;
    const match = homeCategories.find((cat) => cat.slug === activeCategory);
    if (match?.name) {
      return match.name;
    }
    const meta = resolveCategoryMeta({ slug: activeCategory });
    return meta.name;
  }, [activeCategory, homeCategories]);

  const allocationPool = useMemo(
    () => dedupeArticles([...allLatestList, ...featuredArticles]),
    [allLatestList, featuredArticles],
  );

  // Smart image position based on category or content type
  const getImagePosition = useCallback((article: Article): 'top' | 'center' | 'bottom' => {
    const category = article.category?.name?.toLowerCase() || '';
    
    if (category.includes('sport')) return 'center';
    if (category.includes('politic') || category.includes('opinion')) return 'top';
    if (category.includes('meme') || category.includes('culture')) return 'center';
    if (category.includes('world') || category.includes('global')) return 'center';
    
    return 'center';
  }, []);

  const heroItems = useMemo(() => allocationPool.slice(0, 5), [allocationPool]);

  const heroKeys = useMemo(() => buildKeySet(heroItems), [heroItems]);

  const breakingCandidates = useMemo(
    () =>
      allocationPool.filter((article) => {
        const key = getArticleKey(article);
        return !key || !heroKeys.has(key);
      }),
    [allocationPool, heroKeys],
  );

  const breakingItems = useMemo(() => breakingCandidates.slice(0, 10), [breakingCandidates]);

  const breakingKeys = useMemo(() => buildKeySet(breakingItems), [breakingItems]);

  const featuredCandidates = useMemo(() => {
    if (activeCategory === 'all') return featuredArticles;
    return featuredArticles.filter((article) => {
      const meta = getArticleCategoryMeta(article);
      return meta.slug === activeCategory || meta.topLevelSlug === activeCategory;
    });
  }, [featuredArticles, activeCategory, getArticleCategoryMeta]);

  const displayedFeatured = useMemo(() => {
    if (featuredCandidates.length === 0) return [];
    if (heroKeys.size === 0 && breakingKeys.size === 0) {
      return featuredCandidates;
    }
    return featuredCandidates.filter((article) => {
      const key = getArticleKey(article);
      return !key || (!heroKeys.has(key) && !breakingKeys.has(key));
    });
  }, [featuredCandidates, heroKeys, breakingKeys]);

  const secondaryFeatured = useMemo(() => displayedFeatured.slice(1, 4), [displayedFeatured]);

  const featuredKeys = useMemo(() => buildKeySet(displayedFeatured), [displayedFeatured]);

  const reservedKeys = useMemo(() => {
    const keys = new Set<string>();
    heroKeys.forEach((key) => keys.add(key));
    breakingKeys.forEach((key) => keys.add(key));
    featuredKeys.forEach((key) => keys.add(key));
    return keys;
  }, [heroKeys, breakingKeys, featuredKeys]);

  const displayLatest = useMemo(() => {
    if (reservedKeys.size === 0) return latestList;
    return latestList.filter((article) => {
      const key = getArticleKey(article);
      return !key || !reservedKeys.has(key);
    });
  }, [latestList, reservedKeys]);



  // Data fetching effects (same as before but with better error handling)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        console.log('?? Fetching popular categories...');
        const response = await getCategories({ flat: true });
        console.log('Categories Response:', response.data);
        const categories = Array.isArray(response.data) ? (response.data as Category[]) : [];
        setRawCategoryData(categories);
        setUsingFallbackCategories(categories.length === 0);
      } catch (err) {
        console.error('Categories Error:', err);
        console.warn('Using fallback category list due to API error.');
        if (typeof window !== 'undefined') {
          const sentry = (window as typeof window & {
            Sentry?: { captureException?: (error: unknown) => void };
          }).Sentry;
          sentry?.captureException?.(err);
        }
        setRawCategoryData(null);
        setUsingFallbackCategories(true);
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
        console.log('?? Fetching featured articles...');
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

    // Load all in parallel for better perceived performance
    void Promise.allSettled([
      fetchCategories(),
      fetchFeaturedArticles(),
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
    const dismissedAtRaw = typeof window !== 'undefined' ? localStorage.getItem('newsletterDismissedAt') : null;
    const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0;
    const cooldownMs = 7 * 24 * 60 * 60 * 1000;
    const withinCooldown = dismissedAt > 0 && Date.now() - dismissedAt < cooldownMs;
    if (dismissed || subscribed) return;
    if (withinCooldown) return;

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

  // Load a page for infinite scroll (all or by category)
  const loadLatestPage = useCallback(async (page: number, categorySlug?: string) => {
    if (page === 1) {
      setLoadingLatest(true);
      setLoadingMoreLatest(false);
      setErrorLatest(null);
    } else {
      setLoadingMoreLatest(true);
    }
    try {
      let response;
      if (categorySlug && categorySlug !== 'all') {
        response = await getArticlesByCategory(categorySlug, page);
      } else {
        response = await getArticles(page);
      }
      const results = response.data.results || [];
      setLatestList((prev) => (page === 1 ? results : [...prev, ...results]));
      if (page === 1 && (!categorySlug || categorySlug === 'all')) {
        setAllLatestList(results);
      }
      setLatestHasMore(Boolean(response.data.next));
      setLatestPage(page);
    } catch (err: any) {
      console.error('Load latest page error:', err);
      if (page === 1) {
        setErrorLatest(`Failed to load latest articles: ${err.response?.data?.detail || err.message}`);
      }
      setLatestHasMore(false);
    } finally {
      if (page === 1) {
        setLoadingLatest(false);
      } else {
        setLoadingMoreLatest(false);
      }
    }
  }, []);

  const retryLatest = useCallback(async () => {
    await loadLatestPage(1, activeCategory !== 'all' ? activeCategory : undefined);
  }, [activeCategory, loadLatestPage]);

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
      console.log('?? Searching for:', query);
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

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
    setErrorSearch(null);
  }, []);

  const handleRetrySearch = useCallback(() => {
    void handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Compact Header Section */}
        

        {/* Hero Carousel */}
        <HeroSection
          items={heroItems}
          isLoading={loadingFeatured || loadingLatest}
          getArticleCategoryMeta={getArticleCategoryMeta}
        />

        {/* Ad Slot */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="w-full h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-700 text-sm">Ad Placement</div>
        </div>

        {/* Breaking News - single featured card */}
        <BreakingTicker items={breakingItems} getArticleCategoryMeta={getArticleCategoryMeta} />

        {/* Enhanced Search Results Section */}
        <SearchResultsSection
          showSearch={showSearch}
          loadingSearch={loadingSearch}
          errorSearch={errorSearch}
          searchResults={searchResults}
          searchQuery={searchQuery}
          onClose={handleCloseSearch}
          onRetry={handleRetrySearch}
          getImagePosition={getImagePosition}
        />

        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="w-full">
            {/* Category Tabs */}
            <CategoryTabs
              loading={loadingCategories}
              categories={homeCategories}
              usingFallbackCategories={usingFallbackCategories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onTabKeyDown={handleTabKeyDown}
              getTabId={getTabId}
              tabListId={tabListId}
              tabPanelId={tabPanelId}
              getCategoryButtonClasses={getCategoryButtonClasses}
            />

            {/* Enhanced Featured Stories Section */}
            <FeaturedStoriesSection
              loading={loadingFeatured}
              error={errorFeatured}
              displayedFeatured={displayedFeatured}
              secondaryFeatured={secondaryFeatured}
              activeCategory={activeCategory}
              activeCategoryLabel={activeCategoryLabel}
              getImagePosition={getImagePosition}
              onRetry={retryFeatured}
            />

            {/* Ad Slot */}
            <div className="mb-10">
              <div className="w-full h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-700 text-sm">
                Ad Placement
              </div>
            </div>

            {/* Enhanced Latest News Section */}
            <LatestNewsSection
              latestList={displayLatest}
              loading={loadingLatest}
              error={errorLatest}
              liveUpdatesCount={liveUpdatesCount}
              isRefreshing={isRefreshing}
              pullDistance={pullDistance}
              loadingMore={loadingMoreLatest}
              latestHasMore={latestHasMore}
              latestPage={latestPage}
              activeCategory={activeCategory}
              activeCategoryLabel={activeCategoryLabel}
              onLoadMore={loadLatestPage}
              onTriggerRefresh={triggerRefresh}
              onRetry={retryLatest}
              sentinelRef={sentinelRef}
              getImagePosition={getImagePosition}
              activeTabId={activeTabId}
              tabPanelId={tabPanelId}
            />
          </div>

          
        </div>
      </div>

      <NewsletterPrompt
        showNewsletterCard={showNewsletterCard && !showSearch}
        newsletterBannerVisible={newsletterBannerVisible}
        onDismiss={() => {
          localStorage.setItem('newsletterDismissed', '1');
          setShowNewsletterCard(false);
        }}
        onSubscribed={() => {
          localStorage.setItem('newsletterSubscribed', '1');
          setShowNewsletterCard(false);
        }}
      />
    </div>
  );
};

export default Home;


