import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, RefreshCw } from 'lucide-react';
import { getArticlesByCategory } from '../utils/api';
import type { Article } from '../types';

const Insights: React.FC = () => {
  const [insightsArticles, setInsightsArticles] = useState<Article[]>([]);
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

  // Skeleton Loader Component for Insights Articles
  const InsightsArticleSkeleton = () => (
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
      <p className="text-gray-500 text-sm mb-4">
        Articles may need to be assigned to the Insights category in the admin panel.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <RefreshCw size={16} className="mr-2" />
        Try Again
      </button>
    </div>
  );

  // Function to strip HTML tags from text
  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const fetchInsightsArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching Insights articles...');
      
      // Use the real category filtering API
      const response = await getArticlesByCategory('insights');
      console.log('Insights Articles API Response:', response.data);
      
      const fetchedArticles = response.data.results || [];
      console.log('Fetched Insights Articles:', fetchedArticles);
      
      // Format articles for display
      const formattedArticles = fetchedArticles.map((article: Article) => {
        const dateToUse = article.date || article.published_at || article.created_at || new Date().toISOString();
        return {
          ...article,
          formattedDate: formatDate(dateToUse),
        };
      });
      
      setInsightsArticles(formattedArticles);
      
      if (formattedArticles.length === 0) {
        setError('No Insights articles available yet.');
      }
    } catch (err: any) {
      console.error('Insights Articles Fetch Error:', err);
      setError('Could not load insights articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Insights Decoded
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Charts, workflows, and data breakdowns—unpacking the trends and processes shaping Gen Z's world.
          </p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500">
            Latest Insights
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <InsightsArticleSkeleton key={`insights-skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <ErrorWithRetry error={error} onRetry={fetchInsightsArticles} />
          ) : insightsArticles.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Data Lab Launching Soon!
                </h3>
                <p className="text-gray-400 mb-4">
                  We're preparing deep dives, analytics, and trend breakdowns for Gen Z.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Once articles are assigned to the Insights category, they'll appear here.
                </p>
              </div>

              {/* Insight Types Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-teal-400 text-2xl mb-2">📈</div>
                  <h4 className="text-white font-semibold mb-1">Trend Analysis</h4>
                  <p className="text-gray-400 text-sm">Data-driven trend spotting</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-blue-400 text-2xl mb-2">🔍</div>
                  <h4 className="text-white font-semibold mb-1">Deep Dives</h4>
                  <p className="text-gray-400 text-sm">Comprehensive investigations</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-purple-400 text-2xl mb-2">⚙️</div>
                  <h4 className="text-white font-semibold mb-1">How It Works</h4>
                  <p className="text-gray-400 text-sm">Behind-the-scenes breakdowns</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-green-400 text-2xl mb-2">📋</div>
                  <h4 className="text-white font-semibold mb-1">Research Reports</h4>
                  <p className="text-gray-400 text-sm">Studies and findings</p>
                </div>
              </div>

              <Link 
                to="/" 
                className="text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center"
              >
                Browse all articles →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {insightsArticles.map((article) => {
                  console.log('Rendering Insights Article:', article);
                  if (!article.id) {
                    console.warn('Skipping article due to missing ID:', article);
                    return null;
                  }
                  
                  // Process the description
                  const cleanDescription = article.description || article.excerpt
                    ? stripHtml(article.description || article.excerpt).substring(0, 100) + '...' 
                    : 'No description available.';
                  
                  // Get category info
                  const categoryName = article.category?.name || article.category_name || 'Insights';
                  const categoryColor = categoryColors[categoryName] || 'bg-teal-600';
                  
                  return (
                    <div key={`insights-${article.id}`} className="relative group">
                      <Link to={`/article/${article.id}`} className="block">
                        <div className="relative aspect-video overflow-hidden rounded">
                          <img
                            src={article.image || article.featured_image || '/api/placeholder/400/300'}
                            onError={(e) => { 
                              (e.target as HTMLImageElement).src = '/api/placeholder/400/300'; 
                            }}
                            alt={article.title || 'Insights Article Image'}
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
                                {(article as any).formattedDate}
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

              {/* Info Note */}
              <div className="mt-6 bg-teal-900 bg-opacity-50 rounded-lg p-4">
                <p className="text-teal-200 text-sm text-center">
                  <strong>Showing articles from the Insights category.</strong> Articles are filtered by their assigned category in the backend.
                </p>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/category/insights"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              See More Insights
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

export default Insights;