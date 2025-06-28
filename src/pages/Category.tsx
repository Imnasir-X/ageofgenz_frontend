import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { getArticlesByCategory, getCategories } from '../utils/api';
import type { Article, Category } from '../types';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Category color mapping
  const categoryColors: { [key: string]: string } = {
    'Politics': 'bg-red-600',
    'AI & Tech': 'bg-blue-600',
    'Culture': 'bg-purple-600',
    'Opinion': 'bg-yellow-600',
    'Sports': 'bg-green-600',
    'Trending': 'bg-orange-600',
    'Insights': 'bg-teal-600',
    'Memes': 'bg-pink-600',
    'World': 'bg-emerald-600',
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('🏷️ Fetching category data for:', slug);
        
        // Get all categories to find the current one
        const categoriesResponse = await getCategories();
        const allCategories = categoriesResponse.data;
        
        // Find the category by slug
        const currentCategory = allCategories.find(cat => 
          cat.slug.toLowerCase() === slug.toLowerCase()
        );
        
        if (!currentCategory) {
          setError('Category not found');
          setLoading(false);
          return;
        }
        
        setCategory(currentCategory);
        
        // Get articles for this category
        const articlesResponse = await getArticlesByCategory(slug);
        const fetchedArticles = articlesResponse.data.results || [];
        
        console.log(`Found ${fetchedArticles.length} articles for category:`, slug);
        
        // Format articles for display
        const formattedArticles = fetchedArticles.map((article: Article) => ({
          ...article,
          formattedDate: new Date(article.date || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }));
        
        setArticles(formattedArticles);
        
      } catch (err: any) {
        console.error('Category fetch error:', err);
        setError('Could not load category data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  // Function to strip HTML tags from text
  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error or category not found
  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <section className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Category Not Found
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              {error || "Oops! We couldn't find that category. Try exploring something else."}
            </p>
          </section>
          <div className="mt-4 text-center">
            <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
              Return to Home
            </Link> 
          </div>
        </div>
      </div>
    );
  }

  const categoryColor = categoryColors[category.name] || 'bg-gray-600';

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Intro Section */}
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {category.name}
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {category.description || `Explore the latest in ${category.name.toLowerCase()}.`}
          </p>
        </section>

        {/* Category Content Section */}
        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6 pb-2 border-b-2 border-orange-500">
            Latest in {category.name}
          </h2>

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {articles.map((article) => {
                console.log('Rendering Category Article:', article);
                
                if (!article.id) {
                  console.warn('Skipping article due to missing ID:', article);
                  return null;
                }
                
                // Process the description
                const cleanDescription = article.description || article.excerpt
                  ? stripHtml(article.description || article.excerpt).substring(0, 100) + '...' 
                  : 'No description available.';
                
                return (
                  <div key={`category-${article.id}`} className="relative group">
                    <Link to={`/article/${article.id}`} className="block">
                      <div className="relative aspect-video overflow-hidden rounded">
                        <img
                          src={article.image || article.featured_image || '/api/placeholder/400/300'}
                          onError={(e) => { 
                            e.currentTarget.src = '/api/placeholder/400/300'; 
                          }}
                          alt={article.title || 'Article Image'}
                          className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      <div className="pt-3">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className={`${categoryColor} text-xs font-bold px-2 py-1 mr-2 text-white rounded`}>
                              {category.name.toUpperCase()}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No articles found in this category yet.</p>
              <p className="text-gray-500 text-sm">
                Articles may need to be assigned to the {category.name} category in the admin panel.
              </p>
            </div>
          )}

          {/* Call to Action - Only show if there are articles */}
          {articles.length > 0 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => window.location.reload()}
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Refresh {category.name} Stories
              </button>
            </div>
          )}
        </div>

        {/* Return Link */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;