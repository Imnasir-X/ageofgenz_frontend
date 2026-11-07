import { articlesApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import type { Article } from '@/lib/api/types';
import { optimizeImage } from '@/lib/image';

/**
 * Doherty threshold, without inflating analytics.
 *
 * The backend counts a view on every article detail GET, so hover and viewport
 * prefetch never request article data. They warm only what has no side effects:
 * the article route's JS chunk and the hero image. Article data starts on
 * pointerdown / Enter (the click is already happening), which buys 100-200ms,
 * and the card's own data is passed in router state so the headline, standfirst
 * and image render instantly while the body loads (optimistic UI).
 */

/** Shared article loader: the detail page and press-time prefetch use the same cache entry. */
export const loadArticle = (slug: string): Promise<Article> => cached(`article:${slug}`, () => articlesApi.bySlug(slug), 10 * 60 * 1000);

let routeChunk: Promise<unknown> | null = null;
/** Warm the article route's JS chunk once. */
export const prefetchArticleRoute = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!routeChunk) routeChunk = import('@/routes').then((r) => r.ArticleDetail.preload()).catch(() => (routeChunk = null));
  return routeChunk;
};

const constrained = () => {
  if (typeof navigator === 'undefined') return true;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType)));
};

const warmedImages = new Set<string>();
function warmImage(src: string | null | undefined) {
  if (!src || warmedImages.has(src) || typeof Image === 'undefined') return;
  warmedImages.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = optimizeImage(src, 1400);
}

/** Hover / focus / viewport: side-effect-free warm-up. */
export function warmArticle(article: Pick<Article, 'image'>) {
  if (typeof window === 'undefined' || constrained()) return;
  void prefetchArticleRoute();
  warmImage(article.image);
}

/** Pointer down / Enter on an article link: the navigation is already under way, so start the data request. */
export function startArticleLoad(article: Pick<Article, 'slug'>) {
  if (typeof window === 'undefined' || !article.slug) return;
  void prefetchArticleRoute();
  loadArticle(article.slug).catch(() => undefined);
}

/** Props for any <Link> to an article: warm on intent, load on press, carry the card as a preview. */
export function articleLinkProps(article: Article) {
  return {
    to: article.href,
    state: { preview: article },
    onMouseEnter: () => warmArticle(article),
    onFocus: () => warmArticle(article),
    onPointerDown: () => startArticleLoad(article),
    onKeyDown: (e: { key: string }) => {
      if (e.key === 'Enter') startArticleLoad(article);
    },
  };
}
