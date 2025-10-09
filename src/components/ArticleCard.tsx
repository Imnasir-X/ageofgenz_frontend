import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  imagePosition?: 'top' | 'center' | 'bottom';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, imagePosition = 'center' }) => {
  // Category badge removed per request

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
  const cleanDescription = article.description || article.excerpt
    ? stripHtml(article.description || article.excerpt).substring(0, 80) + '...'
    : '';

  const formattedDate = new Date(article.date || article.published_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <Link to={`/article/${article.slug}`} className="block">
        {/* Compact Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={article.featured_image_url || article.image || article.featured_image || '/api/placeholder/400/250'}
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
          {/* Meta row (date only) */}
          <div className="flex items-center mb-1.5 text-xs text-gray-500">
            <Clock size={10} className="mr-1" />
            {formattedDate}
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
