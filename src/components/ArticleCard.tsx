import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Article } from '../types';
import { getArticleBySlug } from '../utils/api';

interface ArticleCardProps {
  article: Article;
  imagePosition?: 'top' | 'center' | 'bottom';
  variant?: 'compact' | 'large' | 'horizontal';
  prefetchOnHover?: boolean;
}

const prefetched = new Set<string>();

const ArticleCard: React.FC<ArticleCardProps> = ({ article, imagePosition = 'center', variant = 'compact', prefetchOnHover = true }) => {
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

  const imgSrc = article.featured_image_url || article.image || article.featured_image || '/api/placeholder/400/250';

  const onHoverPrefetch = async () => {
    if (!prefetchOnHover || !article.slug || prefetched.has(article.slug)) return;
    try {
      prefetched.add(article.slug);
      await getArticleBySlug(article.slug);
    } catch {
      // ignore errors for prefetch
    }
  };

  const wrapperClasses = useMemo(() => {
    switch (variant) {
      case 'large':
        return 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group';
      case 'horizontal':
        return 'bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group';
      default:
        return 'bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group';
    }
  }, [variant]);

  if (variant === 'large') {
    return (
      <article className={wrapperClasses}>
        <Link to={`/article/${article.slug}`} className="block" onMouseEnter={onHoverPrefetch}>
          <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
            <img
              src={imgSrc}
              alt={article.title || 'Article image'}
              className={`w-full h-full object-cover ${getObjectPosition()} transition-transform duration-300 group-hover:scale-105`}
              onError={(e) => { e.currentTarget.src = '/api/placeholder/800/450'; }}
              loading="lazy"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-500 text-white">
                  {article.category?.name || 'General'}
                </span>
                <span className="text-white/80 text-[10px]">•</span>
                <span className="text-white/90 text-[10px]">By {article.author?.name || 'Staff'}</span>
                <span className="text-white/80 text-[10px]">•</span>
                <span className="text-white/90 text-[10px] flex items-center">
                  <Clock size={12} className="mr-1" />
                  {article.estimated_read_time || 3} min
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow line-clamp-3">
                {article.title || 'Untitled Article'}
              </h3>
              {cleanDescription && (
                <p className="hidden sm:block text-white/90 text-xs mt-1 line-clamp-2">{cleanDescription}</p>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className={wrapperClasses}>
        <Link to={`/article/${article.slug}`} className="flex gap-3 p-2" onMouseEnter={onHoverPrefetch}>
          <div className="w-36 sm:w-40 md:w-48 aspect-[16/10] bg-gray-100 overflow-hidden rounded">
            <img
              src={imgSrc}
              alt={article.title || 'Article image'}
              className={`w-full h-full object-cover ${getObjectPosition()}`}
              onError={(e) => { e.currentTarget.src = '/api/placeholder/320/200'; }}
              loading="lazy"
            />
          </div>
          <div className="min-w-0 py-1">
            <div className="flex items-center mb-1 text-xs text-gray-500">
              <Clock size={10} className="mr-1" />
              {formattedDate}
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
              {article.title || 'Untitled Article'}
            </h3>
            {cleanDescription && (
              <p className="text-gray-600 text-xs line-clamp-2">{cleanDescription}</p>
            )}
          </div>
        </Link>
      </article>
    );
  }

  // Default compact
  return (
    <article className={wrapperClasses}>
      <Link to={`/article/${article.slug}`} className="block" onMouseEnter={onHoverPrefetch}>
        {/* Compact Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={imgSrc}
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
        <div className="p-2">
          {/* Meta row (date only) */}
          <div className="flex items-center mb-1.5 text-xs text-gray-500">
            <Clock size={10} className="mr-1" />
            {formattedDate}
          </div>

          {/* Compact Title */}
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
            {article.title || 'Untitled Article'}
          </h3>

          {/* Optional Description - Very Compact */}
          {cleanDescription && (
            <p className="text-gray-600 text-[11px] line-clamp-2 leading-snug">
              {cleanDescription}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
};

export default ArticleCard;
