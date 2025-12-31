import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Trending = lazy(() => import('./pages/Trending'));
const Opinion = lazy(() => import('./pages/Opinion'));
const AI = lazy(() => import('./pages/AI'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Category = lazy(() => import('./pages/Category'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Politics = lazy(() => import('./pages/Politics'));
const Culture = lazy(() => import('./pages/Culture'));
const Sports = lazy(() => import('./pages/Sports'));
const World = lazy(() => import('./pages/world'));
const Insights = lazy(() => import('./pages/Insights'));
const Memes = lazy(() => import('./pages/Memes'));
const Terms = lazy(() => import('./pages/Terms'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const Cancel = lazy(() => import('./pages/Cancel'));
const DonationPlaceholder = lazy(() => import('./components/DonationPlaceholder'));
const Signup = lazy(() => import('./pages/Signup'));

const DEFAULT_TITLE = 'The Age of GenZ | NEWS YOU CAN VIBE WITH';
const DEFAULT_DESCRIPTION =
  'The Age of GenZ delivers NEWS YOU CAN VIBE WITH - breaking news, politics, culture & technology from a generational perspective.';
const DEFAULT_OG_IMAGE = 'https://theageofgenz.com/og-image.jpg';
const DEFAULT_TWITTER_IMAGE = 'https://theageofgenz.com/twitter-card.jpg';

const LegacyArticleRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={`/articles/${slug}/`} replace />;
};

export const AppRoutes: React.FC = () => {
  const location = useLocation();
  const canonicalPath = location.pathname.endsWith('/')
    ? location.pathname
    : `${location.pathname}/`;
  const canonicalUrl = `https://theageofgenz.com${canonicalPath}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Age of GenZ',
    url: 'https://theageofgenz.com',
    logo: 'https://theageofgenz.com/logo.png',
    sameAs: ['https://theageofgenz.com'],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="The Age of GenZ" />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_TWITTER_IMAGE} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Age of GenZ RSS Feed"
          href="https://theageofgenz.com/rss.xml"
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/opinion" element={<Opinion />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Category-specific routes that map to your components */}
            <Route path="/culture" element={<Culture />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/politics" element={<Politics />} />
            <Route path="/world" element={<World />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/memes" element={<Memes />} />

            {/* Generic category route for any other categories */}
            <Route path="/category/:slug" element={<Category />} />

            <Route path="/privacy" element={<Privacy />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/articles/:slug/*" element={<ArticleDetail />} />
            <Route path="/article/:slug" element={<LegacyArticleRedirect />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/donate" element={<DonationPlaceholder />} />
            <Route path="/donation/success" element={<ThankYou />} />
            <Route path="/donation/cancelled" element={<Cancel />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => (
  <HelmetProvider>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </HelmetProvider>
);

export default App;
