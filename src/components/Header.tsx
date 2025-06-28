import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '../assets/images/logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Desktop nav link styles - smaller and more compact
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `transition-colors font-medium text-sm ${isActive ? 'text-orange-500' : 'text-white'} hover:text-orange-500`;

  // Mobile nav link styles
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `block py-3 px-2 text-base ${isActive ? 'text-orange-500 font-semibold bg-gray-800 rounded' : 'text-white'} hover:text-orange-500 hover:bg-gray-800 rounded transition-all duration-200`;

  return (
    <header className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="The Age of GenZ" className="h-10 w-auto" />
            <span className="text-2xl md:text-3xl font-bold tracking-tight font-inknut">
              The Age Of GenZ 
            </span>
          </Link>

          {/* Desktop Navigation - Compact design */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-4 items-center">
              <li><NavLink to="/home" className={navLinkClasses}>Newsroom</NavLink></li>
              <li><NavLink to="/trending" className={navLinkClasses}>Hot</NavLink></li>
              <li><NavLink to="/ai" className={navLinkClasses}>AI & Tech</NavLink></li>
              <li><NavLink to="/opinion" className={navLinkClasses}>Voices</NavLink></li>
              <li><NavLink to="/world" className={navLinkClasses}>World</NavLink></li>
              <li><NavLink to="/politics" className={navLinkClasses}>Politics</NavLink></li>

              <li>
                <NavLink
                  to="/join"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Join
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {/* Hamburger/Close Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden pt-4 pb-4 border-t border-gray-800 bg-black text-white">
            <div className="px-2 space-y-1">
              {/* Primary Navigation */}
              <div className="space-y-1">
                <NavLink to="/home" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  🏠 Newsroom
                </NavLink>
                <NavLink to="/trending" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  🔥 What's Hot
                </NavLink>
                <NavLink to="/ai" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  🤖 AI & Tech
                </NavLink>
                <NavLink to="/opinion" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  💭 Voices
                </NavLink>
                <NavLink to="/world" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  🌍 World
                </NavLink>
                <NavLink to="/politics" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  🏛️ Politics
                </NavLink>
              </div>
              
              {/* Secondary Categories */}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2 px-2 font-medium">More Sections</p>
                <div className="space-y-1">
                  <NavLink to="/culture" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                    🎨 Culture
                  </NavLink>
                  <NavLink to="/sports" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                    ⚽ Sports
                  </NavLink>
                  <NavLink to="/insights" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                    📊 Insights
                  </NavLink>
                  <NavLink to="/memes" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                    😂 Memes
                  </NavLink>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="border-t border-gray-700 pt-4 mt-4 space-y-3">
                <Link
                  to="/join"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  🚀 Join Our Community
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  🔐 Login
                </Link>
              </div>

              {/* Quick Social Links */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 px-2 font-medium">Follow Us</p>
                <div className="flex justify-center space-x-6">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63z"/>
                    </svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.75 2.25h2.25a5.25 5.25 0 005.25 5.25v2.25a7.5 7.5 0 01-5.25-2.25v6.939a4.689 4.689 0 11-4.5-4.689v2.295a2.25 2.25 0 102.25 2.25V2.25z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;