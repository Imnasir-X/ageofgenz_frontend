import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { InitialDataContext, SeoContext, type InitialData, type SeoCollector } from '@/components/seo/context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Analytics } from '@/components/layout/Analytics';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { SECTIONS } from '@/constants/sections';

const Home = lazy(() => import('./pages/Home'));
const Section = lazy(() => import('./pages/Section'));
const Category = lazy(() => import('./pages/Category'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const Donate = lazy(() => import('./pages/Donate'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const Cancel = lazy(() => import('./pages/Cancel'));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe'));
const NotFound = lazy(() => import('./pages/NotFound'));

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

function LegacyArticleRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/articles/${slug}/` : '/'} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="container space-y-4 pt-12" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-14 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Analytics />
      <Header />
      <main id="main" className="flex-1 outline-none" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              {SECTION_ROUTES.map((key) => (
                <Route key={key} path={SECTIONS[key].path} element={<Section sectionKey={key} />} />
              ))}
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/articles/:slug/*" element={<ArticleDetail />} />
              <Route path="/article/:slug" element={<LegacyArticleRedirect />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/support" element={<Donate />} />
              <Route path="/donation/success" element={<ThankYou />} />
              <Route path="/donation/cancelled" element={<Cancel />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/newsletter/unsubscribe" element={<Unsubscribe />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export function AppProviders({ children, initialData = {}, seo = null }: { children: ReactNode; initialData?: InitialData; seo?: SeoCollector | null }) {
  return (
    <SeoContext.Provider value={seo}>
      <InitialDataContext.Provider value={initialData}>
        <AuthProvider>{children}</AuthProvider>
      </InitialDataContext.Provider>
    </SeoContext.Provider>
  );
}
