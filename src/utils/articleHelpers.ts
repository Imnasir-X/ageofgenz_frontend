import type { Article } from '../types';

type ArticleLike = Pick<Article, 'canonical_url' | 'slug'> | {
  canonical_url?: string | null;
  slug?: string | null;
  id?: number | string | null;
};

const ensureLeadingSlash = (value: string): string => {
  if (!value.startsWith('/')) {
    return `/${value}`;
  }
  return value;
};

const stripDomain = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const path = url.pathname || '/';
      const search = url.search || '';
      const hash = url.hash || '';
      const combined = `${path}${search}${hash}`;
      if (search || hash || combined.endsWith('/')) {
        return combined || '/';
      }
      return `${combined}/`;
    } catch {
      const fallback = ensureLeadingSlash(trimmed.replace(/^https?:\/\/[^/]+/i, ''));
      if (/[?#]/.test(fallback) || fallback.endsWith('/')) {
        return fallback;
      }
      return `${fallback}/`;
    }
  }

  const normalized = ensureLeadingSlash(trimmed);
  if (/[?#]/.test(normalized) || normalized.endsWith('/')) {
    return normalized;
  }
  return `${normalized}/`;
};

const normalizeSlug = (slug: string): string => slug.replace(/^\/+/, '').replace(/\/+$/, '');

export const getArticleHref = (article: ArticleLike | null | undefined): string => {
  if (!article) {
    return '#';
  }

  const canonical = typeof article.canonical_url === 'string' ? article.canonical_url.trim() : '';
  if (canonical) {
    const path = stripDomain(canonical);
    return path || '#';
  }

  const slug = typeof article.slug === 'string' ? article.slug.trim() : '';
  if (slug) {
    const normalized = normalizeSlug(slug);
    return normalized ? `/articles/${normalized}/` : '#';
  }

  if (typeof (article as { id?: number | string }).id !== 'undefined') {
    const fallbackId = (article as { id?: number | string }).id;
    if (fallbackId !== null && fallbackId !== undefined) {
      return `/articles/${fallbackId}/`;
    }
  }

  return '#';
};

export const extractCanonicalPath = (link: string | null | undefined): string => {
  if (typeof link !== 'string') {
    return '';
  }
  return stripDomain(link);
};
