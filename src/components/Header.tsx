import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { getArticlesBySearch, getLatestArticles, getCategories } from '../utils/api';
import { buildNavTreeFromCategories, getFallbackNavTree, type NavNode } from '../utils/categoryHelpers';
import { getArticleHref } from '../utils/articleHelpers';

type SearchVisualState = 'idle' | 'typing' | 'loading';

const Header: React.FC = () => {
  const [navItems, setNavItems] = useState<NavNode[]>(() => getFallbackNavTree());
  const [navLoading, setNavLoading] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMoreChild, setOpenMoreChild] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const [shrink, setShrink] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true));

  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileQuery, setMobileQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{
    id: number;
    title: string;
    slug: string;
    canonical_url?: string;
    short_link?: string | null;
    image?: string;
    date?: string;
    category?: string;
  }>>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const recentKey = 'recentSearches';
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [mobileExpandedSections, setMobileExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    const hydrateNavigation = async () => {
      setNavLoading(true);
      try {
        const response = await getCategories({ flat: true });
        if (cancelled) return;
        const payload = Array.isArray(response.data) ? response.data : [];
        const nextTree = buildNavTreeFromCategories(payload);
        setNavItems(nextTree.length > 0 ? nextTree : getFallbackNavTree());
        setNavError(null);
      } catch (error: any) {
        if (cancelled) return;
        setNavItems(getFallbackNavTree());
        setNavError(error?.message || 'Failed to load categories');
        console.error('Header navigation failed to load categories', error);
      } finally {
        if (!cancelled) {
          setNavLoading(false);
        }
      }
    };
    hydrateNavigation();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const searchVisualState: SearchVisualState = useMemo(() => {
    if (loadingSuggest) return 'loading';
    if (showSearch && query.trim().length > 0) return 'typing';
    return 'idle';
  }, [loadingSuggest, showSearch, query]);

  const mobileSearchVisualState: SearchVisualState = useMemo(
    () => (mobileQuery.trim().length > 0 ? 'typing' : 'idle'),
    [mobileQuery],
  );

  useEffect(() => {
    if (!isMenuOpen) {
      setMobileExpandedSections({});
    }
  }, [isMenuOpen]);

  const getIconVisuals = useCallback(
    (state: SearchVisualState, variant: 'button' | 'inline') => {
      const buttonIconBase = 'relative z-10 flex h-5 w-5 items-center justify-center transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110 group-active:scale-105 group-hover:-translate-y-0.5 group-hover:translate-x-0.5';
      const buttonHaloBase = 'pointer-events-none absolute -inset-2 rounded-full transition-all duration-500 group-hover:scale-110 group-focus-visible:scale-110';
      const inlineIconBase = 'relative z-10 flex h-4 w-4 items-center justify-center transition-transform duration-200 group-hover:scale-105 group-focus-within:scale-105 group-hover:-translate-y-0.5 group-hover:translate-x-0.5';
      const inlineHaloBase = 'pointer-events-none absolute -inset-2 rounded-full transition duration-500';
      const bases = variant === 'button' ? { iconBase: buttonIconBase, haloBase: buttonHaloBase, size: 20 } : { iconBase: inlineIconBase, haloBase: inlineHaloBase, size: 16 };

      switch (state) {
        case 'loading':
          return {
            iconClass: `${bases.iconBase} text-orange-300`,
            haloClass: `${bases.haloBase} bg-orange-500/45 blur-xl opacity-95 animate-pulse`,
            size: bases.size,
          };
        case 'typing':
          return {
            iconClass: `${bases.iconBase} text-orange-400 ${
              variant === 'button' ? 'rotate-[8deg]' : 'rotate-[6deg]'
            }`,
            haloClass: `${bases.haloBase} bg-orange-500/35 blur-lg opacity-85`,
            size: bases.size,
          };
        default:
          return {
            iconClass: variant === 'button' ? `${bases.iconBase} text-white` : `${bases.iconBase} text-white/75`,
            haloClass: variant === 'button' ? `${bases.haloBase} bg-orange-500/20 blur-md opacity-55 animate-[pulse_3s_ease-in-out_infinite] group-hover:opacity-80 group-focus-visible:opacity-80` : `${bases.haloBase} bg-orange-500/15 blur-md opacity-35`,
            size: bases.size,
          };
      }
    },
    [],
  );

  const renderSearchGlyph = useCallback(
    (state: SearchVisualState, variant: 'button' | 'inline') => {
      const { iconClass, haloClass, size } = getIconVisuals(state, variant);
      return (
        <span className="relative flex items-center justify-center">
          <span className={haloClass} />
          <span className={iconClass}>
            {state === 'loading' ? (
              <Loader2 className="animate-spin" style={{ width: size, height: size }} />
            ) : (
              <SearchIcon style={{ width: size, height: size }} />
            )}
          </span>
        </span>
      );
    },
    [getIconVisuals],
  );

  const logoScale = useMemo(() => {
    const base = isDesktop ? 1 - 0.7 * shrink : 1 - 0.55 * shrink;
    const min = isDesktop ? 0.8 : 0.7;
    return Math.max(min, base);
  }, [isDesktop, shrink]);

  const titleScale = useMemo(() => {
    const base = isDesktop ? 1 - 0.55 * shrink : 1 - 0.45 * shrink;
    const min = isDesktop ? 0.85 : 0.75;
    return Math.max(min, base);
  }, [isDesktop, shrink]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(recentKey);
      setRecentSearches(raw ? JSON.parse(raw) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const saveRecentSearch = useCallback((value: string) => {
    const term = value.trim();
    if (!term) return;
    const next = [term, ...recentSearches.filter((entry) => entry.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    localStorage.setItem(recentKey, JSON.stringify(next));
    setRecentSearches(next);
  }, [recentSearches]);

  const handleMobileSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = mobileQuery.trim();
    if (!term) return;
    saveRecentSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setMobileQuery('');
    setIsMenuOpen(false);
  };

  const [breakingNews, setBreakingNews] = useState<{ title: string; slug: string; canonical_url: string } | null>(null);
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
          const canonicalPath = getArticleHref(first);
          setBreakingNews({
            title: first.title || 'Breaking news',
            slug: first.slug,
            canonical_url: canonicalPath,
          });
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
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (breakingError) {
      console.warn('Failed to fetch breaking news');
    }
  }, [breakingError]);

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

  useEffect(() => {
    let rafId: number | null = null;
    const handle = () => {
      rafId = null;
      const y = window.scrollY || 0;
      const start = 0;
      const end = isDesktop ? 140 : 100;
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

  const closeMenus = () => setOpenMenu(null);

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
        const results = (res.data?.results || []).slice(0, 6).map((a: any) => {
          const canonicalPath = getArticleHref(a);
          return {
            id: a.id,
            title: a.title,
            slug: a.slug,
            canonical_url: canonicalPath,
            short_link: a.short_link || null,
            image: a.thumbnail || a.image || a.featured_image || a.cover_image || undefined,
            date: a.published_at || a.date || a.created_at || undefined,
            category: (a.category && (a.category.name || a.category.title)) || a.section || (a.topic && a.topic.name) || undefined,
          };
        });
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

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `transition-colors ${prefersReducedMotion ? 'duration-0' : 'duration-200 ease-out'} font-semibold uppercase tracking-wide line-clamp-1 ${isActive ? 'text-orange-500' : 'text-white'} hover:text-orange-500`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }): string => `block py-2 px-3 text-sm ${isActive ? 'text-orange-500 font-semibold bg-gray-800 rounded' : 'text-white'} hover:text-orange-500 hover:bg-gray-800 rounded transition-all duration-200`;

  const closeMenuDelayed = useRef<number | undefined>(undefined);
  const handleMouseLeave = () => {
    closeMenuDelayed.current = window.setTimeout(closeMenus, 200);
  };
  const handleMouseEnter = () => {
    if (closeMenuDelayed.current) window.clearTimeout(closeMenuDelayed.current);
  };

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

  const navStatusMessage = useMemo(() => {
    if (navLoading) return 'Loading categories...';
    if (navError) return 'Using fallback categories.';
    return null;
  }, [navLoading, navError]);

  useEffect(() => {
    if (openMenu !== 'more') {
      setOpenMoreChild(null);
    }
  }, [openMenu]);

  const displayNavItems = useMemo(() => {
    const MORE_SLUGS = new Set(['business-economy', 'sports', 'crime-justice']);
    const moreChildren: NavNode[] = [];
    const primary: NavNode[] = [];

    navItems.forEach((node) => {
      if (MORE_SLUGS.has(node.slug)) {
        moreChildren.push(node);
      } else {
        primary.push(node);
      }
    });

    if (moreChildren.length > 0) {
      primary.push({
        slug: 'more',
        name: 'More',
        children: moreChildren,
      });
    }

    return primary;
  }, [navItems]);

  const getCategoryPath = (slug: string) => {
    if (!slug) return '/';
    switch (slug) {
      case 'trending':
        return '/trending';
      default:
        return `/category/${slug}`;
    }
  };

  const toggleMobileSection = (slug: string) => {
    setMobileExpandedSections((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const renderMobileNavBranch = (node: NavNode, depth: number): React.ReactNode => {
    const shouldRenderChildren = depth < 2 && node.children.length > 0;
    return (
      <div key={`mobile-${node.slug}-${depth}`} className="space-y-1">
        <NavLink
          to={getCategoryPath(node.slug)}
          className={({ isActive }) => `block rounded px-3 py-2 text-sm transition-colors ${
            isActive ? 'bg-white/10 text-orange-400 font-semibold' : 'text-gray-200 hover:bg-white/5 hover:text-orange-400'
          }`}
          style={{ paddingLeft: depth * 16 }}
          onClick={() => setIsMenuOpen(false)}
        >
          {node.name}
        </NavLink>
        {shouldRenderChildren && (
          <div className="space-y-1 border-l border-gray-800 pl-3">
            {node.children.map((child) => renderMobileNavBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderMobileNavNode = (node: NavNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    if (!hasChildren) {
      return (
        <NavLink
          key={`mobile-root-${node.slug}`}
          to={getCategoryPath(node.slug)}
          className={mobileNavLinkClasses}
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{node.name}</span>
            <ChevronRight size={16} className="text-gray-500" />
          </div>
        </NavLink>
      );
    }
    const expanded = !!mobileExpandedSections[node.slug];
    const sectionId = `mobile-section-${node.slug}`;
    return (
      <div key={`mobile-root-${node.slug}`} className="rounded-lg border border-gray-800 bg-gray-900/40">
        <button
          type="button"
          className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          onClick={() => toggleMobileSection(node.slug)}
          aria-expanded={expanded}
          aria-controls={sectionId}
        >
          <span>{node.name}</span>
          <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div id={sectionId} className="space-y-1 pb-2">
            <NavLink
              to={getCategoryPath(node.slug)}
              className={({ isActive }) => `block px-3 py-2 text-sm font-medium transition ${
                isActive ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              View all {node.name}
            </NavLink>
            {node.children.map((child) => renderMobileNavBranch(child, 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDesktopNavItem = (node: NavNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    if (!hasChildren) {
      return (
        <li key={node.slug}>
          <NavLink to={getCategoryPath(node.slug)} className={navLinkClasses} onClick={() => setOpenMenu(null)}>
            {node.name}
          </NavLink>
        </li>
      );
    }
    const menuId = `mega-${node.slug}`;

    if (node.slug === 'more') {
      return (
        <li
          key={node.slug}
          className="relative"
          onMouseEnter={() => setOpenMenu(node.slug)}
          onFocus={() => setOpenMenu(node.slug)}
        >
          <button
            type="button"
            className={`${navLinkClasses({ isActive: false })} inline-flex items-center gap-1`}
            aria-haspopup="true"
            aria-expanded={openMenu === node.slug}
            aria-controls={menuId}
            onClick={() => setOpenMenu((current) => (current === node.slug ? null : node.slug))}
            onKeyDown={onMegaKeyDown(node.slug, menuId)}
          >
            {node.name}
            <ChevronDown size={14} />
          </button>
          {openMenu === node.slug && (
            <div
              id={menuId}
              className="absolute left-0 mt-2 w-[28rem] min-w-[20rem] max-w-[50vw] rounded-2xl border border-white/10 bg-black/40 text-gray-50 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              role="menu"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-80" />
              <div className="relative flex flex-col gap-2.5 px-2 py-3">
                {node.children.map((child) => {
                  const expanded = openMoreChild === child.slug;
                  return (
                    <div
                      key={child.slug}
                      className="rounded-lg border border-white/10 bg-white/5 text-white/90 shadow-sm backdrop-blur-sm transition hover:border-white/20"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-2 py-1.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setOpenMoreChild((prev) => (prev === child.slug ? null : child.slug));
                        }}
                      >
                        <span>{child.name}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div className={`overflow-hidden transition-all ${expanded ? 'max-h-96' : 'max-h-0'}`}>
                        <div className="space-y-2 px-2 pb-3 pt-1.5 text-sm text-white/80">
                          <NavLink
                            to={getCategoryPath(child.slug)}
                            className="block rounded-lg px-3 py-1.5 font-semibold text-white transition hover:bg-white/10"
                            onClick={() => setOpenMenu(null)}
                          >
                            View all {child.name}
                          </NavLink>
                          {child.children.length > 0 && (
                            <div className="grid gap-1">
                              {child.children.map((grandchild) => (
                                <NavLink
                                  key={grandchild.slug}
                                  to={getCategoryPath(grandchild.slug)}
                                  className="inline-flex items-center rounded-lg px-3 py-1 text-sm transition hover:bg-white/10"
                                  onClick={() => setOpenMenu(null)}
                                >
                                  {grandchild.name}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </li>
      );
    }

    return (
      <li
        key={node.slug}
        className="relative"
        onMouseEnter={() => setOpenMenu(node.slug)}
        onFocus={() => setOpenMenu(node.slug)}
      >
        <button
          type="button"
          className={`${navLinkClasses({ isActive: false })} inline-flex items-center gap-1`}
          aria-haspopup="true"
          aria-expanded={openMenu === node.slug}
          aria-controls={menuId}
          onClick={() => setOpenMenu((current) => (current === node.slug ? null : node.slug))}
          onKeyDown={onMegaKeyDown(node.slug, menuId)}
        >
          {node.name}
          <ChevronDown size={14} />
        </button>
        {openMenu === node.slug && (
          <div
            id={menuId}
            className="absolute left-0 mt-2 w-96 min-w-[20rem] max-w-[50vw] rounded-2xl border border-white/10 bg-black/40 text-gray-50 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            role="menu"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-80" />
            <div className="relative flex flex-col gap-1.5 px-2.5 py-3">
              <NavLink
                to={getCategoryPath(node.slug)}
                className={({ isActive }) => `block rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white/15 text-white shadow-inner shadow-white/15' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setOpenMenu(null)}
              >
                View all {node.name}
              </NavLink>
              {node.children.map((child) => (
                <div key={child.slug} className="rounded-lg pl-1">
                  <NavLink
                    to={getCategoryPath(child.slug)}
                    className={({ isActive }) => `block rounded-lg px-2.5 py-1.5 text-sm leading-snug transition duration-200 ${
                      isActive ? 'bg-white/15 text-white shadow-inner shadow-white/15' : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => setOpenMenu(null)}
                  >
                    {child.name}
                  </NavLink>
                  {child.children.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 pl-2.5">
                      {child.children.map((grandchild) => (
                        <NavLink
                          key={grandchild.slug}
                          to={getCategoryPath(grandchild.slug)}
                          className={({ isActive }) => `inline-flex items-center rounded-full px-2 py-0.5 text-xs transition ${
                            isActive ? 'bg-orange-500/30 text-orange-200' : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                          onClick={() => setOpenMenu(null)}
                        >
                          {grandchild.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </li>
    );
  };

  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const navGapBase = isDesktop ? 16 : 12;
  const navGapExpanded = isDesktop ? 24 : 16;
  const navFontCompact = 0.75;
  const navFontExpanded = isDesktop ? 0.8 : 0.75;
  const navFontDelta = navFontExpanded - navFontCompact;
  const navFontSizeValue = navFontDelta === 0 ? `${navFontCompact}rem` : `clamp(0.75rem, calc(${navFontCompact}rem + ${navFontDelta}rem * ${1 - shrink}), 0.85rem)`;

  useEffect(() => {
    if (!isMenuOpen) return;
    const container = mobileNavRef.current;
    if (!container) return;
    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>('a, button, select, input, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hasAttribute('disabled') && !el.hasAttribute('hidden'));
    let focusableList = getFocusable();
    (focusableList[0] || container).focus();
    const observer = new MutationObserver(() => {
      focusableList = getFocusable();
    });
    observer.observe(container, { childList: true, subtree: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusableList;
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          (last as HTMLElement)?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          (first as HTMLElement)?.focus();
          e.preventDefault();
        }
      }
    };
    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      observer.disconnect();
    };
  }, [isMenuOpen]);

  return (
    <>
      {breakingNews && !breakingDismissed && (
        <div className={`${isDesktop ? 'sticky top-0' : 'relative'} z-[60] bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 animate-shimmer" />
          <div className="relative flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                BREAKING
              </span>
              <span className="line-clamp-1 animate-text-slide">{breakingNews.title}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                to={breakingNews.canonical_url || getArticleHref({ slug: breakingNews.slug })}
                className="text-white underline hover:text-gray-200 whitespace-nowrap"
              >
                Read more →
              </Link>
              <button onClick={() => setBreakingDismissed(true)} className="text-white/80 hover:text-white transition-colors" aria-label="Dismiss breaking news">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        className={`header-nav sticky top-0 z-[55] text-white font-sans ${hasShadow ? 'shadow-md' : ''} ${prefersReducedMotion ? 'duration-0' : 'duration-200 ease-out'} transition-[padding,transform,background-color,backdrop-filter] bg-black backdrop-blur-md`}
        style={{
          '--nav-gap-base': `${navGapBase}px`,
          '--nav-gap-expanded': `${navGapExpanded}px`,
          '--nav-font-size': navFontSizeValue,
        } as React.CSSProperties}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {/* Top bar - keeps overflow hidden for clean collapse */}
        <div
          className="hidden lg:flex items-center justify-between px-4 border-b text-xs text-gray-300 transition-[opacity,max-height,padding]"
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

        {/* Main container - overflow-visible added to allow mega menus to show */}
        <div
          className={`container mx-auto px-4 ${prefersReducedMotion ? 'duration-0' : 'duration-200 ease-out'} transition-all overflow-visible`}
          style={{
            paddingTop: 16 - 12 * shrink,
            paddingBottom: 16 - 12 * shrink
          }}
        >
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center space-x-2 mr-12 md:mr-16 lg:mr-20">
              <img
                src="/logo.png?v=2025"
                alt="The Age Of GenZ - Home"
                className={`${isCompact ? 'h-6 md:h-8' : 'h-12 md:h-14'} w-auto transition-transform ${prefersReducedMotion ? 'duration-0' : 'duration-200 ease-out'}`}
                style={{
                  transform: `scale(${logoScale})`,
                  transformOrigin: 'left center',
                }}
              />
              <span
                className={`${isCompact ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-bold tracking-normal leading-tight font-serif text-white whitespace-nowrap transition-transform ${prefersReducedMotion ? 'duration-0' : 'duration-200 ease-out'}`}
                style={{
                  transform: `scale(${titleScale})`,
                  transformOrigin: 'left center',
                }}
              >
                The Age of GenZ
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 min-w-0 justify-center header-desktop-nav">
              {navStatusMessage && (
                <span className="sr-only" aria-live="polite">
                  {navStatusMessage}
                </span>
              )}
              <ul
                className={`flex items-center transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200 ease-out'}`}
                style={{
                  gap: `calc(var(--nav-gap-base) + (var(--nav-gap-expanded) - var(--nav-gap-base)) * ${1 - shrink * 0.8})`,
                  fontSize: 'var(--nav-font-size)',
                }}
              >
                {displayNavItems.map((node) => renderDesktopNavItem(node))}
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
                {navLoading && (
                  <li className="ml-2 flex items-center gap-1.5 text-xs text-white/70">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating
                  </li>
                )}
              </ul>
            </nav>

            <div className="hidden lg:flex items-center gap-3 pr-6 lg:pr-8">
              <div
                className="relative"
                onMouseEnter={() => setOpenMenu('account')}
                onFocus={() => setOpenMenu('account')}
              >
                <button
                  type="button"
                  className={`${navLinkClasses({ isActive: false })} inline-flex items-center gap-1 px-2.5 py-1`}
                  title="Account options"
                  aria-haspopup="true"
                  aria-expanded={openMenu === 'account'}
                  aria-controls="mega-account"
                  onClick={() => setOpenMenu((current) => (current === 'account' ? null : 'account'))}
                  onKeyDown={onMegaKeyDown('account', 'mega-account')}
                >
                  Account
                  <ChevronDown size={14} />
                </button>
                {openMenu === 'account' && (
                  <div
                    id="mega-account"
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-gray-50 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                    role="menu"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-80" />
                    <div className="relative flex flex-col gap-1 p-4">
                      <NavLink
                        to="/subscribe"
                        className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                          isActive ? 'bg-white/15 text-white shadow-inner shadow-white/15' : 'text-white/85 hover:bg-white/10 hover:text-white'
                        }`}
                        onClick={() => setOpenMenu(null)}
                      >
                        Subscribe
                      </NavLink>
                      <NavLink
                        to="/login"
                        className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                          isActive ? 'bg-white/15 text-white shadow-inner shadow-white/15' : 'text-white/85 hover:bg-white/10 hover:text-white'
                        }`}
                        onClick={() => setOpenMenu(null)}
                      >
                        Login
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={searchBoxRef}>
                <button
                  type="button"
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                    showSearch ? 'text-orange-400' : 'text-white hover:text-orange-400'
                  } hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
                  aria-label={showSearch ? 'Close search' : 'Search'}
                  title="Search articles"
                  onClick={() => {
                    setShowSearch((s) => !s);
                    setShowSuggest(true);
                  }}
                >
                  {showSearch ? <X size={18} /> : renderSearchGlyph(searchVisualState, 'button')}
                </button>
                {showSearch && (
                  <div className="absolute right-0 mt-2 w-[400px] overflow-hidden rounded-2xl border border-white/10 bg-black/50 text-gray-100 shadow-[0_30px_70px_rgba(15,23,42,0.6)] backdrop-blur-xl p-4 z-50">
                    <div className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 transition duration-200 focus-within:border-orange-500/60 focus-within:bg-white/10 focus-within:shadow-[0_0_30px_rgba(249,115,22,0.25)]">
                      {renderSearchGlyph(searchVisualState, 'inline')}
                      <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setShowSuggest(true);
                        }}
                        aria-label="Search articles"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && query.trim()) {
                            const q = query.trim();
                            saveRecentSearch(q);
                            navigate(`/search?q=${encodeURIComponent(q)}`);
                            setShowSuggest(false);
                            setShowSearch(false);
                          }
                        }}
                        placeholder="Search articles..."
                        className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none transition duration-200 focus:text-white"
                      />
                      {query && (
                        <button
                          className="px-3 py-1.5 rounded text-white/70 hover:text-white text-xs transition-colors"
                          aria-label="Clear search"
                          onClick={() => {
                            setQuery('');
                            setShowSuggest(true);
                          }}
                        >
                          Clear
                        </button>
                      )}
                      <button
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-orange-500/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        onClick={() => {
                          if (!query.trim()) return;
                          const q = query.trim();
                          saveRecentSearch(q);
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
                                      className="w-full text-left px-2 py-1 rounded-lg text-sm text-white flex items-start gap-3 transition-colors duration-200 hover:bg-white/10"
                                      onClick={() => {
                                        const targetPath = getArticleHref(s);
                                        if (targetPath && targetPath !== '#') {
                                          navigate(targetPath);
                                        }
                                        setShowSuggest(false);
                                        setShowSearch(false);
                                      }}
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
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-white/70 mb-2">Recent searches</div>
                              {loadingRecent ? (
                                <div className="text-sm text-white/70">Loading…</div>
                              ) : recentSearches.length === 0 ? (
                                <div className="text-sm text-white/70">No recent searches</div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {recentSearches.map((r) => (
                                    <button
                                      key={r}
                                      className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
                                      onClick={() => {
                                        navigate(`/search?q=${encodeURIComponent(r)}`);
                                        setShowSuggest(false);
                                        setShowSearch(false);
                                      }}
                                    >
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
                                  <button
                                    key={t}
                                    className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-100 hover:bg-orange-500/30 transition-colors"
                                    onClick={() => {
                                      navigate(`/search?q=${encodeURIComponent(t)}`);
                                      setShowSuggest(false);
                                      setShowSearch(false);
                                    }}
                                  >
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
              </div>
            </div>

            {/* Mobile Menu Button */}
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <nav
              ref={mobileNavRef}
              className="lg:hidden pt-3 pb-3 border-t border-gray-800 bg-black text-white header-mobile-nav max-h-[60vh] overflow-y-auto"
              aria-label="Mobile menu"
            >
              <div className="px-2 space-y-3">
                <form onSubmit={handleMobileSearchSubmit} className="group flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 shadow-sm">
                  {renderSearchGlyph(mobileSearchVisualState, 'inline')}
                  <input
                    type="search"
                    value={mobileQuery}
                    onChange={(e) => setMobileQuery(e.target.value)}
                    placeholder="Search articles..."
                    aria-label="Search articles"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Search
                  </button>
                </form>

                {/* Main Navigation */}
                <div className="space-y-3">
                  {displayNavItems.map((node) => renderMobileNavNode(node))}
                  {navLoading && (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating categories...
                    </div>
                  )}
                  {navError && !navLoading && (
                    <div className="px-3 text-xs text-orange-400">
                      Showing fallback categories.
                    </div>
                  )}
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
                    <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
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