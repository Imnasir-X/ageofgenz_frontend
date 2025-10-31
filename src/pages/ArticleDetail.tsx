import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Reddit,
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
    try {
      const raw = window.localStorage.getItem('aoz_bookmarks');
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

  useEffect(() => {
    if (!showShareMenu) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showShareMenu]);

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
      const markerPattern = /<p>\s*\[\[key-takeaways\]\]\s*<\/p>([\s\S]*?)(<p>\s*\[\[\/key-takeaways\]\]\s*<\/p>)/i;

      let match = markerPattern.exec(updatedMarkup);
      while (match) {
        const innerContent = enhanceInlineMarkup(match[1].trim());
        const sectionHTML = `<section class="article-key-takeaways"><div class="article-key-takeaways__label">Key Takeaways</div><div class="article-key-takeaways__body">${innerContent}</div></section>`;
        updatedMarkup = updatedMarkup.replace(match[0], sectionHTML);
        match = markerPattern.exec(updatedMarkup);
      }

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

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrollableHeight = Math.max(documentHeight - windowHeight, 0);
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

      setReadingProgress(Math.min(100, Math.max(0, progress)));

      const shouldShow = scrollableHeight > 24;
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

            <aside className="lg:w-1/3 mt-8 lg:mt-0">
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
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Article Not Found</h1>
          <p className="mb-8 text-gray-600 text-lg">{error || 'This article is not available'}</p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-orange-300 px-8 py-3 text-orange-600 transition hover:bg-orange-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const articleUrl = `https://theageofgenz.com/article/${article.slug}`;
  const publishedDate = formatDate(article.published_at || article.created_at);
  const imageUrl = article.featured_image_url || article.featured_image || 'https://theageofgenz.com/og-image.jpg';
  const viewCount = article.view_count ?? article.views ?? null;
  const encodedShareUrl = encodeURIComponent(articleUrl);
  const encodedShareTitle = encodeURIComponent(article.title);
  const shareMenuItemClass =
    'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors';

  const shareLinks = [
    {
      name: 'Email',
      href: `mailto:?subject=${encodedShareTitle}&body=${encodedShareTitle}%0A%0A${encodedShareUrl}`,
      Icon: Mail,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      Icon: Facebook,
    },
    {
      name: 'Bluesky',
      href: `https://bsky.app/intent/compose?text=${encodedShareTitle}%20${encodedShareUrl}`,
      Icon: Bird,
    },
    {
      name: 'X',
      href: `https://x.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareTitle}`,
      Icon: XIcon,
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareTitle}`,
      Icon: Send,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
      Icon: Linkedin,
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedShareTitle}%20${encodedShareUrl}`,
      Icon: MessageCircle,
    },
    {
      name: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodedShareUrl}&title=${encodedShareTitle}`,
      Icon: Reddit,
    },
  ];

  const toggleBookmark = useCallback(() => {
    if (!slug || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem('aoz_bookmarks');
      const items: string[] = raw ? JSON.parse(raw) : [];
      let nextItems: string[];
      let nextState = false;

      if (items.includes(slug)) {
        nextItems = items.filter((entry) => entry !== slug);
      } else {
        nextItems = [...items, slug];
        nextState = true;
      }

      window.localStorage.setItem('aoz_bookmarks', JSON.stringify(nextItems));
      setIsBookmarked(nextState);
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  }, [slug]);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Breadcrumb Navigation */}
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        <div className="article-breadcrumb__inner">
          <ol className="article-breadcrumb__trail">
            <li className="article-breadcrumb__item">
              <Link to="/" className="article-breadcrumb__link">
                Home
              </Link>
            </li>
            {categoryBreadcrumbs.map((crumb, index) => (
              <li key={crumb.slug} className="article-breadcrumb__item">
                <span className="article-breadcrumb__separator" aria-hidden="true">
                  /
                </span>
                <Link to={`/category/${crumb.slug}`} className="article-breadcrumb__link">
                  {crumb.name}
                </Link>
              </li>
            ))}
            <li className="article-breadcrumb__item">
              <span className="article-breadcrumb__separator" aria-hidden="true">
                /
              </span>
              <span className="article-breadcrumb__link article-breadcrumb__link--muted">
                {publishedDate}
              </span>
            </li>
          </ol>
        </div>
      </nav>

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
                        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-haspopup="true"
                        aria-expanded={showShareMenu}
                        aria-controls="article-share-menu"
                        onClick={() => setShowShareMenu((prev) => !prev)}
                      >
                        <Share2 size={16} aria-hidden="true" />
                        <span>Share</span>
                      </button>
                      {showShareMenu && (
                        <div
                          id="article-share-menu"
                          role="menu"
                          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
                        >
                          <div className="border-b border-gray-100 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Share</p>
                            <p className="text-sm text-gray-500">Spread this story</p>
                          </div>
                          <button
                            type="button"
                            className={`${shareMenuItemClass} w-full text-left`}
                            onClick={() => {
                              void handleCopyShare();
                              setShowShareMenu(false);
                            }}
                          >
                            <Link2 size={16} className="text-gray-500" aria-hidden="true" />
                            <span>Copy link</span>
                          </button>
                          <div className="border-t border-gray-100">
                            {shareLinks.map(({ name, href, Icon }) => (
                              <a
                                key={name}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${shareMenuItemClass} block`}
                                onClick={() => setShowShareMenu(false)}
                              >
                                <Icon size={16} className="text-gray-500" aria-hidden="true" />
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
                <div className="article-share-wrap px-6 md:px-12 lg:px-14 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <span className="sr-only">Share this article</span>
                  <div className="article-share-grid flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-6">
                    {shareLinks.map(({ name, href, Icon }) => (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share on ${name}`}
                        className="article-share-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        <Icon className="article-share-icon" size={16} />
                        <span className="sr-only">Share on {name}</span>
                      </a>
                    ))}
                  </div>
                  <div className="article-share-copy md:flex md:items-center md:gap-3">
                    <button
                      type="button"
                      onClick={handleCopyShare}
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
                  <div className="flex items-start flex-wrap gap-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={18} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Related Topics:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-700 px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border border-gray-200 hover:border-orange-200"
                        >
                          #{tag}
                        </span>
                      ))}
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
          <aside className="xl:w-1/3 xl:mt-0">
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
  );
};

export default ArticleDetail;


