import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Trending from './pages/Trending';
import Opinion from './pages/Opinion';
import AI from './pages/AI';
import About from './pages/About';
import Contact from './pages/Contact';
import Category from './pages/Category';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import ArticleDetail from './pages/ArticleDetail';
import Subscribe from './pages/Subscribe';
import SearchResults from './pages/SearchResults';
import ForgotPassword from './pages/ForgotPassword';
import Politics from './pages/Politics';
import Culture from './pages/Culture';
import Sports from './pages/Sports';
import World from './pages/world';
import Insights from './pages/Insights';
import Memes from './pages/Memes';
import Terms from './pages/Terms';
import ThankYou from './pages/ThankYou';
import Cancel from './pages/Cancel';
import DonationPlaceholder from './components/DonationPlaceholder';
import Signup from './pages/Signup';

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
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;