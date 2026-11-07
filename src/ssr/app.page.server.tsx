import { CATEGORY_DESCRIPTORS } from '../constants/categories';
import { SECTIONS } from '../constants/sections';
import { normalizeArticle } from '../lib/api/normalize';
import type { InitialData } from '../components/seo/context';

const API = (process.env.VITE_API_URL || 'https://ageofgenz-backend.onrender.com').replace(/\/$/, '');

export const STATIC_ROUTES = [
  '/',
  '/home/',
  ...Object.values(SECTIONS).map((s) => s.path),
  ...CATEGORY_DESCRIPTORS.map((d) => `/category/${d.slug}/`),
  '/search/',
  '/about/',
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
  '/404/',
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
  return [...new Set([...STATIC_ROUTES, ...slugs.map((s) => `/articles/${s}/`)])];
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
  return { pageContext: { initialData } };
}
