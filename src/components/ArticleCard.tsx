import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Article } from '../types';
import { getArticleBySlug } from '../utils/api';

const CATEGORY_ACCENTS: Record<string, string> = {
  politics: 'bg-blue-600',
  world: 'bg-emerald-600',
  culture: 'bg-rose-600',
  sports: 'bg-red-600',
  business: 'bg-amber-600',
  technology: 'bg-indigo-600',
  science: 'bg-cyan-600',
  opinion: 'bg-purple-600',
  insights: 'bg-sky-600',
  default: 'bg-orange-500',
};

interface ArticleCardProps {
  article: Article;
  imagePosition?: 'top' | 'center' | 'bottom';
  variant?: 'compact' | 'large' | 'horizontal' | 'sidebarLarge';
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
  const categoryKey = (article.category?.slug || article.category?.name || 'default').toLowerCase();
  const categoryAccent = CATEGORY_ACCENTS[categoryKey] || CATEGORY_ACCENTS.default;
  const categoryTextAccent = categoryAccent.replace('bg-', 'text-');

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
        return 'bg-white rounded-xl shadow-sm hover:shadow-lg transition-transform duration-500 ease-out transform-gpu hover:-translate-y-1 overflow-hidden group';
      case 'horizontal':
        return 'bg-white rounded-md shadow-sm hover:shadow-md transition-transform duration-300 ease-out transform-gpu hover:-translate-y-1 overflow-hidden group';
      case 'sidebarLarge':
        return 'flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg';
      default:
        return 'bg-white rounded-md shadow-sm hover:shadow-md transition-transform duration-300 ease-out transform-gpu hover:-translate-y-1 overflow-hidden group';
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
              className={`w-full h-full object-cover ${getObjectPosition()} transition-transform duration-500 group-hover:scale-[1.03]`}
              onError={(e) => { e.currentTarget.src = '/api/placeholder/800/450'; }}
              loading="lazy"
              fetchPriority="high"
            />
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" aria-hidden="true" />
              <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md shadow-[0_14px_26px_rgba(15,23,42,0.35)]">
                  <span className={`${categoryAccent} px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm shadow-black/20`}>
                    {article.category?.name || 'General'}
                  </span>
                  <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                  <span className="text-white/80">By {article.author?.name || 'Staff'}</span>
                  <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                  <span className="flex items-center text-white">
                    <Clock size={12} className={`mr-1 ${categoryTextAccent}`} />
                    {article.estimated_read_time || 3} min read
                  </span>
                </div>
              </div>
              <div className="relative z-10 flex h-full flex-col justify-end p-3 sm:p-5 lg:p-6">
                <div className="w-full max-w-3xl rounded-2xl bg-slate-950/20 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md backdrop-saturate-150 shadow-[0_16px_32px_rgba(15,23,42,0.35)] ring-1 ring-white/10">
                  <h3 className="text-[1.85rem] sm:text-[2.2rem] lg:text-[2.45rem] font-black text-white leading-tight tracking-tight line-clamp-2 lg:line-clamp-3">
                    {article.title || 'Untitled Article'}
                  </h3>
                  {cleanDescription && (
                    <p className="mt-1 hidden text-sm text-white/75 sm:block sm:text-[0.95rem] sm:leading-snug line-clamp-2">
                      {cleanDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className={wrapperClasses}>
        <Link to={`/article/${article.slug}`} className="flex gap-3 p-3 sm:p-4" onMouseEnter={onHoverPrefetch}>
          <div className="w-36 sm:w-40 md:w-48 aspect-[16/10] bg-gray-100 overflow-hidden rounded-md">
            <img
              src={imgSrc}
              alt={article.title || 'Article image'}
              className={`w-full h-full object-cover ${getObjectPosition()} transition-transform duration-300 group-hover:scale-105`}
              onError={(e) => { e.currentTarget.src = '/api/placeholder/320/200'; }}
              loading="lazy"
            />
          </div>
          <div className="min-w-0 py-1 flex flex-col gap-1.5">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className={`${categoryAccent} px-2 py-0.5 rounded-full text-white shadow-sm`}>
                {article.category?.name || 'General'}
              </span>
              <span className="flex items-center text-gray-500">
                <Clock size={11} className="mr-1" />
                {formattedDate}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
              {article.title || 'Untitled Article'}
            </h3>
            {cleanDescription && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {cleanDescription}
              </p>
            )}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'sidebarLarge') {
    return (
      <article className={wrapperClasses}>
        <Link to={`/article/${article.slug}`} className="block h-full" onMouseEnter={onHoverPrefetch}>
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
            <img
              src={imgSrc}
              alt={article.title || 'Article image'}
              className={`h-full w-full object-cover ${getObjectPosition()} transition-transform duration-300 group-hover:scale-[1.03]`}
              onError={(e) => { e.currentTarget.src = '/api/placeholder/640/360'; }}
              loading="lazy"
            />
          </div>
          <div className="flex h-full flex-col gap-2 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <span className={`${categoryAccent} inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white`}>
                {article.category?.name || 'General'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1 text-gray-500">
                <Clock size={11} className="text-gray-400" />
                {formattedDate}
              </span>
            </div>
            <h3 className="text-lg font-semibold leading-snug text-gray-900 line-clamp-3">
              {article.title || 'Untitled Article'}
            </h3>
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
          <div className="flex items-center mb-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">
            <Clock size={10} className="mr-1 text-orange-500" />
            {formattedDate}
          </div>

          {/* Compact Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-0.5 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
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
