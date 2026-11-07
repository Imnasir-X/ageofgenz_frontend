import { CATEGORY_DESCRIPTORS } from '../constants/categories';
import { SECTIONS } from '../constants/sections';
import { normalizeArticle, normalizeAuthorProfile } from '../lib/api/normalize';
import type { InitialData } from '../components/seo/context';

const API = (process.env.VITE_API_URL || 'https://ageofgenz-backend.onrender.com').replace(/\/$/, '');

export const STATIC_ROUTES = [
  '/',
  '/home/',
  ...Object.values(SECTIONS).map((s) => s.path),
  ...CATEGORY_DESCRIPTORS.map((d) => `/category/${d.slug}/`),
  '/search/',
  '/about/',
  '/editorial-policy/',
  '/corrections/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/donate/',
  '/support/',
  '/subscribe/',
  '/login/',
  '/signup/',
  '/forgot-password/',
  '/reset-password/',
  '/unsubscribe/',
  '/donation/success/',
  '/donation/cancelled/',
  '/newsletter/unsubscribe/',
  '/404/',
  '/__shell/',
];

async function fetchJson(url: string, timeoutMs = 25000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' }, signal: controller.signal });
    if (res.status === 404) return { __missing: true };
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function prerender() {
  const data = (await fetchJson(`${API}/api/articles/slugs/`)) as { slugs?: string[] } | null;
  const slugs = Array.isArray(data?.slugs) ? data.slugs.filter(Boolean) : [];
  // Author pages (GET /api/authors/): one prerendered page per active author with a safe slug.
  const authors = await fetchJson(`${API}/api/authors/`);
  const authorSlugs = Array.isArray(authors)
    ? authors
        .map((a) => (a && typeof a === 'object' ? (a as { slug?: unknown }).slug : null))
        .filter((s): s is string => typeof s === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(s))
    : [];
  return [...new Set([...STATIC_ROUTES, ...slugs.map((s) => `/articles/${s}/`), ...authorSlugs.map((s) => `/author/${s}/`)])];
}

/** Fetch the article before render so prerendered HTML carries the full body, not a skeleton. */
export async function onBeforeRender(pageContext: { urlOriginal: string }) {
  const match = pageContext.urlOriginal.match(/^\/articles\/([^/?#]+)/);
  const initialData: InitialData = { path: pageContext.urlOriginal };
  if (match) {
    const slug = decodeURIComponent(match[1]);
    const raw = await fetchJson(`${API}/api/articles/${encodeURIComponent(slug)}/?include_blocks=1`);
    if (raw && typeof raw === 'object' && '__missing' in raw) initialData.articleMissing = true;
    else if (raw) initialData.article = normalizeArticle(raw);
  }
  const author = pageContext.urlOriginal.match(/^\/author\/([^/?#]+)/);
  if (author) {
    const slug = decodeURIComponent(author[1]);
    const raw = await fetchJson(`${API}/api/authors/${encodeURIComponent(slug)}/`);
    if (raw && typeof raw === 'object' && '__missing' in raw) initialData.authorMissing = true;
    else if (raw) initialData.author = normalizeAuthorProfile(raw, 1);
  }
  return { pageContext: { initialData } };
}
