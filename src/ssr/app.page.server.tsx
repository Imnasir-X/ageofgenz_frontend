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

export async function prerender() {
  return STATIC_ROUTES;
}
