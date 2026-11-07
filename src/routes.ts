import { lazyRoute } from '@/lib/lazyRoute';

export const Home = lazyRoute(() => import('./pages/Home'));
export const Section = lazyRoute<{ sectionKey: string }>(() => import('./pages/Section'));
export const Category = lazyRoute(() => import('./pages/Category'));
export const ArticleDetail = lazyRoute(() => import('./pages/ArticleDetail'));
export const SearchResults = lazyRoute(() => import('./pages/SearchResults'));
export const About = lazyRoute(() => import('./pages/About'));
export const Contact = lazyRoute(() => import('./pages/Contact'));
export const Privacy = lazyRoute(() => import('./pages/Privacy'));
export const Terms = lazyRoute(() => import('./pages/Terms'));
export const Login = lazyRoute(() => import('./pages/Login'));
export const Signup = lazyRoute(() => import('./pages/Signup'));
export const ForgotPassword = lazyRoute(() => import('./pages/ForgotPassword'));
export const ResetPassword = lazyRoute(() => import('./pages/ResetPassword'));
export const Subscribe = lazyRoute(() => import('./pages/Subscribe'));
export const Donate = lazyRoute(() => import('./pages/Donate'));
export const ThankYou = lazyRoute(() => import('./pages/ThankYou'));
export const Cancel = lazyRoute(() => import('./pages/Cancel'));
export const Unsubscribe = lazyRoute(() => import('./pages/Unsubscribe'));
export const NotFound = lazyRoute(() => import('./pages/NotFound'));
export const EditorialPolicy = lazyRoute(() => import('./pages/EditorialPolicy'));
export const Corrections = lazyRoute(() => import('./pages/Corrections'));
/** Staff console at /studio/*: client-rendered, never prerendered or indexed. */
export const Studio = lazyRoute(() => import('./studio/StudioApp'));

/** Section URLs preserved from the previous site. */
export const SECTION_ROUTES = [
  'trending',
  'opinion',
  'ai',
  'culture',
  'politics',
  'world',
  'sports',
  'insights',
  'memes',
  'tech',
  'pop-media',
  'science-discovery',
  'global',
  'business-economy',
  'crime-justice',
] as const;

const STATIC: Record<string, { preload: () => Promise<unknown> }> = {
  search: SearchResults,
  about: About,
  contact: Contact,
  privacy: Privacy,
  terms: Terms,
  login: Login,
  signup: Signup,
  'forgot-password': ForgotPassword,
  'reset-password': ResetPassword,
  subscribe: Subscribe,
  donate: Donate,
  support: Donate,
  unsubscribe: Unsubscribe,
  'editorial-policy': EditorialPolicy,
  corrections: Corrections,
};

/** Load the page module for a URL (used before hydration and by link prefetch). */
export function preloadRoute(pathname: string): Promise<unknown> {
  const seg = pathname.split('/').filter(Boolean);
  const first = seg[0] ?? '';
  if (!first || first === 'home') return Home.preload();
  if (first === 'articles') return ArticleDetail.preload();
  if (first === 'category') return Category.preload();
  if ((SECTION_ROUTES as readonly string[]).includes(first)) return Section.preload();
  if (first === 'donation') return seg[1] === 'success' ? ThankYou.preload() : Cancel.preload();
  if (first === 'newsletter') return Unsubscribe.preload();
  if (first === '__shell') return Promise.resolve();
  if (first === 'studio') return Studio.preload();
  return (STATIC[first] ?? NotFound).preload();
}
