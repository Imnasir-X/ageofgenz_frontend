import React from 'react';
import { Link } from 'react-router-dom';
// ✅ REMOVED: import Logo from '../assets/images/logo.png';
import { subscribeToNewsletter } from '../utils/api';
import { Mail, MapPin, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    // Basic email validation
    if (!email.trim()) {
      setError('Email address is required.');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await subscribeToNewsletter(email.trim());
      setMessage('Successfully subscribed!');
      setEmail('');
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              {/* ✅ FIXED: Use public folder logo with cache-busting */}
              <img src="/logo.png?v=2025" alt="The Age Of GenZ Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl font-bold tracking-tight">The Age Of GenZ</span>
            </div>
            <p className="text-orange-500 font-medium text-lg mb-4">
              "NEWS YOU CAN VIBE WITH"
            </p>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Professional news organization delivering quality journalism for all generations across the globe.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/TheAgeOfGenZ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-600 transition-colors"
                aria-label="Follow us on X"
                title="Follow @TheAgeOfGenZ on X"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/theageofgenz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-600 transition-colors"
                aria-label="Follow us on Facebook"
                title="Follow us on Facebook"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/theageofgenz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-600 transition-colors"
                aria-label="Follow us on Instagram"
                title="Follow us on Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com/@theageofgenz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-600 transition-colors"
                aria-label="Subscribe to our YouTube channel"
                title="Subscribe to our YouTube channel"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-orange-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-400 hover:text-orange-600 transition-colors">Contact</Link>
              <Link to="/join" className="text-gray-400 hover:text-orange-600 transition-colors">Careers</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-orange-600 transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-600 transition-colors">Terms</Link>
              <Link to="/trending" className="text-gray-400 hover:text-orange-600 transition-colors">Trending</Link>
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-white">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for the latest news and updates.
            </p>
            
            <form onSubmit={handleNewsletterSubmit}>
              {message && <p className="text-green-500 mb-2 text-sm">{message}</p>}
              {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
              
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-2 text-sm bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left text-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <MapPin className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <div>
                <p className="text-gray-300 font-medium">71 No. Councilor Street, Dhaka, Bangladesh</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <Mail className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <div>
                <a 
                  href="mailto:contact@theageofgenz.com" 
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  contact@theageofgenz.com
                </a>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <Globe className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0" />
              <div>
                <p className="text-gray-300">Global Coverage: US, Europe & Asia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} The Age Of GenZ LLC. All rights reserved.
            </p>
            
            <div className="mt-2 md:mt-0 flex items-center space-x-4">
              <Link to="/privacy" className="text-gray-400 hover:text-orange-600 text-sm transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-600 text-sm transition-colors">Terms</Link>
              <button
                onClick={scrollToTop}
                className="text-gray-400 hover:text-orange-600 text-sm flex items-center transition-colors"
                aria-label="Scroll to top"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;