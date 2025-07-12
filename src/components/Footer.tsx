import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/logo.png';
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
              <img src={Logo} alt="The Age Of GenZ Logo" className="h-8 w-auto mr-2" />
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
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
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