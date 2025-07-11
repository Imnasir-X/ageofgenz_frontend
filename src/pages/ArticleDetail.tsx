import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import { getArticleBySlug, getArticles } from '../utils/api';
import DonationPlaceholder from '../components/DonationPlaceholder';
import SocialShare from '../components/SocialShare';
import { Clock, Eye, User, Calendar, Tag } from 'lucide-react';
import { Article } from '../types';

// Cache for articles to avoid refetching - NOW USING SLUG AS KEY
const articleCache = new Map<string, Article>();
const relatedCache = new Map<string, Article[]>();

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

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

  // Enhanced content formatter with professional media styling
  const formattedContent = useMemo(() => {
    if (!article?.content) return { __html: '<p>No content available.</p>' };
    
    const content = article.content;
    
    // Professional media formatting
    if (content.includes('<p>') || content.includes('<br')) {
      return { 
        __html: content
          .replace(/<p>/g, '<p class="mb-6 text-lg leading-relaxed text-gray-800">')
          .replace(/<h2>/g, '<h2 class="text-3xl font-bold mt-12 mb-6 text-gray-900 border-t pt-8">')
          .replace(/<h3>/g, '<h3 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">')
          .replace(/<ul>/g, '<ul class="list-disc list-inside mb-6 ml-6 space-y-3 text-lg text-gray-800">')
          .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-6 ml-6 space-y-3 text-lg text-gray-800">')
          .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-orange-500 pl-6 my-8 text-lg italic text-gray-700">')
      };
    }
    
    // Convert plain text to professionally formatted paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    const formatted = paragraphs.map((paragraph, index) => {
      // First paragraph gets special treatment (lead paragraph)
      if (index === 0) {
        return `<p class="mb-8 text-xl leading-relaxed text-gray-800 font-medium first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3">${paragraph.trim()}</p>`;
      }
      
      // Add visual break after every 3-4 paragraphs
      if (index > 0 && index % 4 === 0) {
        return `<div class="my-12 text-center">• • •</div><p class="mb-6 text-lg leading-relaxed text-gray-800">${paragraph.trim()}</p>`;
      }
      
      return `<p class="mb-6 text-lg leading-relaxed text-gray-800">${paragraph.trim()}</p>`;
    }).join('');
    
    return { __html: formatted };
  }, [article?.content]);

  // Optimized fetch function with caching and parallel requests - FIXED FOR SLUG
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

        // Check cache first - USING SLUG AS KEY
        const cachedArticle = articleCache.get(slug);
        const cacheKey = slug;
        const cachedRelated = relatedCache.get(cacheKey);

        if (cachedArticle && cachedRelated) {
          // ⚡ INSTANT LOAD from cache
          setArticle(cachedArticle);
          setRelatedArticles(cachedRelated);
          setLoading(false);
          
          // Update page metadata immediately
          document.title = `${cachedArticle.title} - The Age of GenZ`;
          window.scrollTo(0, 0);
          return;
        }

        // ⚡ PARALLEL API CALLS - Using slug instead of id
        const [articleResponse, allArticlesResponse] = await Promise.all([
          getArticleBySlug(slug),
          cachedRelated ? Promise.resolve({ data: { results: [] } }) : getArticles()
        ]);

        const articleData = articleResponse.data;
        setArticle(articleData);

        // Cache the article immediately - USING SLUG AS KEY
        articleCache.set(slug, articleData);

        // Handle related articles
        if (!cachedRelated) {
          const related = (allArticlesResponse.data.results || [])
            .filter((a: Article) => 
              a.category?.slug === articleData.category?.slug && 
              a.slug !== slug  // COMPARE BY SLUG INSTEAD OF ID
            )
            .slice(0, 4);
          
          setRelatedArticles(related);
          relatedCache.set(cacheKey, related);
        } else {
          setRelatedArticles(cachedRelated);
        }

        // Update page metadata
        document.title = `${articleData.title} - The Age of GenZ`;
        window.scrollTo(0, 0);
        
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Could not load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]); // DEPENDENCY CHANGED FROM articleId TO slug

  // ⚡ INSTANT SKELETON LOADER - Show structure immediately
  if (loading && !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              <span>›</span>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <span>›</span>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="lg:flex lg:gap-8">
            <article className="lg:w-8/12 bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <div className="animate-pulse">
                <div className="w-24 h-6 bg-orange-200 rounded-full mb-4"></div>
                <div className="w-full h-12 bg-gray-200 rounded mb-4"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded mb-6"></div>
                <div className="w-full aspect-[16/10] bg-gray-200 rounded-lg mb-8"></div>
                <div className="space-y-4">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                  <div className="w-4/5 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </article>
            <aside className="lg:w-4/12 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
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
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="mb-6 text-gray-600">{error || 'This article is not available'}</p>
        <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  // FIXED: USE SLUG FOR URL GENERATION
  const articleUrl = `https://theageofgenz.com/article/${article.slug}`;
  const publishedDate = formatDate(article.published_at || article.created_at);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced META TAGS FOR RICH PREVIEWS */}
      <Helmet>
        <title>{article.title} - The Age of GenZ</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta property="og:site_name" content="The Age of GenZ" />
        <meta name="twitter:site" content="@TheAgeOfGenZ" />

        {/* Open Graph Meta Tags for Rich Previews */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        <meta property="og:image" content={article.featured_image_url || article.featured_image || `https://theageofgenz.com/default-og-image.jpg`} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || article.title} />
        <meta name="twitter:image" content={article.featured_image_url || article.featured_image || `https://theageofgenz.com/default-og-image.jpg`} />
        
        {/* Article Specific Meta Tags */}
        <meta property="article:published_time" content={article.published_at || article.created_at} />
        <meta property="article:author" content={article.author?.name || 'The Age Of GenZ'} />
        <meta property="article:section" content={article.category?.name || 'News'} />
        {article.tags && article.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
      </Helmet>

      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <span>›</span>
            <Link to={`/${article.category?.slug}`} className="hover:text-orange-500 transition-colors">
              {article.category?.name || 'Uncategorized'}
            </Link>
            <span>›</span>
            <span className="text-gray-900 truncate max-w-xs">
              {article.title}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="lg:flex lg:gap-8">
          {/* Main Content */}
          <article className="lg:w-8/12 bg-white rounded-lg shadow-sm p-6 lg:p-8">
            {/* Article Header */}
            <header className="mb-6">
              <div className="mb-4">
                <Link 
                  to={`/${article.category?.slug}`}
                  className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  {article.category?.name || 'Uncategorized'}
                </Link>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-900">
                {article.title}
              </h1>
              
              {article.excerpt && (
                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-4 border-b">
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span>{article.author?.name || 'The Age of GenZ'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>{publishedDate}</span>
                </div>
                <div className="flex items-center">
                  <Eye size={16} className="mr-2" />
                  <span>{article.view_count || 0} views</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span>{article.estimated_read_time || 5} min read</span>
                </div>
              </div>
            </header>

            {/* ⚡ OPTIMIZED Featured Image - Progressive loading */}
            {(article.featured_image_url || article.featured_image) && (
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="relative">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse aspect-[16/10]"></div>
                  )}
                  <img
                    src={article.featured_image_url || article.featured_image || '/api/placeholder/400/250'}
                    alt={article.title}
                    className={`w-full aspect-[16/10] object-cover rounded-lg shadow-sm transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    loading="eager" // Load featured image immediately
                  />
                </div>
              </div>
            )}

            {/* ⚡ ENHANCED Article Content - Professional formatting */}
            <div 
              className="prose prose-lg prose-article max-w-none mb-8"
              dangerouslySetInnerHTML={formattedContent}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag size={16} className="text-gray-500" />
                  {article.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <SocialShare
              url={articleUrl}
              title={article.title}
              description={article.excerpt || ''}
              hashtags={article.tags}
            />
          </article>

          {/* Sidebar */}
          <aside className="lg:w-4/12 mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              {/* Donation */}
              <DonationPlaceholder />
              
              {/* ⚡ OPTIMIZED Related Articles - FIXED TO USE SLUG */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-orange-500">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <div key={relatedArticle.id} className="group">
                        <Link to={`/article/${relatedArticle.slug}`} className="block">
                          <div className="flex gap-3">
                            {(relatedArticle.featured_image_url || relatedArticle.featured_image) && (
                              <img
                                src={relatedArticle.featured_image_url || relatedArticle.featured_image || '/api/placeholder/400/250'}
                                alt={relatedArticle.title}
                                className="w-20 h-20 object-cover rounded flex-shrink-0"
                                loading="lazy" // Lazy load related images
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
                                {relatedArticle.title}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatDate(relatedArticle.published_at || relatedArticle.created_at)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
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