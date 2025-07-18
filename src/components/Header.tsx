import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
// ✅ REMOVED: import Logo from '../assets/images/logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Desktop nav link styles - with explicit colors to prevent CSS conflicts
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `transition-colors font-medium text-sm ${isActive ? 'text-orange-500' : 'text-white'} hover:text-orange-500`;

  // Mobile nav link styles - with explicit colors
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `block py-2 px-3 text-sm ${isActive ? 'text-orange-500 font-semibold bg-gray-800 rounded' : 'text-white'} hover:text-orange-500 hover:bg-gray-800 rounded transition-all duration-200`;

  return (
    <header className="header-nav bg-black text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo and Title - Force white text */}
          <Link to="/" className="flex items-center space-x-2">
            {/* ✅ FIXED: Use public folder logo with cache-busting */}
            <img src="/logo.png?v=2025" alt="The Age of GenZ" className="h-10 w-auto" />
            <span className="text-2xl md:text-3xl font-bold tracking-tight font-inknut text-white">
              The Age Of GenZ 
            </span>
          </Link>

          {/* Desktop Navigation - Force styles to prevent conflicts */}
          <nav className="hidden lg:block header-desktop-nav">
            <ul className="flex space-x-4 items-center">
              <li><NavLink to="/home" className={navLinkClasses}>Newsroom</NavLink></li>
              <li><NavLink to="/trending" className={navLinkClasses}>Hot</NavLink></li>
              <li><NavLink to="/ai" className={navLinkClasses}>AI & Tech</NavLink></li>
              <li><NavLink to="/opinion" className={navLinkClasses}>Voices</NavLink></li>
              <li><NavLink to="/world" className={navLinkClasses}>World</NavLink></li>
              <li><NavLink to="/politics" className={navLinkClasses}>Politics</NavLink></li>

              <li>
                <NavLink
                  to="/subscribe"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Subscribe
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

          {/* Mobile Menu Button - Force white color */}
          <button
            className="lg:hidden p-2 text-white hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Force black background and white text */}
        {isMenuOpen && (
          <nav className="lg:hidden pt-3 pb-3 border-t border-gray-800 bg-black text-white header-mobile-nav">
            <div className="px-2 space-y-1">
              {/* Main Navigation */}
              <div className="space-y-1">
                <NavLink to="/home" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m2.25-13.5h.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25M3.75 5.25h.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.75m0 0h-.375c-.621 0-1.125-.504-1.125-1.125V5.625c0-.621.504-1.125 1.125-1.125H3.75z" />
                    </svg>
                    <span className="text-white">Newsroom</span>
                  </div>
                </NavLink>
                <NavLink to="/trending" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    <span className="text-white">What's Hot</span>
                  </div>
                </NavLink>
                <NavLink to="/ai" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                    <span className="text-white">AI & Tech</span>
                  </div>
                </NavLink>
                <NavLink to="/opinion" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <span className="text-white">Voices</span>
                  </div>
                </NavLink>
                <NavLink to="/world" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <span className="text-white">World</span>
                  </div>
                </NavLink>
                <NavLink to="/politics" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3z" />
                    </svg>
                    <span className="text-white">Politics</span>
                  </div>
                </NavLink>
              </div>
              
              {/* Action Buttons */}
              <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                <Link
                  to="/subscribe"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span className="text-white">Subscribe</span>
                  </div>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>Login</span>
                  </div>
                </Link>
              </div>

              {/* Compact Social Links */}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-center items-center space-x-6">
                  <span className="text-gray-400 text-xs font-medium">Follow:</span>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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