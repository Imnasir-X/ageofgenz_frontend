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

  // ✅ FIXED: Enhanced content formatter with proper spacing
  const formattedContent = useMemo(() => {
    if (!article?.content) return { __html: '<p class="text-gray-600">No content available.</p>' };
    
    let content = article.content.trim();
    
    // Handle HTML content properly with enhanced spacing
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<h')) {
      // Clean up and enhance existing HTML
      content = content
        // Remove empty paragraphs
        .replace(/<p>\s*<\/p>/g, '')
        // Ensure proper paragraph spacing with inline styles
        .replace(/<p>/g, '<p style="margin-bottom: 1.75rem !important; line-height: 1.7; font-size: 1.125rem; color: #374151;">')
        .replace(/<p([^>]*)>/g, '<p$1 style="margin-bottom: 1.75rem !important; line-height: 1.7; font-size: 1.125rem; color: #374151;">')
        
        // Enhanced heading spacing
        .replace(/<h2>/g, '<h2 style="margin-top: 3rem !important; margin-bottom: 1.5rem !important; font-size: 2rem; font-weight: 700; color: #111827; border-top: 1px solid #e5e7eb; padding-top: 2rem;">')
        .replace(/<h3>/g, '<h3 style="margin-top: 2rem !important; margin-bottom: 1rem !important; font-size: 1.5rem; font-weight: 600; color: #1f2937;">')
        
        // Enhanced blockquotes
        .replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #f97316; padding-left: 1.5rem; margin: 2rem 0 !important; font-style: italic; color: #4b5563; font-size: 1.25rem; background: #fef3f2; padding: 1.5rem; border-radius: 0 8px 8px 0;">')
        
        // Enhanced lists
        .replace(/<ul>/g, '<ul style="margin: 1.5rem 0 !important; padding-left: 2rem; color: #374151;">')
        .replace(/<ol>/g, '<ol style="margin: 1.5rem 0 !important; padding-left: 2rem; color: #374151;">')
        .replace(/<li>/g, '<li style="margin-bottom: 0.5rem !important; line-height: 1.6; color: #374151;">')
        
        // Auto-detect pull quotes
        .replace(
          /<p[^>]*>["']([^"']{50,200})["']<\/p>/g, 
          '<div class="pullquote" style="font-size: 1.75rem; font-weight: 500; text-align: center; margin: 3rem auto; padding: 2rem; border-top: 3px solid #f97316; border-bottom: 3px solid #f97316; background: #fef3f2; border-radius: 12px; max-width: 90%; line-height: 1.4; color: #1f2937;">$1</div>'
        );
      
      return { __html: content };
    }
    
    // Handle plain text with proper spacing
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    const formatted = paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (!trimmed) return '';
      
      // Detect pull quotes
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        const text = trimmed.slice(1, -1);
        if (text.length >= 50 && text.length <= 200) {
          return `<div class="pullquote" style="font-size: 1.75rem; font-weight: 500; text-align: center; margin: 3rem auto; padding: 2rem; border-top: 3px solid #f97316; border-bottom: 3px solid #f97316; background: #fef3f2; border-radius: 12px; max-width: 90%; line-height: 1.4; color: #1f2937;">${text}</div>`;
        }
      }
      
      // Handle different paragraph types
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const text = trimmed.slice(2, -2);
        return `<h3 style="margin-top: 2rem !important; margin-bottom: 1rem !important; font-size: 1.5rem; font-weight: 600; color: #1f2937;">${text}</h3>`;
      }
      
      if (trimmed.startsWith('> ')) {
        const text = trimmed.slice(2);
        return `<blockquote style="border-left: 4px solid #f97316; padding-left: 1.5rem; margin: 2rem 0 !important; font-style: italic; color: #4b5563; font-size: 1.25rem; background: #fef3f2; padding: 1.5rem; border-radius: 0 8px 8px 0;">${text}</blockquote>`;
      }
      
      // Regular paragraphs with proper spacing
      return `<p style="margin-bottom: 1.75rem !important; line-height: 1.7; font-size: 1.125rem; color: #374151;">${trimmed}</p>`;
    }).filter(p => p.length > 0).join('');
    
    return { __html: formatted };
  }, [article?.content]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
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
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-gray-400">›</span>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-gray-400">›</span>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
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
        
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        <meta property="og:image" content={imageUrl} />
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
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-orange-500 transition-all duration-300" 
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <span className="text-gray-400">›</span>
            <Link to={`/${article.category?.slug}`} className="hover:text-orange-500 transition-colors">
              {article.category?.name || 'Uncategorized'}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 truncate max-w-xs font-medium">
              {article.title}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="lg:flex lg:gap-12">
          {/* Main Article Content */}
          <article className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 lg:p-12">
              {/* Article Header */}
              <header className="mb-8">
                {/* Category Badge */}
                <div className="mb-4 md:mb-6">
                  <Link 
                    to={`/${article.category?.slug}`}
                    className="inline-flex items-center bg-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    {article.category?.name || 'Uncategorized'}
                  </Link>
                </div>
                
                {/* Article Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight text-gray-900">
                  {article.title}
                </h1>
                
                {/* Article Subtitle/Excerpt */}
                {article.excerpt && (
                  <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                {/* ✅ FIXED: Clean, Professional Article Meta - Mobile Responsive */}
                <div className="py-4 border-t border-b border-gray-200 bg-gray-50 rounded-lg px-4">
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-orange-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {article.author?.name || 'The Age of GenZ'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{publishedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <BookOpen size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{estimatedReadTime} min read</span>
                      </div>
                      {article.view_count !== undefined && (
                        <div className="flex items-center space-x-2">
                          <Eye size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{article.view_count} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Layout - Clean & Compact */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-orange-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {article.author?.name || 'The Age of GenZ'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{estimatedReadTime} min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span>{publishedDate}</span>
                      </div>
                      {article.view_count !== undefined && (
                        <div className="flex items-center space-x-2">
                          <Eye size={16} className="text-gray-500" />
                          <span>{article.view_count} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              {(article.featured_image_url || article.featured_image) && (
                <div className="mb-6 md:mb-10">
                  <figure className="relative">
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gray-200 rounded-lg md:rounded-xl animate-pulse aspect-[16/10]"></div>
                    )}
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className={`w-full aspect-[16/10] object-cover rounded-lg md:rounded-xl shadow-lg transition-opacity duration-500 ${
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

              {/* ✅ FIXED: Article Content with Enhanced Mobile Spacing */}
              <div className="max-w-none">
                <div 
                  className="prose prose-lg prose-article max-w-none article-content-container"
                  style={{ 
                    color: '#1f2937',
                    maxWidth: 'none',
                    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', // Responsive font size
                    lineHeight: '1.7'
                  }}
                  dangerouslySetInnerHTML={formattedContent}
                />
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
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

              {/* Social Share */}
              <div className="mt-10 pt-8 border-t border-gray-200">
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
          <aside className="lg:w-1/3 mt-12 lg:mt-0">
            <div className="sticky top-24 space-y-8">
              <DonationPlaceholder />
              
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-6 pb-3 border-b-2 border-orange-500 text-gray-900">
                    More in {article.category?.name}
                  </h3>
                  <div className="space-y-6">
                    {relatedArticles.map((relatedArticle) => (
                      <article key={relatedArticle.id} className="group">
                        <Link to={`/article/${relatedArticle.slug}`} className="block">
                          <div className="flex gap-4">
                            {(relatedArticle.featured_image_url || relatedArticle.featured_image) && (
                              <div className="flex-shrink-0">
                                <img
                                  src={relatedArticle.featured_image_url || relatedArticle.featured_image || '/api/placeholder/80/80'}
                                  alt={relatedArticle.title}
                                  className="w-20 h-20 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/80/80';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-2 line-clamp-3 group-hover:text-orange-600 transition-colors text-gray-900">
                                {relatedArticle.title}
                              </h4>
                              <div className="text-xs text-gray-500">
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;