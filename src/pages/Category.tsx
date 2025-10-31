import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Clock, Eye, Loader2, ChevronRight } from 'lucide-react';
import { getArticlesByCategory, getCategories } from '../utils/api';
import type { Article, Category } from '../types';
import {
  resolveCategoryMeta,
  getCategoryAccent,
  flattenCategoryTree,
  getCategoryPath,
  getFallbackCategoryDisplayName,
  type CategoryMeta,
  type CategoryAccent,
  type FlatCategory,
} from '../utils/categoryHelpers';

type CategoryArticle = Article & {
  formattedDate?: string;
  sanitizedExcerpt?: string;
};

type Breadcrumb = {
  slug: string;
  name: string;
};

const stripHtml = (html?: string | null): string => {
  if (!html) return '';
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]+>/g, '');
  }
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<CategoryArticle[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryMeta, setCategoryMeta] = useState<CategoryMeta | null>(null);
  const [accent, setAccent] = useState<CategoryAccent | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [childCategories, setChildCategories] = useState<Breadcrumb[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackCategory, setUsingFallbackCategory] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) {
      return;
    }

    const normalized = resolveCategoryMeta({ slug });
    setCategoryMeta(normalized);

    if (normalized.isLegacy && normalized.slug !== slug) {
      navigate(`/category/${normalized.slug}`, { replace: true });
      return;
    }

    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);

      let canonicalCategory: Category = {
        id: -1,
        name: normalized.name,
        slug: normalized.slug,
        parent_slug: null,
        description: undefined,
        is_active: true,
      };
      let accentTheme = getCategoryAccent(canonicalCategory);
      let breadcrumbList: Breadcrumb[] = getCategoryPath(normalized.slug).map((pathSlug) => ({
        slug: pathSlug,
        name: getFallbackCategoryDisplayName(pathSlug),
      }));
      let childList: Breadcrumb[] = [];
      let fallbackCategoryUsed = true;
      let fetchError: string | null = null;

      try {
        const categoriesResponse = await getCategories({ flat: true });
        const payload = categoriesResponse.data;
        const categoriesPayload: Category[] = Array.isArray(payload)
          ? payload
          : (payload?.results as Category[]) ?? [];

        if (categoriesPayload.length > 0) {
          const flatList = flattenCategoryTree(categoriesPayload);
          const flatMap = new Map<string, FlatCategory>(flatList.map((entry) => [entry.slug, entry]));
          const currentEntry = flatMap.get(normalized.slug);

          if (currentEntry?.category) {
            canonicalCategory = currentEntry.category;
            fallbackCategoryUsed = false;
          } else if (currentEntry) {
            canonicalCategory = {
              id: currentEntry.category?.id ?? -1,
              name: currentEntry.name,
              slug: currentEntry.slug,
              parent_slug: currentEntry.parentSlug,
              description: currentEntry.category?.description,
              is_active: currentEntry.category?.is_active ?? true,
            };
          }

          const computedBreadcrumbs: Breadcrumb[] = [];
          const visited = new Set<string>();
          let cursor: string | null = normalized.slug;

          while (cursor && !visited.has(cursor)) {
            visited.add(cursor);
            const entry = flatMap.get(cursor);
            const displayName =
              entry?.category?.name?.trim() ||
              entry?.name ||
              getFallbackCategoryDisplayName(cursor);
            computedBreadcrumbs.push({ slug: cursor, name: displayName });
            cursor = entry?.parentSlug ?? null;
          }

          if (computedBreadcrumbs.length > 0) {
            computedBreadcrumbs.reverse();
            breadcrumbList = computedBreadcrumbs;
          }

          childList = flatList
            .filter((entry) => entry.parentSlug === normalized.slug)
            .map((entry) => ({
              slug: entry.slug,
              name:
                entry.category?.name?.trim() ||
                entry.name ||
                getFallbackCategoryDisplayName(entry.slug),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      } catch (err) {
        console.error('Category metadata fetch error:', err);
        fetchError = 'Could not load category details. Showing fallback information.';
      }

      accentTheme = getCategoryAccent(canonicalCategory);

      let formattedArticles: CategoryArticle[] = [];
      try {
        const articlesResponse = await getArticlesByCategory(normalized.slug);
        const fetchedArticles: Article[] = articlesResponse.data?.results ?? [];

        formattedArticles = fetchedArticles.map((article) => {
          const formattedDate = new Date(
            article.date || article.published_at || Date.now(),
          ).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const stripped = stripHtml(article.description || article.excerpt).trim();
          const sanitizedExcerpt =
            stripped.length > 0
              ? `${stripped.slice(0, 140)}${stripped.length > 140 ? '…' : ''}`
              : 'Stay tuned for updates from this category.';
          return {
            ...article,
            formattedDate,
            sanitizedExcerpt,
          };
        });
      } catch (err) {
        console.error('Category articles fetch error:', err);
        fetchError =
          fetchError ??
          'Could not load articles for this category. Please try again later.';
      }

      setCategory(canonicalCategory);
      setAccent(accentTheme);
      setBreadcrumbs(breadcrumbList);
      setChildCategories(childList);
      setArticles(formattedArticles);
      setUsingFallbackCategory(fallbackCategoryUsed);
      setError(fetchError);
      setLoading(false);
    };

    void fetchCategoryData();
  }, [slug, navigate]);

  const accentTheme = accent ?? getCategoryAccent(categoryMeta ?? undefined);
  const badgeClass = accentTheme.badge;
  const borderClass = accentTheme.border;
  const textAccentClass = accentTheme.text;

  const categoryName =
    category?.name ?? categoryMeta?.name ?? 'Category'.toUpperCase();
  const categoryDescription =
    category?.description ??
    (categoryName
      ? `Explore the latest in ${categoryName.toLowerCase()}.`
      : 'Explore the latest stories from this category.');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-16">
        <div className="container mx-auto flex items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <Loader2 className={`h-5 w-5 animate-spin ${textAccentClass}`} aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">
              Loading {categoryMeta?.name || 'category'} stories…
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <section className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Category Not Found
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              {error || "We couldn't find that category. Try exploring something else."}
            </p>
          </section>
          <div className="text-center">
            <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-800">
                Home
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.slug}>
                <li className="text-gray-400">/</li>
                <li>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-gray-900">{crumb.name}</span>
                  ) : (
                    <Link to={`/category/${crumb.slug}`} className="hover:text-gray-800">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
          {usingFallbackCategory && (
            <p className="mt-2 text-xs text-gray-500">
              Showing fallback category metadata while live data loads.
            </p>
          )}
        </nav>

        <section className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {categoryName}
          </h1>
          <p className="text-gray-600 max-w-3xl">{categoryDescription}</p>
          {error && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}
            </div>
          )}
        </section>

        {childCategories.length > 0 && (
          <section className="mb-10 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className={`text-base font-semibold ${textAccentClass}`}>
                Explore subcategories
              </h2>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {childCategories.length} topic{childCategories.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {childCategories.map((child) => (
                <Link
                  key={child.slug}
                  to={`/category/${child.slug}`}
                  className={`inline-flex items-center gap-1 rounded-full border ${borderClass} bg-white px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50 transition`}
                >
                  {child.name}
                  <ChevronRight size={14} className={textAccentClass} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-lg border border-gray-900/20 bg-gray-900 p-6 shadow-xl shadow-gray-900/10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className={`text-xl font-bold text-white pb-2 border-b-2 ${borderClass}`}>
              Latest in {categoryName}
            </h2>
            <span className="text-xs uppercase tracking-wide text-white/70">
              {articles.length} article{articles.length === 1 ? '' : 's'}
            </span>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                if (!article.id) {
                  return null;
                }
                const destination = article.slug ? `/article/${article.slug}` : `/article/${article.id}`;

                return (
                  <div key={`category-${article.id}`} className="group relative rounded-xl border border-white/5 bg-gray-900/40 p-3 transition hover:border-white/20">
                    <Link to={destination} className="block">
                      <div className="relative aspect-video overflow-hidden rounded-lg">
                        <img
                          src={article.image || article.featured_image || '/api/placeholder/480/320'}
                          alt={article.title || 'Article image'}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/480/320';
                          }}
                        />
                      </div>
                      <div className="pt-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`${badgeClass} text-xs font-semibold uppercase tracking-wide text-white px-2 py-0.5 rounded`}>
                              {categoryName.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-300">
                              <Clock size={12} aria-hidden="true" />
                              {article.formattedDate}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-gray-300">
                            <Eye size={14} aria-hidden="true" />
                            {article.views || article.view_count || 0}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-orange-400 line-clamp-2">
                          {article.title || 'Untitled'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-300 line-clamp-3">
                          {article.sanitizedExcerpt || 'Stay tuned for updates from this category.'}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-300">
              <p className="mb-2 font-semibold">No articles yet</p>
              <p className="text-sm text-gray-400">
                Articles may need to be assigned to the {categoryName} category in the admin panel.
              </p>
            </div>
          )}

          {articles.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`inline-flex items-center gap-2 rounded-full border ${borderClass} bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20`}
              >
                Refresh {categoryName} stories
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

