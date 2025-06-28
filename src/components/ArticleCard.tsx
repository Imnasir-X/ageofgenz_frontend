import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  imagePosition?: 'top' | 'center' | 'bottom';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, imagePosition = 'center' }) => {
  // Category color mapping
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

  // Function to format category name
  const formatCategoryName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Function to strip HTML tags
  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Get object position based on prop
  const getObjectPosition = () => {
    switch (imagePosition) {
      case 'top': return 'object-top';
      case 'bottom': return 'object-bottom';
      default: return 'object-center';
    }
  };

  // Process article data
  const categoryName = article.category?.name || article.category_name || 'General';
  const formattedCategoryName = formatCategoryName(categoryName);
  const categoryColor = categoryColors[formattedCategoryName] || 'bg-gray-600';
  
  const cleanDescription = article.description || article.excerpt
    ? stripHtml(article.description || article.excerpt).substring(0, 80) + '...'
    : '';

  const formattedDate = new Date(article.date || article.published_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <Link to={`/article/${article.id}`} className="block">
        {/* Compact Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={article.image || article.featured_image || '/api/placeholder/400/250'}
            alt={article.title || 'Article image'}
            className={`w-full h-full object-cover ${getObjectPosition()} transition-transform duration-200 group-hover:scale-105`}
            onError={(e) => {
              e.currentTarget.src = '/api/placeholder/400/250';
            }}
            loading="lazy"
          />
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* Compact Content */}
        <div className="p-3">
          {/* Category and Meta - More Compact */}
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className={`${categoryColor} text-white font-medium px-2 py-0.5 rounded`}>
              {formattedCategoryName.toUpperCase()}
            </span>
            <div className="flex items-center text-gray-500 space-x-2">
              <span className="flex items-center">
                <Clock size={10} className="mr-0.5" />
                {formattedDate}
              </span>
              <span className="flex items-center">
                <Eye size={10} className="mr-0.5" />
                {article.views || article.view_count || 0}
              </span>
            </div>
          </div>

          {/* Compact Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors leading-tight">
            {article.title || 'Untitled Article'}
          </h3>

          {/* Optional Description - Very Compact */}
          {cleanDescription && (
            <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
              {cleanDescription}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
};

export default ArticleCard;