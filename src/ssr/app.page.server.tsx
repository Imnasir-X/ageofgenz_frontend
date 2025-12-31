const STATIC_ROUTES = [
  '/',
  '/trending/',
  '/politics/',
  '/sports/',
  '/culture/',
  '/world/',
  '/insights/',
  '/memes/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/donate/',
  '/subscribe/',
  '/login/',
  '/signup/',
];

const SLUGS_ENDPOINT = 'https://ageofgenz-backend.onrender.com/api/articles/slugs/';

const normalizeArticlePath = (slug: string) => `/articles/${slug}/`;

const fetchArticleRoutes = async () => {
  try {
    const response = await fetch(SLUGS_ENDPOINT, { headers: { accept: 'application/json' } });
    if (!response.ok) {
      return [];
    }
    const payload = (await response.json()) as { slugs?: string[] };
    const slugs = Array.isArray(payload?.slugs) ? payload.slugs : [];
    return slugs.filter(Boolean).map(normalizeArticlePath);
  } catch {
    return [];
  }
};

export async function prerender() {
  const articleRoutes = await fetchArticleRoutes();
  return [...STATIC_ROUTES, ...articleRoutes];
}
