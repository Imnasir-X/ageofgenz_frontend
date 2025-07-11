import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import { getArticleBySlug, getArticles } from '../utils/api';
import DonationPlaceholder from '../components/DonationPlaceholder';
import SocialShare from '../components/SocialShare';
import { Clock, Eye, User, Calendar, Tag, BookOpen } from 'lucide-react';
import { Article } from '../types';

// Cache for articles to avoid refetching
const articleCache = new Map<string, Article>();
const relatedCache = new Map<string, Article[]>();

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);

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
    const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words/minute
  }, [article?.content]);

  // Enhanced content formatter with pull quote detection
  const formattedContent = useMemo(() => {
    if (!article?.content) return { __html: '<p class="text-gray-600">No content available.</p>' };
    
    let content = article.content;
    
    // If content already has HTML tags, enhance it
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<h')) {
      // Auto-detect and convert pull quotes
      content = content.replace(
        /<p>["']([^"']{50,200})["']<\/p>/g, 
        '<div class="pullquote">$1</div>'
      );
      
      // Ensure proper spacing and hierarchy
      content = content.replace(/<p>\s*<\/p>/g, ''); // Remove empty paragraphs
      
      return { __html: content };
    }
    
    // Convert plain text to HTML with enhanced formatting
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    const formatted = paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      // Detect pull quotes (text in quotes that's 50-200 chars)
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        const text = trimmed.slice(1, -1);
        if (text.length >= 50 && text.length <= 200) {
          return `<div class="pullquote">${text}</div>`;
        }
      }
      
      // Handle different paragraph types
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        // Bold paragraphs as subheadings
        const text = trimmed.slice(2, -2);
        return `<h3>${text}</h3>`;
      }
      
      if (trimmed.startsWith('> ')) {
        // Quote blocks
        const text = trimmed.slice(2);
        return `<blockquote>${text}</blockquote>`;
      }
      
      // Regular paragraphs
      return `<p>${trimmed}</p>`;
    }).join('');
    
    return { __html: formatted };
  }, [article?.content]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate progress as percentage
      const scrollableHeight = documentHeight - windowHeight;
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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

        // Check cache first
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

        // Parallel API calls
        const [articleResponse, allArticlesResponse] = await Promise.all([
          getArticleBySlug(slug),
          cachedRelated ? Promise.resolve({ data: { results: [] } }) : getArticles()
        ]);

        const articleData = articleResponse.data;
        setArticle(articleData);
        articleCache.set(slug, articleData);

        // Handle related articles
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
        {/* Fixed reading progress bar */}
        <div className="reading-progress">
          <div className="reading-progress-bar" style={{ width: '0%' }}></div>
        </div>

        {/* Fixed breadcrumb */}
        <nav className="breadcrumb-nav">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-gray-400">›</span>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-gray-400">›</span>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 article-container-web max-w-6xl">
          <div className="lg:flex lg:gap-12">
            {/* Main content skeleton */}
            <article className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm article-content-web animate-pulse space-y-4">
                <div className="w-24 h-6 bg-orange-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-full h-8 bg-gray-200 rounded"></div>
                  <div className="w-4/5 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
                <div className="article-byline bg-gray-100 rounded-lg">
                  <div className="flex gap-6 py-3">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="reading-width mx-auto">
                  <div className="w-full aspect-[16/10] bg-gray-200 rounded-xl"></div>
                </div>
                <div className="reading-width mx-auto space-y-3 pt-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`bg-gray-200 rounded h-4 ${
                      i === 1 ? 'w-11/12' : i === 3 ? 'w-4/5' : i === 5 ? 'w-3/4' : 'w-full'
                    }`}></div>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar skeleton */}
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
            className="inline-flex items-center btn-primary px-8 py-3 rounded-lg font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const articleUrl = `https://theageofgenz.com/article/${article.slug}`;
  const publishedDate = formatDate(article.published_at || article.created_at);
  const imageUrl = article.featured_image_url || article.featured_image || 'https://theageofgenz.com/og-image.jpg';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced SEO and Social Meta Tags */}
      <Helmet>
        <title>{article.title} - The Age of GenZ</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta name="keywords" content={`${article.category?.name || 'news'}, gen z, ${article.tags?.join(', ') || 'trending'}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="The Age of GenZ" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || article.title} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:domain" content="theageofgenz.com" />
        
        {/* Article specific */}
        <meta property="article:published_time" content={article.published_at || article.created_at} />
        <meta property="article:modified_time" content={article.updated_at || article.created_at} />
        <meta property="article:author" content={article.author?.name || 'The Age Of GenZ'} />
        <meta property="article:section" content={article.category?.name || 'News'} />
        {article.tags?.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Schema.org JSON-LD */}
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

      {/* Fixed reading progress bar - no white bar issue */}
      <div className="reading-progress">
        <div 
          className="reading-progress-bar" 
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Fixed Breadcrumb Navigation - transparent background */}
      <nav className="breadcrumb-nav">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="nav-link">Home</Link>
            <span className="text-gray-400">›</span>
            <Link to={`/${article.category?.slug}`} className="nav-link">
              {article.category?.name || 'Uncategorized'}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 truncate max-w-xs font-medium">
              {article.title}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 article-container-web max-w-6xl">
        <div className="lg:flex lg:gap-12">
          {/* Main Article Content - Compact Layout */}
          <article className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm article-content-web">
              {/* Compact Article Header */}
              <header className="article-header-compact">
                {/* Category Badge */}
                <div className="mb-4">
                  <Link 
                    to={`/${article.category?.slug}`}
                    className="inline-flex items-center bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    {article.category?.name || 'Uncategorized'}
                  </Link>
                </div>
                
                {/* Article Title */}
                <h1 className="article-title">
                  {article.title}
                </h1>
                
                {/* Article Subtitle/Excerpt */}
                {article.excerpt && (
                  <div className="article-subtitle">
                    {article.excerpt}
                  </div>
                )}
              </header>

              {/* COMPACT ARTICLE BYLINE */}
              <div className="article-byline reading-width mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-orange-500" />
                      <span className="author-name">{article.author?.name || 'The Age of GenZ'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="publish-date">{publishedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-gray-400" />
                      <span className="read-time">{estimatedReadTime} min read</span>
                    </div>
                    {article.view_count !== undefined && (
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-gray-400" />
                        <span className="read-time">{article.view_count} views</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Image - Compact Spacing */}
              {(article.featured_image_url || article.featured_image) && (
                <div className="featured-image-compact reading-width mx-auto">
                  <figure className="relative">
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gray-200 rounded-xl animate-pulse aspect-[16/10]"></div>
                    )}
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className={`w-full aspect-[16/10] object-cover rounded-xl shadow-lg transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        console.error('Featured image failed to load');
                        e.currentTarget.src = '/api/placeholder/800/450';
                      }}
                      loading="eager"
                    />
                  </figure>
                </div>
              )}

              {/* Article Content with Perfect Typography */}
              <div className="reading-width mx-auto">
                <div 
                  className="article-content article-typography"
                  dangerouslySetInnerHTML={formattedContent}
                />
              </div>

              {/* Tags - Compact */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 reading-width mx-auto">
                  <div className="flex items-start flex-wrap gap-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Topics:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border border-gray-200 hover:border-orange-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Share - Compact */}
              <div className="mt-8 pt-6 border-t border-gray-200 reading-width mx-auto">
                <SocialShare
                  url={articleUrl}
                  title={article.title}
                  description={article.excerpt || ''}
                  hashtags={article.tags}
                />
              </div>
            </div>
          </article>

          {/* Enhanced Sidebar */}
          <aside className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-20 space-y-6">
              {/* Donation Component */}
              <DonationPlaceholder />
              
              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold mb-4 pb-2 border-b-2 border-orange-500 text-gray-900">
                    More in {article.category?.name}
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <article key={relatedArticle.id} className="group">
                        <Link to={`/article/${relatedArticle.slug}`} className="block">
                          <div className="flex gap-3">
                            {(relatedArticle.featured_image_url || relatedArticle.featured_image) && (
                              <div className="flex-shrink-0">
                                <img
                                  src={relatedArticle.featured_image_url || relatedArticle.featured_image || '/api/placeholder/80/80'}
                                  alt={relatedArticle.title}
                                  className="w-16 h-16 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/80/80';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="article-card-title text-sm mb-1 line-clamp-3 group-hover:text-orange-600 transition-colors">
                                {relatedArticle.title}
                              </h4>
                              <div className="article-card-meta text-xs">
                                {formatDate(relatedArticle.published_at || relatedArticle.created_at)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                <p className="text-orange-100 mb-4 text-sm">Get the latest Gen Z news delivered straight to your inbox.</p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all text-sm"
                  />
                  <button className="w-full bg-white text-orange-600 py-2.5 rounded-lg font-medium hover:bg-orange-50 transition-colors shadow-sm text-sm">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;