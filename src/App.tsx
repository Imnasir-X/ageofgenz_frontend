import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Helmet>
              <title>The Age of GenZ</title>
              <meta name="description" content="Your trusted source for news that matters to Generation Z." />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Helmet>
            <Header />
            <main className="flex-grow">
              <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading…</div>}>
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
                <Route path="/article/:slug" element={<ArticleDetail />} />
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
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
