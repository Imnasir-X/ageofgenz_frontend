import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, RefreshCw } from 'lucide-react';
import { getArticlesByCategory } from '../utils/api';
import type { Article } from '../types';

const World: React.FC = () => {
  const [worldArticles, setWorldArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const categoryColors: { [key: string]: string } = {
    'AI & Tech': 'bg-blue-600', Opinion: 'bg-purple-600', Politics: 'bg-red-600',
    Trending: 'bg-orange-600', Culture: 'bg-yellow-600', Insights: 'bg-teal-600',
    Memes: 'bg-pink-600', World: 'bg-green-600', Sports: 'bg-emerald-600',
  };

  // Skeleton Loader Component for World Articles
  const WorldArticleSkeleton = () => (
    <div className="relative group">
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

  const fetchWorldArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getArticlesByCategory('world');
      const fetchedArticles = response.data.results || [];
      const formattedArticles = fetchedArticles.map((article: Article) => ({
        ...article,
        formattedDate: new Date(article.date || Date.now()).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
      }));
      setWorldArticles(formattedArticles);
      setError(null);
    } catch (err: any) {
      setError('Could not load world news articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorldArticles();
  }, []);

  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">World News</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Global perspectives, breaking news, and international affairs—understanding our interconnected world.
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500">
            Latest World News
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <WorldArticleSkeleton key={`world-skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <ErrorWithRetry error={error} onRetry={fetchWorldArticles} />
          ) : worldArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No world news articles available yet.</p>
              <p className="text-gray-500 text-sm">
                Articles may need to be assigned to the World category in the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {worldArticles.map((article) => {
                if (!article.id) return null;
                const cleanDescription = article.description || article.excerpt
                  ? stripHtml(article.description || article.excerpt).substring(0, 100) + '...'
                  : 'No description available.';
                const categoryName = article.category?.name || article.category_name || 'World';
                const categoryColor = categoryColors[categoryName] || 'bg-green-600';

                return (
                  <div key={article.id} className="relative group">
                    <Link to={`/article/${article.id}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded">
                        <img
                          loading="lazy"
                          src={article.image || article.featured_image || '/api/placeholder/400/250'}
                          onError={(e) => (e.currentTarget.src = '/api/placeholder/400/250')}
                          alt={article.title || 'Article Image'}
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
                              <Clock size={12} className="mr-1" /> {article.formattedDate}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Eye size={14} className="mr-1" /> <span className="text-xs">{article.views || article.view_count || 0}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
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
            <Link to="/world" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors">
              See More World News
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

export default World;