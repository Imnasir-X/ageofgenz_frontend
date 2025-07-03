import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, TrendingUp, RefreshCw } from 'lucide-react';
import { getTrendingArticles, getArticles } from '../utils/api';
import type { Article } from '../types';

const Trending: React.FC = () => {
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const categoryColors: { [key: string]: string } = {
    'AI & Tech': 'bg-blue-600', Opinion: 'bg-purple-600', Politics: 'bg-red-600',
    Trending: 'bg-orange-600', Culture: 'bg-yellow-600', Insights: 'bg-teal-600',
    Memes: 'bg-pink-600', World: 'bg-green-600', Sports: 'bg-emerald-600',
  };

  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  // Skeleton Loader Component for Trending Articles
  const TrendingArticleSkeleton = () => (
    <div className="group">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="relative aspect-[16/10] overflow-hidden rounded">
          <div className="w-full h-full bg-gray-700"></div>
        </div>
        {/* Content skeleton */}
        <div className="pt-3">
          {/* Category and meta row */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <div className="w-16 h-4 bg-gray-700 rounded mr-2"></div>
              <div className="w-20 h-3 bg-gray-700 rounded"></div>
            </div>
            <div className="w-12 h-3 bg-gray-700 rounded"></div>
          </div>
          {/* Title */}
          <div className="w-full h-5 bg-gray-700 rounded mb-1"></div>
          <div className="w-3/4 h-5 bg-gray-700 rounded mb-2"></div>
          {/* Description */}
          <div className="w-full h-4 bg-gray-700 rounded mb-1"></div>
          <div className="w-1/2 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Error Component with Retry Button
  const ErrorWithRetry = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="text-center py-12">
      <p className="text-red-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <RefreshCw size={16} className="mr-2" />
        Try Again
      </button>
    </div>
  );

  const fetchTrendingArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        response = await getTrendingArticles();
      } catch {
        response = await getArticles();
      }
      const fetchedArticles = response.data?.results || response.data || response || [];
      const formattedArticles = fetchedArticles.map((article: Article) => ({
        ...article,
        formattedDate: formatDate(article.date || article.published_at || article.created_at || new Date().toISOString()),
      }));
      setTrendingArticles(formattedArticles);
      setError(formattedArticles.length === 0 ? 'No trending articles available.' : null);
    } catch (err: any) {
      setError('Could not load trending articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What's Hot 🔥</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Viral moments and breaking news in Gen Z's world.
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-orange-500 mr-2" size={24} />
            <h2 className="text-xl font-bold text-white pb-2 border-b-2 border-orange-500 flex-1">
              Trending Stories
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <TrendingArticleSkeleton key={`trending-skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <ErrorWithRetry error={error} onRetry={fetchTrendingArticles} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trendingArticles.map((article) => {
                // ✅ CRITICAL FIX: Skip articles without slug
                if (!article.id || !article.slug) {
                  console.warn('Article missing slug:', article);
                  return null;
                }
                
                const cleanDescription = article.description || article.excerpt
                  ? stripHtml(article.description || article.excerpt).substring(0, 100) + '...'
                  : 'No description.';
                const categoryName = article.category?.name || article.category_name || 'Trending';
                const categoryColor = categoryColors[categoryName] || 'bg-orange-600';

                return (
                  <div key={`trending-${article.id}`} className="group">
                    {/* ✅ FIXED: Use slug instead of id for article URL */}
                    <Link to={`/article/${article.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded">
                        <img
                          loading="lazy"
                          // ✅ ENHANCED: Use featured_image_url first, then fallbacks
                          src={article.featured_image_url || article.image || article.featured_image || '/api/placeholder/400/250'}
                          onError={(e) => (e.currentTarget.src = '/api/placeholder/400/250')}
                          alt={article.title || 'Trending Article Image'}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="pt-3">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className={`${categoryColor} text-xs font-bold px-2 py-1 mr-2 text-white rounded`}>
                              {categoryName.toUpperCase()}
                            </span>
                            <span className="text-gray-400 text-xs flex items-center">
                              <Clock size={12} className="mr-1" /> {(article as any).formattedDate}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Eye size={14} className="mr-1" /> <span className="text-xs">{article.views || article.view_count || 0}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-orange-500 line-clamp-2">
                          {article.title || 'Untitled'}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2">{cleanDescription}</p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/home" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded mr-4">
              All Articles
            </Link>
            <Link to="/opinion" className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold py-2 px-6 rounded">
              Share Opinion
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/home" className="text-orange-500 hover:text-orange-600">← Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Trending;