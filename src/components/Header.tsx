import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search as SearchIcon, X } from 'lucide-react';
import { getArticlesBySearch, getLatestArticles } from '../utils/api';
// ✅ REMOVED: import Logo from '../assets/images/logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // desktop mega menu key
  const [isCompact, setIsCompact] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const [shrink, setShrink] = useState(0); // 0 (full) → 1 (compact)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true));

  // Search state (header search)
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; title: string; slug: string; image?: string; date?: string; category?: string }>>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchBoxRef = useRef<HTMLLIElement | null>(null);
  const recentKey = 'recentSearches';
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  useEffect(() => {
    if (!showSearch) return;
    setLoadingRecent(true);
    try {
      const raw = localStorage.getItem(recentKey);
      setRecentSearches(raw ? JSON.parse(raw) : []);
    } catch {
      setRecentSearches([]);
    } finally {
      setLoadingRecent(false);
    }
  }, [showSearch]);
  const trendingSearches = ['AI', 'Elections', 'World', 'Sports', 'Opinion'];

  // Breaking news banner
  const [breakingNews, setBreakingNews] = useState<{ title: string; slug: string } | null>(null);
  const [breakingDismissed, setBreakingDismissed] = useState(false);
  const [breakingError, setBreakingError] = useState(false);
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    let mounted = true;
    const fetchBreaking = async () => {
      try {
        const res = await getLatestArticles();
        const items = res.data?.results || [];
        if (!mounted) return;
        if (items.length > 0) {
          const first = items[0];
          setBreakingNews({ title: first.title || 'Breaking news', slug: first.slug });
          // live indicator
          const hasLive = items.some((a: any) => a.is_live || a.live);
          setIsLive(!!hasLive);
          setBreakingError(false);
        }
      } catch {
        if (mounted) {
          setBreakingNews(null);
          setBreakingError(true);
        }
      }
    };
    fetchBreaking();
    const interval = window.setInterval(fetchBreaking, 30000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  // Log breaking fetch errors without showing a UI error
  useEffect(() => {
    if (breakingError) {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch breaking news');
    }
  }, [breakingError]);

  // Preferences + viewport listeners
  useEffect(() => {
    const mqlReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqlDesktop = window.matchMedia('(min-width: 768px)');
    const onReduced = () => setPrefersReducedMotion(!!mqlReduced.matches);
    const onDesktop = () => setIsDesktop(!!mqlDesktop.matches);
    onReduced();
    onDesktop();
    mqlReduced.addEventListener?.('change', onReduced);
    mqlDesktop.addEventListener?.('change', onDesktop);
    return () => {
      mqlReduced.removeEventListener?.('change', onReduced);
      mqlDesktop.removeEventListener?.('change', onDesktop);
    };
  }, []);

  // Compact mode on scroll (always sticky; no hide) + smooth shrink factor (rAF)
  useEffect(() => {
    let rafId: number | null = null;
    const handle = () => {
      rafId = null;
      const y = window.scrollY || 0;
      const start = 0;
      const end = isDesktop ? 140 : 100; // mobile-specific threshold
      const s = Math.max(0, Math.min(1, (y - start) / (end - start)));
      setShrink(s);
      setIsCompact(y > 80);
      setHasShadow(y > 0);
    };
    const onScroll = () => {
      if (rafId == null) rafId = window.requestAnimationFrame(handle);
    };
    window.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    handle();
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDesktop]);

  // Close mega menu when leaving header area
  const closeMenus = () => setOpenMenu(null);

  // Debounced suggestions
  const suggestTimeoutRef = useRef<number | undefined>(undefined);
  const suggestSeqRef = useRef(0);
  useEffect(() => {
    if (!showSearch) return;
    const q = query.trim();
    if (q.length < 2) {
      if (suggestTimeoutRef.current) window.clearTimeout(suggestTimeoutRef.current);
      setSuggestions([]);
      setLoadingSuggest(false);
      return;
    }
    setLoadingSuggest(true);
    const seq = ++suggestSeqRef.current;
    if (suggestTimeoutRef.current) window.clearTimeout(suggestTimeoutRef.current);
    suggestTimeoutRef.current = window.setTimeout(async () => {
      try {
        const res = await getArticlesBySearch(q);
        if (seq !== suggestSeqRef.current) return;
        const results = (res.data?.results || []).slice(0, 6).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          image: a.thumbnail || a.image || a.featured_image || a.cover_image || undefined,
          date: a.published_at || a.date || a.created_at || undefined,
          category: (a.category && (a.category.name || a.category.title)) || a.section || (a.topic && a.topic.name) || undefined,
        }));
        setSuggestions(results);
      } catch {
        if (seq === suggestSeqRef.current) setSuggestions([]);
      } finally {
        if (seq === suggestSeqRef.current) setLoadingSuggest(false);
      }
    }, 350);
    return () => {
      if (suggestTimeoutRef.current) window.clearTimeout(suggestTimeoutRef.current);
    };
  }, [query, showSearch]);

  // Click outside to close search dropdown
  useEffect(() => {
    if (!showSearch) return;
    const onClick = (e: MouseEvent) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showSearch]);

  // Desktop nav link styles - responsive to compact state
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `transition-colors ${prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out'} font-semibold text-sm uppercase tracking-wide ${isActive ? 'text-orange-500' : 'text-white'} hover:text-orange-500`;

  // Mobile nav link styles - with explicit colors
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `block py-2 px-3 text-sm ${isActive ? 'text-orange-500 font-semibold bg-gray-800 rounded' : 'text-white'} hover:text-orange-500 hover:bg-gray-800 rounded transition-all duration-200`;

  // Delayed close for mega menus
  const closeMenuDelayed = useRef<number | undefined>(undefined);
  const handleMouseLeave = () => {
    closeMenuDelayed.current = window.setTimeout(closeMenus, 200);
  };
  const handleMouseEnter = () => {
    if (closeMenuDelayed.current) window.clearTimeout(closeMenuDelayed.current);
  };

  // Keyboard access for mega menus
  const onMegaKeyDown = (menuKey: string, containerId: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpenMenu(null);
    }
    if (e.key === 'ArrowDown') {
      setOpenMenu(menuKey);
      const el = document.getElementById(containerId);
      const first = el?.querySelector('a, button') as HTMLElement | null;
      first?.focus();
      e.preventDefault();
    }
  };

  // Focus trap for mobile menu
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isMenuOpen) return;
    const container = mobileNavRef.current;
    if (!container) return;
    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>('a, button, select, input, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hasAttribute('disabled') && !el.hasAttribute('hidden'));
    let focusableList = getFocusable();
    (focusableList[0] || container).focus();
    const observer = new MutationObserver(() => { focusableList = getFocusable(); });
    observer.observe(container, { childList: true, subtree: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusableList;
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { (last as HTMLElement)?.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { (first as HTMLElement)?.focus(); e.preventDefault(); }
      }
    };
    container.addEventListener('keydown', onKeyDown);
    return () => { container.removeEventListener('keydown', onKeyDown); observer.disconnect(); };
  }, [isMenuOpen]);

  return (
    <>
      {breakingNews && !breakingDismissed && (
        <div className="sticky top-0 z-[60] relative bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white px-4 py-2 text-sm font-medium overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                BREAKING
              </span>
              <span className="line-clamp-1 animate-text-slide">{breakingNews.title}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to={`/article/${breakingNews.slug}`} className="text-white underline hover:text-gray-200 text-xs whitespace-nowrap">
                Read more →
              </Link>
              <button
                onClick={() => setBreakingDismissed(true)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Dismiss breaking news"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <header
        className={`header-nav sticky top-0 z-[55] text-white font-sans ${hasShadow ? 'shadow-md' : ''} ${prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out'} transition-[padding,transform,background-color,backdrop-filter] bg-black backdrop-blur-md`}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {/* Top bar (date + socials) - continuous fade/compress on desktop */}
        <div
          className="hidden md:flex items-center justify-between px-4 border-b text-xs text-gray-300 transition-[opacity,max-height,padding]"
          style={{
            opacity: 1 - shrink,
            paddingTop: `${4 * (1 - shrink)}px`,
            paddingBottom: `${4 * (1 - shrink)}px`,
            maxHeight: `${28 * (1 - shrink)}px`,
            borderColor: `rgba(31,41,55,${1 - shrink})`,
            overflow: 'hidden',
            transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
            transitionTimingFunction: 'ease-out',
          }}
        >
          <div className="text-xs uppercase tracking-wider font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
            {isLive ? ' • LIVE' : ''}
          </div>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.75 2.25h2.25a5.25 5.25 0 005.25 5.25v2.25a7.5 7.5 0 01-5.25-2.25v6.939a4.689 4.689 0 11-4.5-4.689v2.295a2.25 2.25 0 102.25 2.25V2.25z" />
              </svg>
            </a>
          </div>
        </div>
        <div
          className={`container mx-auto px-4 ${prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out'} transition-all`}
          style={{ paddingTop: 16 - 12 * shrink, paddingBottom: 16 - 12 * shrink }}
        >
          <div className="flex justify-between items-center">
          {/* Logo and Title - Force white text */}
          <Link to="/" className="flex items-center space-x-2">
            {/* ✅ FIXED: Use public folder logo with cache-busting */}
            <img
              src="/logo.png?v=2025"
              alt="The Age Of GenZ - Home"
              className={`${isCompact ? 'h-6 md:h-8' : 'h-12 md:h-14'} w-auto transition-transform ${prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out'}`}
              style={{
                transform: `scale(${isDesktop ? 1 - 0.7 * shrink : 1 - 0.55 * shrink})`, // min 0.30 desktop, ~0.45 mobile
                transformOrigin: 'left center',
              }}
            />
            <span
              className={`${isCompact ? 'text-lg md:text-xl' : 'text-3xl md:text-4xl'} font-bold tracking-normal leading-tight font-serif text-white transition-transform ${prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out'}`}
              style={{
                transform: `scale(${isDesktop ? 1 - 0.8 * shrink : 1 - 0.65 * shrink})`, // min 0.20 desktop, ~0.35 mobile
                transformOrigin: 'left center',
              }}
            >
              The Age of GenZ
            </span>
            <span
              className={`hidden lg:inline ml-4 text-gray-500 font-light transition-opacity ${prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out'} text-xs tracking-wider`}
              style={{ opacity: 1 - shrink }}
            >
              EST. 2025 • GEN Z NEWS
            </span>
          </Link>

          {/* Desktop Navigation - Force styles to prevent conflicts */}
          <nav className="hidden lg:block header-desktop-nav">
            <ul
              className={`flex items-center transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out'}`}
              style={{ gap: `${(isDesktop ? 12 : 10) + ((isDesktop ? 20 : 14) - (isDesktop ? 12 : 10)) * (1 - shrink)}px` }}
            >
              <li><NavLink to="/home" className={navLinkClasses}>Latest</NavLink></li>
              <li><NavLink to="/trending" className={navLinkClasses}>Trending</NavLink></li>
              {isLive && (
                <li className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 rounded-md border border-red-600/20">
                  <div className="relative flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <Link to="/live" className="text-red-500 font-bold text-xs uppercase">
                    Live Coverage
                  </Link>
                </li>
              )}
              <li><NavLink to="/ai" className={navLinkClasses}>Tech</NavLink></li>
              <li><NavLink to="/opinion" className={navLinkClasses}>Opinion</NavLink></li>
              {/* World Mega Menu */}
              <li className="relative" onMouseEnter={() => setOpenMenu('world')}>
                <button
                  type="button"
                  className={`${navLinkClasses({ isActive: false })} inline-flex items-center gap-1`}
                  aria-haspopup="true"
                  aria-expanded={openMenu==='world'}
                  onClick={() => setOpenMenu(openMenu === 'world' ? null : 'world')}
                  onKeyDown={onMegaKeyDown('world', 'mega-world')}
                >
                  Global <ChevronDown size={14} />
                </button>
                {openMenu === 'world' && (
                    <div id="mega-world" className="absolute left-0 mt-2 w-72 rounded-lg border border-gray-800 bg-gray-900/95 text-gray-100 shadow-xl backdrop-blur-md p-3 flex flex-col gap-1 z-50">
                    {[
                      { label: 'Europe', to: '/category/europe' },
                      { label: 'Asia', to: '/category/asia' },
                      { label: 'Middle East', to: '/category/middle-east' },
                      { label: 'Africa', to: '/category/africa' },
                      { label: 'Americas', to: '/category/americas' },
                      { label: 'Australia', to: '/category/australia' },
                    ].map((item) => (
                        <NavLink key={item.label} to={item.to} className={({ isActive }) => `block px-3 py-1.5 rounded text-sm leading-snug transition-colors duration-150 hover:bg-gray-800 ${isActive ? 'text-orange-400 font-semibold' : 'text-gray-200'}`}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </li>
              {/* Politics Mega Menu */}
              <li className="relative" onMouseEnter={() => setOpenMenu('politics')}>
                <button
                  type="button"
                  className={`${navLinkClasses({ isActive: false })} inline-flex items-center gap-1`}
                  aria-haspopup="true"
                  aria-expanded={openMenu==='politics'}
                  onClick={() => setOpenMenu(openMenu === 'politics' ? null : 'politics')}
                  onKeyDown={onMegaKeyDown('politics', 'mega-politics')}
                >
                  Politics <ChevronDown size={14} />
                </button>
                {openMenu === 'politics' && (
                    <div id="mega-politics" className="absolute left-0 mt-2 w-72 rounded-lg border border-gray-800 bg-gray-900/95 text-gray-100 shadow-xl backdrop-blur-md p-3 flex flex-col gap-1 z-50">
                    {[
                      { label: 'U.S. Politics', to: '/politics' },
                      { label: 'World Politics', to: '/world' },
                      { label: 'Elections', to: '/category/elections' },
                      { label: 'Congress', to: '/category/congress' },
                      { label: 'Supreme Court', to: '/category/supreme-court' },
                      { label: 'Opinion', to: '/opinion' },
                    ].map((item) => (
                        <NavLink key={item.label} to={item.to} className={({ isActive }) => `block px-3 py-1.5 rounded text-sm leading-snug transition-colors duration-150 hover:bg-gray-800 ${isActive ? 'text-orange-400 font-semibold' : 'text-gray-200'}`}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </li>

              <li>
                <NavLink
                  to="/subscribe"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Subscribe
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </NavLink>
              </li>
              {/* Search icon + expandable */}
              <li className="relative" ref={searchBoxRef}>
                <button
                  type="button"
                  className="ml-2 p-2 rounded-md text-white hover:text-orange-500 hover:bg-gray-800 transition-colors"
                  aria-label="Search"
                  onClick={() => { setShowSearch((s) => !s); setShowSuggest(true); }}
                >
                  {showSearch ? <X size={18} /> : <SearchIcon size={18} />}
                </button>
                {showSearch && (
                    <div className="absolute right-0 mt-2 w-[480px] rounded-lg border border-gray-800 bg-gray-900/95 text-gray-100 shadow-2xl backdrop-blur-md p-3 z-50">
                    <div className="flex items-center gap-2">
                      <SearchIcon size={16} className="text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={query}
                          onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
                        aria-label="Search articles"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && query.trim()) {
                            const q = query.trim();
                            const next = [q, ...recentSearches.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
                            localStorage.setItem(recentKey, JSON.stringify(next));
                            navigate(`/search?q=${encodeURIComponent(q)}`);
                            setShowSuggest(false);
                            setShowSearch(false);
                          }
                        }}
                          placeholder="Search articles…"
                          className="flex-1 outline-none bg-transparent text-sm placeholder:text-gray-400 text-gray-100"
                        />
                        {query && (
                          <button
                            className="px-2 py-1 rounded text-gray-400 hover:text-white text-xs transition-colors"
                            aria-label="Clear search"
                            onClick={() => { setQuery(''); setShowSuggest(true); }}
                          >
                          Clear
                        </button>
                      )}
                      <button
                        className="px-2 py-1 rounded bg-orange-500 text-white text-xs hover:bg-orange-600"
                        onClick={() => {
                          if (!query.trim()) return;
                          const q = query.trim();
                          const next = [q, ...recentSearches.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
                          localStorage.setItem(recentKey, JSON.stringify(next));
                          navigate(`/search?q=${encodeURIComponent(q)}`);
                          setShowSuggest(false);
                          setShowSearch(false);
                        }}
                      >
                        Search
                      </button>
                    </div>
                    {showSuggest && (
                      <div className="mt-3">
                        {query.trim().length >= 2 ? (
                          <div>
                            <div className="text-xs text-white/70 mb-2">Suggestions</div>
                            {loadingSuggest ? (
                              <div className="text-sm text-white/70">Searching…</div>
                            ) : suggestions.length > 0 ? (
                              <ul className="divide-y divide-white/10">
                                {suggestions.map((s) => (
                                  <li key={s.id}>
                                    <button
                                      className="w-full text-left px-2 py-2 rounded text-sm text-gray-100 flex items-start gap-3 hover:bg-gray-800 transition-colors"
                                      onClick={() => { navigate(`/article/${s.slug}`); setShowSuggest(false); setShowSearch(false); }}
                                    >
                                      {s.image && (
                                        <img src={s.image} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium line-clamp-2 mb-1">{s.title}</div>
                                        {(s.category || s.date) && (
                                            <div className="flex items-center gap-2 text-xs text-white/70">
                                              {s.category && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-200 font-medium">
                                                  {s.category}
                                                </span>
                                              )}
                                            {s.date && (
                                              <span>{new Date(s.date).toLocaleDateString()}</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-white/70">No results</div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-white/70 mb-2">Recent searches</div>
                              {loadingRecent ? (
                                <div className="text-sm text-white/70">Loading…</div>
                              ) : recentSearches.length === 0 ? (
                                  <div className="text-sm text-white/70">No recent searches</div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {recentSearches.map((r) => (
                                    <button key={r} className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors" onClick={() => { navigate(`/search?q=${encodeURIComponent(r)}`); setShowSuggest(false); setShowSearch(false); }}>
                                      {r}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                                <div className="text-xs text-white/70 mb-2">Trending</div>
                              <div className="flex flex-wrap gap-2">
                                  {trendingSearches.map((t) => (
                                    <button key={t} className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-colors" onClick={() => { navigate(`/search?q=${encodeURIComponent(t)}`); setShowSuggest(false); setShowSearch(false); }}>
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button - Force white color */}
          <button
            className="lg:hidden p-2 text-white hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Force black background and white text */}
        {isMenuOpen && (
          <nav ref={mobileNavRef} className="lg:hidden pt-3 pb-3 border-t border-gray-800 bg-black text-white header-mobile-nav" aria-label="Mobile menu">
            <div className="px-2 space-y-1">
              {/* Main Navigation */}
              <div className="space-y-1">
                <NavLink to="/home" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m2.25-13.5h.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25M3.75 5.25h.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.75m0 0h-.375c-.621 0-1.125-.504-1.125-1.125V5.625c0-.621.504-1.125 1.125-1.125H3.75z" />
                      </svg>
                      <span className="font-medium">Latest</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </div>
                </NavLink>
                <NavLink to="/trending" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                      <span className="font-medium">Trending</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </div>
                </NavLink>
                <NavLink to="/ai" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                      <span className="font-medium">Tech</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </div>
                </NavLink>
                <NavLink to="/opinion" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <span className="font-medium">Opinion</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </div>
                </NavLink>
                <NavLink to="/world" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                      <span className="font-medium">Global</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </div>
                </NavLink>
                <NavLink to="/politics" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3z" />
                      </svg>
                      <span className="font-medium">Politics</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </div>
                </NavLink>
              </div>
              
              {/* Action Buttons */}
              <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                <Link
                  to="/subscribe"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-bold uppercase tracking-wide transition-colors text-sm"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span className="text-white">Get Free Updates</span>
                  </div>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>Member Login</span>
                  </div>
                </Link>
              </div>

              {/* Compact Social Links */}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-center items-center space-x-6">
                  <span className="text-gray-400 text-xs font-medium">Follow:</span>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.75 2.25h2.25a5.25 5.25 0 005.25 5.25v2.25a7.5 7.5 0 01-5.25-2.25v6.939a4.689 4.689 0 11-4.5-4.689v2.295a2.25 2.25 0 102.25 2.25V2.25z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
    </>
  );
};

export default Header;
