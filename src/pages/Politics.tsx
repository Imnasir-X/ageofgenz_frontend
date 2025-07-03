import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, RefreshCw } from 'lucide-react';
import { getArticlesByCategory } from '../utils/api';
import type { Article } from '../types';

const Politics: React.FC = () => {
  const [politicsArticles, setPoliticsArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Define a mapping of category names to colors
  const categoryColors: { [key: string]: string } = {
    'AI & Tech': 'bg-blue-600',
    'Opinion': 'bg-purple-600',
    'Politics': 'bg-red-600',
    'Trending': 'bg-orange-600',
    'Culture': 'bg-yellow-600',
    'Insights': 'bg-teal-600',
    'Memes': 'bg-pink-600',
    'World': 'bg-green-600',
    'Sports': 'bg-emerald-600',
  };

  // Skeleton Loader Component for Politics Articles
  const PoliticsArticleSkeleton = () => (
    <div className="relative group">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="relative aspect-video overflow-hidden rounded">
          <div className="w-full aspect-[16/10] bg-gray-700"></div>
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

  const fetchPoliticsArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🏛️ Fetching politics articles...');
      
      // Use the real category filtering API
      const response = await getArticlesByCategory('politics');
      console.log('Politics API Response:', response.data);
      
      const fetchedArticles = response.data.results || [];
      console.log('Fetched Politics Articles:', fetchedArticles);
      
      // Format articles for display
      const formattedArticles = fetchedArticles.map((article: Article) => ({
        ...article,
        formattedDate: new Date(article.date || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }));
      
      setPoliticsArticles(formattedArticles);
      setError(null);
    } catch (err: any) {
      console.error('Politics Fetch Error:', err);
      setError('Could not load politics articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliticsArticles();
  }, []);

  // Function to strip HTML tags from text
  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Politics Unraveled
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Deep dives into policies, campaigns, and movements—exploring the political landscape through a Gen Z lens.
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500">
            Latest Politics
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <PoliticsArticleSkeleton key={`politics-skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <ErrorWithRetry error={error} onRetry={fetchPoliticsArticles} />
          ) : politicsArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No politics articles available yet.</p>
              <p className="text-gray-500 text-sm">
                Articles may need to be assigned to the Politics category in the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {politicsArticles.map((article) => {
                console.log('Rendering Politics Article:', article);
                
                // ✅ CRITICAL FIX: Skip articles without slug
                if (!article.id || !article.slug) {
                  console.warn('Skipping article due to missing slug:', article);
                  return null;
                }
                
                // Process the description
                const cleanDescription = article.description || article.excerpt
                  ? stripHtml(article.description || article.excerpt).substring(0, 100) + '...' 
                  : 'No description available.';
                
                // Get category color
                const categoryName = article.category?.name || article.category_name || 'Politics';
                const categoryColor = categoryColors[categoryName] || 'bg-red-600';
                
                return (
                  <div key={article.id} className="relative group">
                    {/* ✅ FIXED: Use slug instead of id for article URL */}
                    <Link to={`/article/${article.slug}`} className="block">
                      <div className="relative aspect-video overflow-hidden rounded">
                        <img
                          // ✅ ENHANCED: Use featured_image_url first, then fallbacks
                          src={article.featured_image_url || article.image || article.featured_image || '/api/placeholder/400/300'}
                          onError={(e) => { 
                            e.currentTarget.src = '/api/placeholder/400/300'; 
                          }}
                          alt={article.title || 'Article Image'}
                          className="w-full aspect-[16/10] object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      <div className="pt-3">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className={`${categoryColor} text-xs font-bold px-2 py-1 mr-2 text-white rounded`}>
                              {categoryName.toUpperCase()}
                            </span>
                            <span className="text-gray-400 text-xs flex items-center">
                              <Clock size={12} className="mr-1" /> 
                              {article.formattedDate}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Eye size={14} className="mr-1" />
                            <span className="text-xs">{article.views || article.view_count || 0}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                          {article.title || 'Untitled'}
                        </h3>

                        <p className="text-gray-300 text-sm line-clamp-2">
                          {cleanDescription}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/politics"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              See More Politics News
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Politics;