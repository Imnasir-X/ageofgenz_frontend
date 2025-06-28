import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, RefreshCw } from 'lucide-react';
import { getArticlesByCategory } from '../utils/api';
import type { Article } from '../types';

const Memes: React.FC = () => {
  const [memesArticles, setMemesArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Define a mapping of category names to colors - matching Politics page format
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

  // Skeleton Loader Component for Memes Articles
  const MemesArticleSkeleton = () => (
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

  const fetchMemesArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('😂 Fetching memes articles...');
      
      // Use the category filtering API - same as Politics page
      const response = await getArticlesByCategory('memes');
      console.log('Memes API Response:', response.data);
      
      const fetchedArticles = response.data.results || [];
      console.log('Fetched Memes Articles:', fetchedArticles);
      
      // Format articles for display
      const formattedArticles = fetchedArticles.map((article: Article) => ({
        ...article,
        formattedDate: new Date(article.date || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }));
      
      setMemesArticles(formattedArticles);
      setError(null);
    } catch (err: any) {
      console.error('Memes Fetch Error:', err);
      setError('Could not load memes articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemesArticles();
  }, []);

  // Function to strip HTML tags from text
  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Function to format category name for display
  const formatCategoryName = (name: string): string => {
    // Convert to title case
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Meme Central: Where Gen Z Laughs
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            The funniest, most viral memes Gen Z can't stop sharing. From cursed content to wholesome vibes, 
            here's where internet culture gets real. Laugh, relate, repeat.
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500">
            Top Memes Right Now
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <MemesArticleSkeleton key={`memes-skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <ErrorWithRetry error={error} onRetry={fetchMemesArticles} />
          ) : memesArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No memes articles available yet.</p>
              <p className="text-gray-500 text-sm">
                Articles may need to be assigned to the Memes category in the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {memesArticles.map((article) => {
                console.log('Rendering Memes Article:', article);
                
                // Skip if no ID
                if (!article.id) {
                  console.warn('Skipping article due to missing ID:', article);
                  return null;
                }
                
                // Process the description
                const cleanDescription = article.description || article.excerpt
                  ? stripHtml(article.description || article.excerpt).substring(0, 100) + '...' 
                  : 'No description available.';
                
                // Get category name and format it
                const categoryName = article.category?.name || article.category_name || 'Memes';
                const formattedCategoryName = formatCategoryName(categoryName);
                const categoryColor = categoryColors[formattedCategoryName] || 'bg-pink-600';
                
                return (
                  <div key={article.id} className="relative group">
                    <Link to={`/article/${article.id}`} className="block">
                      <div className="relative aspect-video overflow-hidden rounded">
                        <img
                          src={article.image || article.featured_image || '/api/placeholder/400/300'}
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
                              {formattedCategoryName.toUpperCase()}
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

export default Memes;