import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getArticleBySlug, getArticles } from '../utils/api';
import DonationPlaceholder from '../components/DonationPlaceholder';
import {
  Eye,
  Tag,
  BookOpen,
  Facebook,
  Mail,
  Link2,
  Linkedin,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Send,
  Bird,
} from 'lucide-react';
import { Article } from '../types';
import {
  resolveCategoryMeta,
  getCategoryAccent,
  getCategoryPath,
  getFallbackCategoryDisplayName,
  type CategoryMeta,
  type CategoryAccent,
} from '../utils/categoryHelpers';

// Cache for articles to avoid refetching
const articleCache = new Map<string, Article>();
const relatedCache = new Map<string, Article[]>();

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const RedditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <path d="M14.5 3a1 1 0 0 0-1 .81l-.37 1.86a7.18 7.18 0 0 0-2.8.01L10.1 3.8a1 1 0 1 0-2 .4l.35 1.73a5.69 5.69 0 0 0-3.33 5.16c0 3.36 3.24 6.08 7.88 6.08s7.88-2.72 7.88-6.08a5.69 5.69 0 0 0-3.33-5.17l.35-1.72a1 1 0 0 0-1.93-.4l-.24 1.18a7.22 7.22 0 0 0-2.93-.01l.36-1.81A1 1 0 0 0 14.5 3Zm-5.63 7.02a1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5-1.5Zm6.26 0a1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5-1.5Zm-6.05 4.1a.75.75 0 0 1 1.06.05c.6.67 1.51 1.05 2.5 1.05s1.9-.38 2.5-1.05a.75.75 0 0 1 1.12.99C14.31 16.52 12.96 17 11.63 17s-2.68-.48-3.63-1.29a.75.75 0 0 1-.05-1.06Z" />
  </svg>
);

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('ArticleDetail render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="text-gray-600">Please refresh the page or try again later.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
const slugify = (value?: string | null): string => {
  if (!value) return 'trending';
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'trending';
};

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showProgressBar, setShowProgressBar] = useState<boolean>(true);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);
  const shareMenuContentRef = useRef<HTMLDivElement | null>(null);
  const shareTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [shareMenuReady, setShareMenuReady] = useState(false);
  const [bookmarkMessage, setBookmarkMessage] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const bookmarkToastTimeoutRef = useRef<number | null>(null);

  if (import.meta.env.DEV) {
    console.debug('ArticleDetail render', {
      slug,
      loading,
      hasArticle: Boolean(article),
      error,
    });
  }

  const categoryMeta: CategoryMeta | null = useMemo(() => {
    if (!article) return null;

    const source = (() => {
      if (article.category && article.category.slug) {
        return {
          slug: slugify(article.category.slug),
          name: article.category.name || article.category_name || 'Trending',
          parent_slug: article.category.parent_slug ?? null,
        };
      }

      return {
        slug: slugify(article.category_name),
        name: article.category_name || 'Trending',
        parent_slug: null,
      };
    })();

    return resolveCategoryMeta(source);
  }, [article]);

  const categoryAccent: CategoryAccent = useMemo(
    () =>
      categoryMeta
        ? getCategoryAccent({ slug: categoryMeta.slug, name: categoryMeta.name })
        : getCategoryAccent(),
    [categoryMeta],
  );

  const categoryBreadcrumbs = useMemo(
    () =>
      categoryMeta
        ? getCategoryPath(categoryMeta.slug).map((slug) => ({
            slug,
            name: getFallbackCategoryDisplayName(slug),
          }))
        : [],
    [categoryMeta],
  );

  const categoryLink = categoryMeta ? `/category/${categoryMeta.slug}` : '/category/trending';
  const categoryDisplayName = categoryMeta?.name ?? 'Trending';
  const topLevelCategoryName = categoryMeta?.topLevelName ?? categoryDisplayName;

  useEffect(() => {
    if (typeof window === 'undefined' || !slug) {
      return;
    }

    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch (error) {
      console.warn('Bookmarks unavailable (read)', error);
      setIsBookmarked(false);
      return;
    }

    try {
      const raw = storage.getItem('aoz_bookmarks');
      if (!raw) {
        setIsBookmarked(false);
        return;
      }
      const stored = JSON.parse(raw);
      setIsBookmarked(Array.isArray(stored) && stored.includes(slug));
    } catch (error) {
      console.error('Failed to read bookmarks', error);
      setIsBookmarked(false);
    }
  }, [slug]);

  const dismissBookmarkToast = useCallback(() => {
    if (typeof window !== 'undefined' && bookmarkToastTimeoutRef.current) {
      window.clearTimeout(bookmarkToastTimeoutRef.current);
      bookmarkToastTimeoutRef.current = null;
    }
    setBookmarkMessage(null);
  }, []);

  const closeShareMenu = useCallback(
    (focusTrigger = false) => {
      setShowShareMenu(false);
      if (focusTrigger && shareTriggerRef.current) {
        shareTriggerRef.current.focus();
      }
    },
    [],
  );

  const showBookmarkToast = useCallback(
    (message: string) => {
      if (typeof window === 'undefined') {
        setBookmarkMessage(message);
        return;
      }
      if (bookmarkToastTimeoutRef.current) {
        window.clearTimeout(bookmarkToastTimeoutRef.current);
        bookmarkToastTimeoutRef.current = null;
      }

      setBookmarkMessage(message);
      bookmarkToastTimeoutRef.current = window.setTimeout(() => {
        bookmarkToastTimeoutRef.current = null;
        setBookmarkMessage(null);
      }, 2400);
    },
    [],
  );

  const handleToggleShareMenu = useCallback(() => {
    setShowShareMenu((prev) => {
      const next = !prev;
      if (!next && shareTriggerRef.current) {
        shareTriggerRef.current.focus();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!showShareMenu) {
      setShareMenuReady(false);
      return;
    }
    const raf = window.requestAnimationFrame(() => {
      setShareMenuReady(true);
    });
    return () => {
      window.cancelAnimationFrame(raf);
      setShareMenuReady(false);
    };
  }, [showShareMenu]);

  useEffect(() => {
    if (!showShareMenu) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        closeShareMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeShareMenu(true);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = shareMenuContentRef.current?.querySelectorAll<HTMLElement>('[data-share-menu-item]');

      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const focusable = shareMenuContentRef.current?.querySelectorAll<HTMLElement>('[data-share-menu-item]');
    focusable && focusable[0]?.focus();

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeShareMenu, showShareMenu]);

  useEffect(() => {
    if (!bookmarkMessage) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismissBookmarkToast();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [bookmarkMessage, dismissBookmarkToast]);

  useEffect(() => {
    return () => {
      dismissBookmarkToast();
    };
  }, [dismissBookmarkToast]);

  // Memoized date formatter
  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Unknown date';
    }
  }, []);

  useEffect(() => {
    if (!article) return;
    const raf = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    return () => window.cancelAnimationFrame(raf);
  }, [article]);

  useEffect(() => {
    setShowAllTags(false);
  }, [article?.slug]);

  // Calculate reading time based on word count
  const estimatedReadTime = useMemo(() => {
    if (!article?.content) return 5;
    const textOnly = article.content.replace(/<[^>]*>/g, ' ');
    const wordCount = textOnly.split(/\s+/).filter(word => word.length > 0).length;
    const imageCount = (article.content.match(/<img/gi) || []).length;
    const codeBlockCount = (article.content.match(/<pre|```/gi) || []).length;
    const wordsPerMinute = 238; // Research-backed average

    const baseMinutes = wordCount / wordsPerMinute;
    const imageMinutes = (imageCount * 12) / 60; // +12 seconds per image
    const codeMinutes = codeBlockCount * 0.5; // slower scanning for code & data blocks

    return Math.max(1, Math.ceil(baseMinutes + imageMinutes + codeMinutes));
  }, [article?.content]);

  // Article content formatter tuned for editorial styling
  const formattedContent = useMemo(() => {
    if (!article?.content) {
      return { __html: '<p class="text-gray-600">No content available.</p>' };
    }

    const applyTextHighlights = (markup: string) =>
      markup.replace(/==([\s\S]+?)==/g, (_match, text) => `<mark>${text.trim()}</mark>`);

    const applyStatHighlights = (markup: string) =>
      markup.replace(/%%([\s\S]+?)%%/g, (_match, text) => `<span class="article-stat-highlight">${text.trim()}</span>`);

    const enhanceInlineMarkup = (markup: string) => applyTextHighlights(applyStatHighlights(markup));

    const createInfoboxMarkup = (variant: 'info' | 'alert', body: string) => {
      const icon = variant === 'alert' ? '&#9888;' : '&#9432;';
      const formattedBody = enhanceInlineMarkup(body.trim());
      const wrappedBody = /<(p|ul|ol|div|h[1-6])/i.test(formattedBody) ? formattedBody : `<p>${formattedBody}</p>`;
      return `<div class="article-infobox article-infobox--${variant}"><span class="article-infobox__icon" aria-hidden="true">${icon}</span><div class="article-infobox__content">${wrappedBody}</div></div>`;
    };

    const transformInfoBoxes = (markup: string) =>
      markup
        .replace(/<p>\s*\[(info|note)\]\s*(.*?)<\/p>/gi, (_match, _type, body) => createInfoboxMarkup('info', body))
        .replace(/<p>\s*\[(alert|warning|important)\]\s*(.*?)<\/p>/gi, (_match, _type, body) => createInfoboxMarkup('alert', body));

    const transformKeyTakeaways = (markup: string) => {
      let updatedMarkup = markup;
      const markerPattern = /<p>\s*\[\[key-takeaways\]\]\s*<\/p>([\s\S]*?)(<p>\s*\[\[\/key-takeaways\]\]\s*<\/p>)/gi;

      updatedMarkup = updatedMarkup.replace(markerPattern, (_match, body) => {
        const innerContent = enhanceInlineMarkup(String(body).trim());
        return `<section class="article-key-takeaways"><div class="article-key-takeaways__label">Key Takeaways</div><div class="article-key-takeaways__body">${innerContent}</div></section>`;
      });

      return updatedMarkup;
    };

    const transformPullQuotes = (markup: string) =>
      markup.replace(/<p([^>]*)>["']([^"']{50,200})["']<\/p>/gi, (_match, attrs, quote) => {
        if (/class\s*=/.test(attrs || '') && /article-pullquote/.test(attrs || '')) {
          return _match;
        }
        return `<div class="article-pullquote">${quote}</div>`;
      });

    const ensureLazyImages = (markup: string) =>
      markup.replace(/<img([^>]*)>/gi, (match, attrs) => {
        if (/loading\s*=/.test(attrs)) {
          return match;
        }
        return `<img${attrs} loading="lazy">`;
      });

    const htmlPattern = /<(p|br|h[1-6]|ul|ol|blockquote|figure|pre|code|img)/i;

    if (htmlPattern.test(article.content)) {
      let content = article.content.trim();
      content = content.replace(/<p>\s*<\/p>/gi, '');
      content = transformPullQuotes(content);
      content = ensureLazyImages(content);
      content = transformInfoBoxes(content);
      content = transformKeyTakeaways(content);
      content = enhanceInlineMarkup(content);
      return { __html: content };
    }

    const paragraphs = article.content
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((paragraph) => paragraph.length > 0);

    const htmlPieces: string[] = [];
    let collectingTakeaways = false;
    const takeawayItems: string[] = [];

    const pushTakeawaySection = () => {
      if (takeawayItems.length > 0) {
        htmlPieces.push(
          `<section class="article-key-takeaways"><div class="article-key-takeaways__label">Key Takeaways</div><ul class="article-key-takeaways__list">${takeawayItems.join(
            ''
          )}</ul></section>`
        );
        takeawayItems.length = 0;
      }
      collectingTakeaways = false;
    };

    paragraphs.forEach((paragraph) => {
      const normalised = paragraph.replace(/\s+/g, ' ').trim();
      if (!normalised.length) {
        return;
      }

      if (/^\[\[key-takeaways\]\]/i.test(normalised)) {
        collectingTakeaways = true;
        return;
      }

      if (/^\[\[\/key-takeaways\]\]/i.test(normalised)) {
        pushTakeawaySection();
        return;
      }

      if (collectingTakeaways) {
        const item = normalised.replace(/^[*-]\s*/, '');
        takeawayItems.push(`<li>${enhanceInlineMarkup(item)}</li>`);
        return;
      }

      if (/^\[(info|note)\]/i.test(normalised)) {
        const body = normalised.replace(/^\[(info|note)\]\s*/i, '');
        htmlPieces.push(createInfoboxMarkup('info', body));
        return;
      }

      if (/^\[(alert|warning|important)\]/i.test(normalised)) {
        const body = normalised.replace(/^\[(alert|warning|important)\]\s*/i, '');
        htmlPieces.push(createInfoboxMarkup('alert', body));
        return;
      }

      if (
        (normalised.startsWith('"') && normalised.endsWith('"')) ||
        (normalised.startsWith("'") && normalised.endsWith("'"))
      ) {
        const text = normalised.slice(1, -1);
        if (text.length >= 50 && text.length <= 200) {
          htmlPieces.push(`<div class="article-pullquote">${enhanceInlineMarkup(text)}</div>`);
          return;
        }
      }

      if (normalised.startsWith('> ')) {
        htmlPieces.push(`<blockquote>${enhanceInlineMarkup(normalised.slice(2))}</blockquote>`);
        return;
      }

      if (normalised.startsWith('**') && normalised.endsWith('**')) {
        htmlPieces.push(`<h3>${enhanceInlineMarkup(normalised.slice(2, -2))}</h3>`);
        return;
      }

      htmlPieces.push(`<p>${enhanceInlineMarkup(normalised)}</p>`);
    });

    if (collectingTakeaways) {
      pushTakeawaySection();
    }

    return { __html: htmlPieces.join('') };
  }, [article?.content]);

  const articleSlug = article?.slug ?? '';
  const articleUrl = `https://theageofgenz.com/article/${articleSlug}`;
  const rawPublishedDate = article?.published_at || article?.created_at || '';
  const publishedDate = rawPublishedDate ? formatDate(rawPublishedDate) : '';
  const imageUrl =
    article?.featured_image_url ||
    article?.featured_image ||
    'https://theageofgenz.com/og-image.jpg';
  const viewCount = article?.view_count ?? article?.views ?? null;
  const encodedShareUrl = encodeURIComponent(articleUrl);
  const encodedShareTitle = encodeURIComponent(article?.title ?? 'The Age of GenZ');
  const shareMenuItemClass =
    'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const shareLinks = useMemo(
    () => [
      {
        name: 'Email',
        href: `mailto:?subject=${encodedShareTitle}&body=${encodedShareTitle}%0A%0A${encodedShareUrl}`,
        Icon: Mail,
        iconClass: 'text-gray-500',
      },
      {
        name: 'Facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
        Icon: Facebook,
        iconClass: 'text-blue-600',
      },
      {
        name: 'Bluesky',
        href: `https://bsky.app/intent/compose?text=${encodedShareTitle}%20${encodedShareUrl}`,
        Icon: Bird,
        iconClass: 'text-sky-500',
      },
      {
        name: 'X',
        href: `https://x.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareTitle}`,
        Icon: XIcon,
        iconClass: 'text-gray-900',
      },
      {
        name: 'Telegram',
        href: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareTitle}`,
        Icon: Send,
        iconClass: 'text-sky-400',
      },
      {
        name: 'LinkedIn',
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
        Icon: Linkedin,
        iconClass: 'text-sky-600',
      },
      {
        name: 'WhatsApp',
        href: `https://wa.me/?text=${encodedShareTitle}%20${encodedShareUrl}`,
        Icon: MessageCircle,
        iconClass: 'text-green-500',
      },
      {
        name: 'Reddit',
        href: `https://www.reddit.com/submit?url=${encodedShareUrl}&title=${encodedShareTitle}`,
        Icon: RedditIcon,
        iconClass: 'text-orange-500',
      },
    ],
    [encodedShareTitle, encodedShareUrl],
  );

  const shareLinkItems = useMemo(() => shareLinks.filter((item) => Boolean(item.href)), [shareLinks]);

  const toggleBookmark = useCallback(() => {
    if (!slug || typeof window === 'undefined') return;

    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch (error) {
      console.warn('Bookmarks unavailable (toggle)', error);
      showBookmarkToast('Bookmarks unavailable in this browser');
      return;
    }

    try {
      const raw = storage.getItem('aoz_bookmarks');
      const parsed = raw ? JSON.parse(raw) : [];
      const sanitizedItems = Array.isArray(parsed)
        ? (parsed as unknown[]).filter((entry): entry is string => typeof entry === 'string')
        : [];
      let nextItems: string[];
      let nextState = false;

      if (sanitizedItems.includes(slug)) {
        nextItems = sanitizedItems.filter((entry) => entry !== slug);
      } else {
        nextItems = [...sanitizedItems, slug];
        nextState = true;
      }

      const trimmedItems = nextItems.slice(-50);
      const removedCount = nextItems.length - trimmedItems.length;
      if (removedCount > 0) {
        console.info(`Bookmark list trimmed to the latest 50 entries (removed ${removedCount}).`);
      }
      storage.setItem('aoz_bookmarks', JSON.stringify(trimmedItems));
      setIsBookmarked(nextState);
      showBookmarkToast(nextState ? 'Added to bookmarks' : 'Removed from bookmarks');
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
      showBookmarkToast('Could not update bookmark');
    }
  }, [showBookmarkToast, slug]);

  const handleCopyShare = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(articleUrl);
      } else {
        const fallback = window.prompt('Copy this link', articleUrl);
        if (fallback === null) {
          return false;
        }
      }
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 3000);
      return true;
    } catch (err) {
      console.error('Failed to copy link', err);
      return false;
    }
  }, [articleUrl]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrollableHeight = Math.max(documentHeight - windowHeight, 0);
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

      setReadingProgress(Math.min(100, Math.max(0, progress)));

      const shouldShow = scrollableHeight > 200;
      setShowProgressBar(prev => (prev === shouldShow ? prev : shouldShow));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // run once after mount to set initial visibility/progress
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Optimized fetch function with caching
  useEffect(() => {
    if (!slug) {
      setError('Article slug missing');
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedArticle = articleCache.get(slug);
        const cachedRelated = relatedCache.get(slug);

        if (cachedArticle && cachedRelated) {
          setArticle(cachedArticle);
          setRelatedArticles(cachedRelated);
          setLoading(false);
          document.title = `${cachedArticle.title} - The Age of GenZ`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const [articleResponse, allArticlesResponse] = await Promise.all([
          getArticleBySlug(slug),
          cachedRelated ? Promise.resolve({ data: { results: [] } }) : getArticles()
        ]);

        const articleData = articleResponse.data;
        setArticle(articleData);
        articleCache.set(slug, articleData);

        if (!cachedRelated) {
          const related = (allArticlesResponse.data.results || [])
            .filter((a: Article) => 
              a.category?.slug === articleData.category?.slug && 
              a.slug !== slug
            )
            .slice(0, 4);
          
          setRelatedArticles(related);
          relatedCache.set(slug, related);
        } else {
          setRelatedArticles(cachedRelated);
        }

        document.title = `${articleData.title} - The Age of GenZ`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.response?.data?.message || err.message || 'Could not load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // Enhanced loading skeleton
  if (loading && !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: '0%' }}></div>
        </div>

        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">›</span>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            <span className="text-gray-400">›</span>
            <span className="text-gray-400">›</span>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="lg:flex lg:gap-12">
            <article className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 animate-pulse space-y-6">
                <div className="w-24 h-7 bg-orange-200 rounded-full"></div>
                <div className="space-y-3">
                  <div className="w-full h-10 bg-gray-200 rounded"></div>
                  <div className="w-4/5 h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="flex gap-6 py-4">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-28 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full aspect-[16/10] bg-gray-200 rounded-xl"></div>
                <div className="space-y-4 pt-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`bg-gray-200 rounded h-4 ${
                      i === 1 ? 'w-11/12' : i === 3 ? 'w-4/5' : i === 5 ? 'w-3/4' : i === 7 ? 'w-5/6' : 'w-full'
                    }`}></div>
                  ))}
                </div>
              </div>
            </article>

            <aside className="mt-12 lg:mt-0 lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-full h-4 bg-gray-200 rounded"></div>
                          <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    const message = error || (article === null ? 'This article is not available' : 'Article data missing');
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Article Not Found</h1>
          <p className="text-gray-600 text-lg">{message}</p>
          <div className="flex flex-col items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg border border-orange-300 px-8 py-3 text-orange-600 transition hover:bg-orange-50"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-8 py-3 text-gray-600 transition hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-50">
      {bookmarkMessage && (
        <div
          className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={dismissBookmarkToast}
            className="pointer-events-auto rounded-full bg-gray-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Dismiss bookmark message"
          >
            {bookmarkMessage}
          </button>
        </div>
      )}
      {/* Enhanced SEO and Social Meta Tags */}
      <Helmet>
        <title>{article.title} - The Age of GenZ</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta name="keywords" content={`${categoryDisplayName || 'news'}, gen z, ${article.tags?.join(', ') || 'trending'}`} />
        
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        <meta property="og:image" content={imageUrl} />
        <link rel="preload" as="image" href={imageUrl} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="The Age of GenZ" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || article.title} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:domain" content="theageofgenz.com" />
        
        <meta property="article:published_time" content={article.published_at || article.created_at} />
        <meta property="article:modified_time" content={article.updated_at || article.created_at} />
        <meta property="article:author" content={article.author?.name || 'The Age Of GenZ'} />
        <meta property="article:section" content={categoryDisplayName || 'News'} />
        {article.tags?.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.excerpt || article.title,
            "image": imageUrl,
            "author": {
              "@type": "Organization",
              "name": article.author?.name || "The Age Of GenZ"
            },
            "publisher": {
              "@type": "Organization",
              "name": "The Age of GenZ",
              "logo": {
                "@type": "ImageObject",
                "url": "https://theageofgenz.com/logo.png"
              }
            },
            "datePublished": article.published_at || article.created_at,
            "dateModified": article.updated_at || article.created_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": articleUrl
            },
            "wordCount": article.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0
          })}
        </script>
      </Helmet>

      {/* Reading progress bar */}
      {showProgressBar && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-orange-500 transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
            style={{ width: `${readingProgress}%` }}
          ></div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-5 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
        <div className="space-y-12 xl:flex xl:gap-12 xl:space-y-0">
          {/* Main Article Content */}
          <article className="xl:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm px-6 py-8 md:px-12 md:py-12 lg:px-14 lg:py-16">
              {/* Article Header */}
              <header className="mb-12">
                <div className="mb-5 flex flex-wrap items-center gap-3 text-xs md:text-sm font-semibold">
                  <Link
                    to={categoryLink}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-[0.28em] text-white shadow-sm ${categoryAccent.badge}`}
                  >
                    {topLevelCategoryName.toUpperCase()}
                  </Link>
                  <span className="text-gray-400" aria-hidden="true">&bull;</span>
                  <span className="text-gray-500 tracking-normal">{publishedDate}</span>
                  <span className="text-gray-400" aria-hidden="true">&bull;</span>
                  <span className="text-gray-500 tracking-normal">The Age of GenZ</span>
                </div>
                
                {/* Article Title */}
                <h1 className="article-title text-gray-900">
                  {article.title}
                </h1>
                
                {/* Article Subtitle/Excerpt */}
                {article.excerpt && (
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed tracking-[0.01em] mb-10 max-w-2xl">
                    {article.excerpt}
                  </p>
                )}

                <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={16} className="text-orange-500" aria-hidden="true" />
                    <span>{estimatedReadTime} min read</span>
                  </span>
                  {viewCount !== null && (
                    <span className="inline-flex items-center gap-2">
                      <Eye size={16} className="text-orange-400" aria-hidden="true" />
                      <span>{viewCount.toLocaleString()} views</span>
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleBookmark}
                      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                        isBookmarked
                          ? 'border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck size={16} aria-hidden="true" />
                      ) : (
                        <Bookmark size={16} aria-hidden="true" />
                      )}
                      <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                    <div className="relative" ref={shareMenuRef}>
                      <button
                        type="button"
                        id="article-share-trigger"
                      ref={shareTriggerRef}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      aria-haspopup="true"
                      aria-expanded={showShareMenu}
                      aria-controls="article-share-menu"
                      aria-label={showShareMenu ? 'Close share menu' : 'Open share menu'}
                      title="Share this article"
                      onClick={handleToggleShareMenu}
                      >
                        <Share2 size={16} aria-hidden="true" />
                        <span>Share</span>
                      </button>
                      {showShareMenu && (
                          <div
                            id="article-share-menu"
                            role="menu"
                            aria-labelledby="article-share-trigger"
                            ref={shareMenuContentRef}
                            className={`absolute right-0 top-full z-40 mt-2 w-64 max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 overflow-hidden max-h-[50vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl divide-y divide-gray-100 origin-top-right transition-transform transition-opacity duration-150 ease-out transform ${
                              shareMenuReady ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95'
                            }`}
                          >
                          <div className="px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Share</p>
                            <p className="text-sm text-gray-500">Spread this story</p>
                          </div>
                          <div>
                            <button
                              type="button"
                              className={`${shareMenuItemClass} w-full text-left`}
                              role="menuitem"
                              data-share-menu-item
                              onClick={async () => {
                                const copied = await handleCopyShare();
                                if (copied) {
                                  closeShareMenu(true);
                                }
                              }}
                            >
                              <Link2 size={16} className="text-gray-500" aria-hidden="true" />
                              <span>Copy link</span>
                            </button>
                          </div>
                          <div className="py-1">
                            {shareLinkItems.map(({ name, href, Icon, iconClass }) => (
                              <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${shareMenuItemClass} block`}
                                role="menuitem"
                                data-share-menu-item
                                onClick={() => closeShareMenu()}
                              >
                                <Icon size={16} className={iconClass} aria-hidden="true" />
                                <span>{name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </header>

              {/* Featured Image */}
              {(article.featured_image_url || article.featured_image) && (
                <div className="-mx-6 md:-mx-12 lg:-mx-14">
                  <figure className="relative">
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse aspect-[16/10]"></div>
                    )}
                    <img
                      src={imageUrl}
                      alt={article.title || 'Article featured image'}
                      className={`w-full aspect-[16/10] object-cover transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        console.error('Featured image failed to load');
                        e.currentTarget.src = '/api/placeholder/800/450';
                      }}
                      loading="eager"
                    />
                    {(article.featured_image_caption || article.caption) && (
                      <figcaption className="px-6 md:px-12 lg:px-14 mt-2 text-sm text-gray-500 italic">
                        {article.featured_image_caption || article.caption}
                      </figcaption>
                    )}
                  </figure>
                </div>
              )}

              <div className="-mx-6 md:-mx-12 lg:-mx-14 border-t border-b border-orange-200 bg-white/90 mt-0">
                <div className="article-share-wrap px-6 md:px-12 lg:px-14 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-semibold text-gray-700">
                    Share this article using the menu or copy the link below.
                  </div>
                  <div className="article-share-copy flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        void handleCopyShare();
                      }}
                      aria-label="Copy article link"
                      className={`article-share-button article-share-button--copy ${copySuccess ? 'is-success' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
                    >
                      <Link2 className="article-share-icon" size={16} />
                      <span className="sr-only">{copySuccess ? 'Link copied' : 'Copy link'}</span>
                    </button>
                    <span
                      className={`article-share-tooltip ${copySuccess ? 'is-visible is-success' : ''}`}
                      role="status"
                      aria-live="polite"
                    >
                      {copySuccess ? 'Link copied!' : 'Copy link'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Article body */}
              <div
                className="article-content-container article-content leading-[1.75] hyphens-auto"
                dangerouslySetInnerHTML={formattedContent}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-16 pt-10 border-t border-gray-200">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={18} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Related Topics:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(showAllTags ? article.tags : article.tags.slice(0, 5)).map((tag, index) => (
                        <Link
                          key={`${tag}-${index}`}
                          to={`/search?q=${encodeURIComponent(tag)}`}
                          className="bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-700 px-3 py-2 rounded-full text-sm font-medium transition-colors transition-shadow border border-gray-200 hover:border-orange-200 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                          title={`View more stories about ${tag}`}
                        >
                          #{tag}
                        </Link>
                      ))}
                      {article.tags.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setShowAllTags((prev) => !prev)}
                          className="px-3 py-2 text-sm font-semibold text-orange-600 border border-orange-200 rounded-full hover:bg-orange-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                          {showAllTags ? 'Show less' : `+${article.tags.length - 5} more`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12">
                <Link
                  to={categoryLink}
                  className={`inline-flex items-center gap-2 rounded-full border ${categoryAccent.border} bg-white px-5 py-2 text-sm font-semibold ${categoryAccent.text} transition hover:bg-white/80`}
                >
                  <span aria-hidden="true" className="text-base font-semibold">{'\u2190'}</span>
                  <span>More in {categoryDisplayName}</span>
                </Link>
              </div>

            </div>
          </article>

          {/* Enhanced Sidebar */}
          <aside className="mt-12 xl:mt-0 xl:w-1/3">
            <div className="sticky top-24 space-y-8">
              <DonationPlaceholder />
              
              {relatedArticles.length > 0 && (
                <div className="trending-widget">
                  <h3 className="trending-title">Trending Articles</h3>
                  <div className="trending-list">
                    {relatedArticles.map((relatedArticle) => {
                      const relatedMeta = resolveCategoryMeta(
                        relatedArticle.category && relatedArticle.category.slug
                          ? {
                              slug: slugify(relatedArticle.category.slug),
                              name: relatedArticle.category.name || relatedArticle.category_name || 'Trending',
                              parent_slug: relatedArticle.category.parent_slug ?? null,
                            }
                          : {
                              slug: slugify(relatedArticle.category_name),
                              name: relatedArticle.category_name || 'Trending',
                              parent_slug: null,
                            },
                      );
                      return (
                        <article key={relatedArticle.id} className="trending-item">
                          <Link to={`/article/${relatedArticle.slug}`} className="trending-link group">
                            <div className="trending-image-wrap">
                              <img
                                src={relatedArticle.featured_image_url || relatedArticle.featured_image || '/api/placeholder/420/240'}
                                alt={relatedArticle.title}
                                className="trending-image transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = '/api/placeholder/420/240';
                                }}
                              />
                            </div>
                            <div className="trending-meta">
                              <span className="trending-meta-pill">
                                {relatedMeta.topLevelName.toUpperCase()}
                              </span>
                              <span className="trending-meta-separator" aria-hidden="true">&bull;</span>
                              <span className="trending-meta-date">
                                {formatDate(relatedArticle.published_at || relatedArticle.created_at)}
                              </span>
                            </div>
                            <h4 className="trending-headline">
                              {relatedArticle.title}
                            </h4>
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default ArticleDetail;







