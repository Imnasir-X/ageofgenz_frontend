import React, { useEffect, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import { getArticleBySlug, getArticles } from '../utils/api';
import DonationPlaceholder from '../components/DonationPlaceholder';
import { Eye, Calendar, Tag, BookOpen, Facebook, Mail, Link2, Linkedin, MessageCircle } from 'lucide-react';
import { Article } from '../types';

// Cache for articles to avoid refetching
const articleCache = new Map<string, Article>();
const relatedCache = new Map<string, Article[]>();

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
  const [sidebarReady, setSidebarReady] = useState<boolean>(false);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const activeTocRef = React.useRef<string>('');

  const sidebarTriggerRef = React.useRef<HTMLDivElement | null>(null);
  const copyTimeoutRef = React.useRef<number | null>(null);
  const sidebarObserverRef = React.useRef<IntersectionObserver | null>(null);

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
  const processedContent = useMemo(() => {
    if (!article?.content) {
      return { html: '<p class="text-gray-600">No content available.</p>', toc: [] as Array<{ id: string; text: string; level: number }> };
    }

    try {
      const slugify = (text: string) =>
        text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

      const seenIds = new Map<string, number>();
      const tocEntries: Array<{ id: string; text: string; level: number }> = [];

      const applyTextHighlights = (markup: string) =>
        markup.replace(/==([\s\S]+?)==/g, (_match, text) => `<mark>${text.trim()}</mark>`);

      const applyStatHighlights = (markup: string) =>
        markup.replace(/%%([\s\S]+?)%%/g, (_match, text) => `<span class="article-stat-highlight">${text.trim()}</span>`);

      const enhanceInlineMarkup = (markup: string) => applyTextHighlights(applyStatHighlights(markup));

      const createHeading = (tag: 'h2' | 'h3', attrs: string, body: string) => {
        const clean = body.replace(/<[^>]+>/g, '').trim();
        const attrString = attrs?.trim();
        const existingIdMatch = attrString?.match(/id\s*=\s*["']([^"']+)["']/i);
        const existingId = existingIdMatch?.[1];
        const attributes = attrString ? ` ${attrString}` : '';
        if (!clean) return `<${tag}${attributes}>${body}</${tag}>`;

        if (existingId) {
          tocEntries.push({ id: existingId, text: clean, level: tag === 'h2' ? 2 : 3 });
          return `<${tag}${attributes}>${body}</${tag}>`;
        }

        let baseId = slugify(clean);
        if (!baseId) baseId = `${tag}-${tocEntries.length}`;
        const count = seenIds.get(baseId) ?? 0;
        const generatedId = count === 0 ? baseId : `${baseId}-${count + 1}`;
        seenIds.set(baseId, count + 1);
        tocEntries.push({ id: generatedId, text: clean, level: tag === 'h2' ? 2 : 3 });
        return `<${tag}${attributes} id="${generatedId}">${body}</${tag}>`;
      };

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
          return `<div class="article-pullquote">${enhanceInlineMarkup(quote)}</div>`;
        });

      const ensureLazyImages = (markup: string) =>
        markup.replace(/<img([^>]*)>/gi, (match, attrs) => {
          if (/loading\s*=/.test(attrs)) {
            return match;
          }
          return `<img${attrs} loading="lazy">`;
        });

      const attachHeadingIds = (markup: string) =>
        markup
          .replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_match, attrs, body) => createHeading('h2', attrs, body))
          .replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/gi, (_match, attrs, body) => createHeading('h3', attrs, body));

      const htmlPattern = /<(p|br|h[1-6]|ul|ol|blockquote|figure|pre|code|img)/i;

      if (htmlPattern.test(article.content)) {
        let content = article.content.trim();
        content = content.replace(/<p>\s*<\/p>/gi, '');
        content = transformPullQuotes(content);
        content = ensureLazyImages(content);
        content = transformInfoBoxes(content);
        content = transformKeyTakeaways(content);
        content = enhanceInlineMarkup(content);
        content = attachHeadingIds(content);
        return { html: content, toc: tocEntries };
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
          const body = enhanceInlineMarkup(normalised.slice(2, -2));
          htmlPieces.push(createHeading('h3', '', body));
          return;
        }

        htmlPieces.push(`<p>${enhanceInlineMarkup(normalised)}</p>`);
      });

      if (collectingTakeaways) {
        pushTakeawaySection();
      }

      const html = attachHeadingIds(htmlPieces.join(''));
      return { html, toc: tocEntries };
    } catch (err) {
      console.error('Failed to process article content', err);
      return { html: article.content, toc: [] as Array<{ id: string; text: string; level: number }> };
    }
  }, [article?.content]);

  const formattedContent = useMemo(() => ({ __html: processedContent.html }), [processedContent.html]);
  const tableOfContents = processedContent.toc;

  useEffect(() => {
    if (!tableOfContents.length) {
      if (activeTocRef.current !== '') {
        activeTocRef.current = '';
        setActiveTocId('');
      }
      return;
    }
    const firstId = tableOfContents[0]?.id;
    if (firstId && activeTocRef.current !== firstId) {
      activeTocRef.current = firstId;
      setActiveTocId(firstId);
    }
  }, [processedContent.html, tableOfContents.length]);

  // Reading progress tracking + active TOC highlight
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getHeadings = () =>
      Array.from(document.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    let headingElements = getHeadings();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = Math.max(documentHeight - windowHeight, 0);
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      const shouldShow = scrollableHeight > 160;
      setShowProgressBar(prev => (prev !== shouldShow ? shouldShow : prev));

      // Update active heading
      if (!headingElements.length) {
        headingElements = getHeadings();
      }
      const offset = 140;
      let currentId = '';
      for (const heading of headingElements) {
        if (heading.offsetTop - offset <= scrollTop) {
          currentId = heading.id;
        } else {
          break;
        }
      }
      if (currentId && currentId !== activeTocRef.current) {
        activeTocRef.current = currentId;
        setActiveTocId(currentId);
      }
    };

    const handleResize = () => {
      headingElements = getHeadings();
      handleScroll();
    };

    handleResize();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [processedContent.html]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setSidebarReady(true);
      return;
    }

    if (window.innerWidth >= 1024) {
      setSidebarReady(true);
      return;
    }

    const trigger = sidebarTriggerRef.current;
    if (!trigger) {
      setSidebarReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setSidebarReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(trigger);
    sidebarObserverRef.current = observer;

    return () => observer.disconnect();
  }, [processedContent.html]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarReady(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
  const shareLinks = [
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      Icon: Facebook,
    },
    {
      name: 'X',
      href: `https://x.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareTitle}`,
      Icon: XIcon,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
      Icon: Linkedin,
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedShareTitle}&body=${encodedShareTitle}%0A%0A${encodedShareUrl}`,
      Icon: Mail,
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedShareTitle}%20${encodedShareUrl}`,
      Icon: MessageCircle,
    },
  ];

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopySuccess(true);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced SEO and Social Meta Tags */}
      <Helmet>
        <title>{article.title} - The Age of GenZ</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta name="keywords" content={`${article.category?.name || 'news'}, gen z, ${article.tags?.join(', ') || 'trending'}`} />
        
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
        <meta property="article:section" content={article.category?.name || 'News'} />
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
            className="h-full bg-orange-500 transition-all duration-300" 
            style={{ width: `${readingProgress}%` }}
          ></div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="article-breadcrumb">
        <div className="article-breadcrumb__inner">
          <div className="article-breadcrumb__trail" aria-label="Breadcrumb">
            <Link
              to={`/${article.category?.slug || ''}`}
              className="article-breadcrumb__category"
            >
              {(article.category?.name || 'News').toUpperCase()}
            </Link>
            <span className="article-breadcrumb__separator" aria-hidden="true">
              &bull;
            </span>
            <span className="article-breadcrumb__date">
              {publishedDate}
            </span>
            <span className="article-breadcrumb__separator" aria-hidden="true">
              &bull;
            </span>
            <Link to="/" className="article-breadcrumb__brand">
              TheAgeOfGenZ.com
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-5 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
        <div className="space-y-12 xl:flex xl:gap-12 xl:space-y-0">
          {/* Main Article Content */}
          <article className="xl:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm px-6 py-8 md:px-12 md:py-12 lg:px-14 lg:py-16">
              {/* Article Header */}
              <header className="mb-12">
                <div className="mb-5 text-xs sm:text-sm uppercase tracking-[0.28em] text-orange-600 font-semibold flex flex-wrap items-center gap-3">
                  <Link
                    to={`/${article.category?.slug}`}
                    className="hover:text-orange-500 hover:underline transition-colors"
                  >
                    {article.category?.name || 'News'}
                  </Link>
                  <span className="text-gray-400" aria-hidden="true">&bull;</span>
                  <span className="text-gray-500">{publishedDate}</span>
                  <span className="text-gray-400" aria-hidden="true">&bull;</span>
                  <span className="text-gray-500">The Age of GenZ</span>
                </div>
                
                {/* Article Title */}
                <h1 className="article-title text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                  {article.title}
                </h1>
                
                {/* Article Subtitle/Excerpt */}
                {article.excerpt && (
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed tracking-[0.01em] mb-10 max-w-2xl">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={16} className="text-orange-500" aria-hidden="true" />
                    <span>{estimatedReadTime} min read</span>
                  </span>
                  {viewCount !== null && (
                    <span className="inline-flex items-center gap-1">
                      <Eye size={16} className="text-orange-400" aria-hidden="true" />
                      <span>{viewCount.toLocaleString()} views</span>
                    </span>
                  )}
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
                      alt={article.title}
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
                <div className="article-share-wrap px-6 md:px-12 lg:px-14">
                  <span className="sr-only">Share this article</span>
                  <div className="article-share-grid flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-4">
                    {shareLinks.map(({ name, href, Icon }) => (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share on ${name}`}
                        className="article-share-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400"
                        tabIndex={0}
                      >
                        <Icon className="article-share-icon" />
                        <span className="sr-only">Share on {name}</span>
                      </a>
                    ))}
                    <div className="article-share-copy">
                      <button
                        type="button"
                        onClick={handleCopyShare}
                        aria-label="Copy article link"
                        className={`article-share-button article-share-button--copy ${copySuccess ? 'is-success' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400`}
                      >
                        <Link2 className="article-share-icon" />
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
                  to={`/${article.category?.slug || ''}`}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-5 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 hover:text-orange-700"
                >
                  <span aria-hidden="true">←</span>
                  <span>More in {article.category?.name || 'News'}</span>
                </Link>
              </div>

            </div>
          </article>

          <div ref={sidebarTriggerRef} className="xl:hidden h-1 w-full" aria-hidden="true" />

          {/* Enhanced Sidebar */}
          <aside className="xl:w-1/3 xl:mt-0">
            <div className="sticky top-24 space-y-8 lg:rounded-2xl lg:bg-white/80 lg:shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:backdrop-blur-lg lg:p-6 transition-shadow duration-300">
              {tableOfContents.length > 0 && (
                <nav aria-label="Table of contents" className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                    On this page
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {tableOfContents.map((entry) => (
                      <li key={entry.id} className={entry.level === 3 ? 'ml-3' : ''}>
                        <a
                          href={`#${entry.id}`}
                          onClick={() => {
                            activeTocRef.current = entry.id;
                            setActiveTocId(entry.id);
                          }}
                          className={`group inline-flex items-center gap-2 rounded-md px-2 py-1 transition-colors ${
                            activeTocId === entry.id ? 'text-orange-600 font-semibold' : 'hover:text-orange-600'
                          }`}
                          aria-current={activeTocId === entry.id ? 'true' : undefined}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              activeTocId === entry.id ? 'bg-orange-500' : 'bg-gray-300 group-hover:bg-orange-300'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="leading-snug">{entry.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <DonationPlaceholder />
              
              {relatedArticles.length > 0 && (
                <div className="trending-widget">
                  <h3 className="trending-title">Trending Articles</h3>
                  {sidebarReady ? (
                    <div className="trending-list">
                      {relatedArticles.map((relatedArticle) => (
                        <article key={relatedArticle.id} className="trending-item">
                          <Link to={`/article/${relatedArticle.slug}`} className="trending-link group block rounded-2xl border border-gray-100 bg-white/80 p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div className="trending-image-wrap relative overflow-hidden rounded-xl">
                              <img
                                src={relatedArticle.featured_image_url || relatedArticle.featured_image || '/api/placeholder/420/240'}
                                alt={relatedArticle.title}
                                className="trending-image h-44 w-full object-cover transition duration-300 group-hover:opacity-80"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = '/api/placeholder/420/240';
                                }}
                              />
                              <div className="pointer-events-none absolute inset-0 bg-slate-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            </div>
                            <div className="trending-meta mt-3 flex items-center gap-2 text-xs text-gray-500">
                              <span className="trending-meta-pill font-semibold text-orange-600">
                                {relatedArticle.category?.name?.toUpperCase() || 'TRENDING'}
                              </span>
                              <span className="trending-meta-separator hidden sm:inline-flex" aria-hidden="true">•</span>
                              <span className="trending-meta-date uppercase tracking-wide text-gray-400">
                                {formatDate(relatedArticle.published_at || relatedArticle.created_at)}
                              </span>
                            </div>
                            <h4 className="trending-headline mt-2 text-base font-semibold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                              {relatedArticle.title}
                            </h4>
                          </Link>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-2xl border border-dashed border-gray-200 bg-white/70 p-4 text-sm text-gray-500">
                      <p>Loading recommendations…</p>
                      <div className="space-y-2">
                        <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
                        <div className="h-3 w-2/4 rounded bg-gray-200 animate-pulse" />
                        <div className="h-3 w-4/5 rounded bg-gray-200 animate-pulse" />
                      </div>
                    </div>
                  )}
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
