import React from 'react';
import { Link } from 'react-router-dom';
import { subscribeToNewsletter } from '../utils/api';
import { Mail, MapPin, Globe, Sparkles, TrendingUp, Clock, Users, MessageCircle, Eye, BookOpen, Activity, Check, Zap, Star, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isValidating, setIsValidating] = React.useState<boolean>(false);
  const [emailSuggestion, setEmailSuggestion] = React.useState<string>('');
  const [scrollProgress, setScrollProgress] = React.useState<number>(0);
  const [emailFocused, setEmailFocused] = React.useState<boolean>(false);
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);
  const [currentPlaceholder, setCurrentPlaceholder] = React.useState<string>('Enter your email...');
  const [aiAnalyzing, setAiAnalyzing] = React.useState<boolean>(false);
  const [liveStats, setLiveStats] = React.useState({
    activeReaders: 2847,
    storiesPublished: 127,
    breakingAlerts: 8
  });

  // Dynamic placeholders for news context
  const placeholders = [
    'Enter your email...',
    'Stay informed daily...',
    'Get breaking news alerts...',
    'Join informed readers...'
  ];

  // Cycle through placeholders
  React.useEffect(() => {
    if (!emailFocused && !email) {
      const interval = setInterval(() => {
        setCurrentPlaceholder(prev => {
          const currentIndex = placeholders.indexOf(prev);
          return placeholders[(currentIndex + 1) % placeholders.length];
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [emailFocused, email, placeholders]);

  // Enhanced live stats with news-focused updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeReaders: Math.max(2000, prev.activeReaders + Math.floor(Math.random() * 16) - 8),
        storiesPublished: prev.storiesPublished + (Math.random() > 0.85 ? 1 : 0),
        breakingAlerts: prev.breakingAlerts + (Math.random() > 0.95 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Track scroll progress for enhanced scroll button
  React.useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Enhanced email validation with professional tone
  const validateEmailSmart = (emailValue: string) => {
    setIsValidating(true);
    setAiAnalyzing(true);
    
    setTimeout(() => {
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
      const emailParts = emailValue.split('@');
      
      if (emailParts.length === 2 && emailParts[1]) {
        const domain = emailParts[1].toLowerCase();
        const suggestion = commonDomains.find(d => d.startsWith(domain) && d !== domain);
        if (suggestion) {
          setEmailSuggestion(`${emailParts[0]}@${suggestion}`);
        } else {
          setEmailSuggestion('');
        }
      }
      setIsValidating(false);
      setAiAnalyzing(false);
    }, 400);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

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
      setShowSuccess(true);
      
      // Personalized message based on email domain (news-focused)
      const domain = email.split('@')[1]?.toLowerCase();
      let personalizedMessage = '🎉 Welcome to our informed community!';
      
      if (domain?.includes('gmail')) personalizedMessage = '🎉 Welcome! Breaking news alerts now enabled.';
      else if (domain?.includes('yahoo')) personalizedMessage = '🎉 Great choice! Daily briefings coming your way.';
      else if (domain?.includes('outlook') || domain?.includes('hotmail')) personalizedMessage = '🎉 Excellent! You\'re now part of our news network.';
      else if (domain?.includes('edu')) personalizedMessage = '🎉 Academic subscriber! Educational content prioritized.';
      
      setMessage(personalizedMessage);
      setEmail('');
      setEmailSuggestion('');
      
      // Reset success animation after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setError('Failed to subscribe. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value.includes('@') && value.length > 5) {
      validateEmailSmart(value);
    } else {
      setEmailSuggestion('');
      setAiAnalyzing(false);
    }
  };

  const handleEmailFocus = () => {
    setEmailFocused(true);
    setCurrentPlaceholder('Enter your email...');
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
  };

  const applySuggestion = () => {
    setEmail(emailSuggestion);
    setEmailSuggestion('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock data for social media (in real app, fetch from API)
  const socialStats = {
    twitter: { followers: '12.5K', recent: 'new' },
    facebook: { followers: '8.2K', recent: 'active' },
    instagram: { followers: '15.1K', recent: 'new' },
    youtube: { followers: '6.8K', recent: 'live' }
  };

  // Dynamic quick links with intelligence
  const quickLinks = [
    { to: '/about', label: 'About', badge: null },
    { to: '/contact', label: 'Contact', badge: '24h response' },
    { to: '/join', label: 'Careers', badge: 'hiring' },
    { to: '/privacy', label: 'Privacy', badge: null },
    { to: '/terms', label: 'Terms', badge: null },
    { to: '/trending', label: 'Trending', badge: 'hot' }
  ];

  return (
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img src="/logo.png?v=2025" alt="The Age Of GenZ Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl font-bold tracking-tight">The Age Of GenZ</span>
            </div>
            <p className="text-orange-500 font-medium text-lg mb-4">
              "NEWS YOU CAN VIBE WITH"
            </p>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Professional news organization delivering quality journalism for all generations across the globe.
            </p>
            
            {/* Enhanced Social Media */}
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/TheAgeOfGenZ"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group text-gray-400 hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
                aria-label="Follow us on X"
                title={`Follow @TheAgeOfGenZ on X • ${socialStats.twitter.followers} followers`}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {socialStats.twitter.recent === 'new' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                )}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {socialStats.twitter.followers} followers
                </div>
              </a>
              
              <a
                href="https://facebook.com/theageofgenz"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group text-gray-400 hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
                aria-label="Follow us on Facebook"
                title={`Follow us on Facebook • ${socialStats.facebook.followers} followers`}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {socialStats.facebook.followers} followers
                </div>
              </a>
              
              <a
                href="https://instagram.com/theageofgenz"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group text-gray-400 hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
                aria-label="Follow us on Instagram"
                title={`Follow us on Instagram • ${socialStats.instagram.followers} followers`}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                {socialStats.instagram.recent === 'new' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                )}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {socialStats.instagram.followers} followers
                </div>
              </a>
              
              <a
                href="https://youtube.com/@theageofgenz"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group text-gray-400 hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
                aria-label="Subscribe to our YouTube channel"
                title={`Subscribe to our YouTube channel • ${socialStats.youtube.followers} subscribers`}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                {socialStats.youtube.recent === 'live' && (
                  <div className="absolute -top-1 -right-1 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {socialStats.youtube.followers} subscribers
                </div>
              </a>
            </div>
          </div>

          {/* Column 2: Enhanced Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-white flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-orange-500" />
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {quickLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="relative group text-gray-400 hover:text-orange-600 transition-all duration-300 transform hover:scale-102 flex items-center"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full text-white ${
                      link.badge === 'hot' ? 'bg-red-500 animate-pulse' :
                      link.badge === 'hiring' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                  {link.badge === 'hot' && <TrendingUp className="w-3 h-3 ml-1 text-red-500" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Professional Newsletter */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-3 text-white flex items-center">
                <div className="relative mr-3">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  {aiAnalyzing && (
                    <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-pulse"></div>
                  )}
                </div>
                Stay Informed
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-500" />
                  Join <span className="text-orange-500 font-bold mx-1">25,000+</span> informed readers
                </p>
                <div className="flex items-center text-xs text-gray-400 space-x-4">
                  <span className="flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    Breaking news alerts
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-blue-500" />
                    Daily briefings
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleNewsletterSubmit}>
                {message && (
                  <div className={`mb-3 p-3 rounded-lg text-sm flex items-center transition-all duration-300 ${
                    showSuccess ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-green-900 text-green-300'
                  }`}>
                    <div className="flex items-center">
                      {showSuccess && (
                        <div className="mr-2">
                          <Check className="w-4 h-4 animate-bounce" />
                        </div>
                      )}
                      <span>{message}</span>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mb-3 p-3 bg-red-900 text-red-300 rounded-lg text-sm border border-red-700">
                    {error}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={handleEmailFocus}
                      onBlur={handleEmailBlur}
                      placeholder={currentPlaceholder}
                      className={`w-full p-3 text-sm bg-gray-800/50 border-2 rounded-lg text-white focus:outline-none transition-all duration-200 backdrop-blur-sm ${
                        emailFocused ? 'border-orange-500 bg-gray-800/70 shadow-md shadow-orange-500/10' : 'border-gray-600 hover:border-gray-500'
                      } ${aiAnalyzing ? 'border-orange-400' : ''}`}
                      required
                      disabled={loading}
                    />
                    
                    {/* Validation Indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {aiAnalyzing && (
                        <>
                          <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          </div>
                        </>
                      )}
                      {email && !aiAnalyzing && !emailSuggestion && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    
                    {/* Email Validation Progress */}
                    {emailFocused && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-orange-500 transition-all duration-200 ${
                          email.length > 0 ? 'w-1/3' : 'w-0'
                        } ${email.includes('@') ? 'w-2/3' : ''} ${
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'w-full bg-green-500' : ''
                        }`}></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Smart Email Suggestions */}
                  {emailSuggestion && (
                    <button
                      type="button"
                      onClick={applySuggestion}
                      className="w-full text-left text-sm bg-orange-900/30 hover:bg-orange-900/50 text-orange-300 p-2 rounded-lg border border-orange-700/30 transition-all duration-200 flex items-center"
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      Did you mean: <span className="font-semibold underline ml-1">{emailSuggestion}</span>?
                    </button>
                  )}
                  
                  {/* Professional Subscribe Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform flex items-center justify-center space-x-2 ${
                      loading 
                        ? 'bg-orange-600 cursor-wait scale-98' 
                        : showSuccess
                        ? 'bg-green-600 scale-102 shadow-md shadow-green-500/20'
                        : 'bg-orange-500 hover:bg-orange-600 hover:scale-102 hover:shadow-md hover:shadow-orange-500/20'
                    } ${email && !loading ? 'text-white' : 'text-gray-200'}`}
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : showSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Subscribed!</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Subscribe Now</span>
                      </>
                    )}
                  </button>
                  
                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-2">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      No spam policy
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      Unsubscribe anytime
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Professional Live News Stats */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 rounded-xl p-5 mb-6 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-orange-500" />
                Live News Activity
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Real-time updates
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center group cursor-default">
                <div className="relative inline-flex items-center justify-center mb-2">
                  <div className="absolute inset-0 bg-orange-500/15 rounded-full animate-pulse"></div>
                  <Eye className="w-5 h-5 text-orange-500 relative z-10 group-hover:scale-105 transition-transform duration-200" />
                </div>
                <div className="text-xl font-bold text-white mb-1 transition-all duration-300">
                  {liveStats.activeReaders.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 leading-tight">active<br />readers</div>
              </div>
              
              <div className="text-center group cursor-default">
                <div className="relative inline-flex items-center justify-center mb-2">
                  <div className="absolute inset-0 bg-blue-500/15 rounded-full animate-pulse"></div>
                  <BookOpen className="w-5 h-5 text-blue-500 relative z-10 group-hover:scale-105 transition-transform duration-200" />
                </div>
                <div className="text-xl font-bold text-white mb-1 transition-all duration-300">
                  {liveStats.storiesPublished.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 leading-tight">stories<br />today</div>
              </div>
              
              <div className="text-center group cursor-default">
                <div className="relative inline-flex items-center justify-center mb-2">
                  <div className="absolute inset-0 bg-red-500/15 rounded-full animate-pulse"></div>
                  <Zap className="w-5 h-5 text-red-500 relative z-10 group-hover:scale-105 transition-transform duration-200" />
                </div>
                <div className="text-xl font-bold text-white mb-1 transition-all duration-300">
                  {liveStats.breakingAlerts}
                </div>
                <div className="text-xs text-gray-400 leading-tight">breaking<br />alerts</div>
              </div>
            </div>
            
            {/* News Activity Pulse */}
            <div className="mt-4 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <div className="flex items-center space-x-1 mr-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span>Live newsroom updates • Est. 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Contact Information */}
        <div className="border-t border-gray-800 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left text-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start group">
              <MapPin className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
              <div>
                <p className="text-gray-300 font-medium">71 No. Councilor Street, Dhaka, Bangladesh</p>
                <p className="text-xs text-gray-500 mt-1">📍 Editorial office • Press accredited</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start group">
              <Mail className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
              <div>
                <a 
                  href="mailto:contact@theageofgenz.com" 
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  contact@theageofgenz.com
                </a>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <p className="text-xs text-gray-500">Response within 2 hours</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start group">
              <Globe className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
              <div>
                <p className="text-gray-300">Global Coverage: US, Europe & Asia</p>
                <div className="flex items-center mt-1">
                  <Users className="w-3 h-3 text-gray-500 mr-1" />
                  <p className="text-xs text-gray-500">Trusted by journalists worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
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
                className="relative group text-gray-400 hover:text-orange-600 text-sm flex items-center transition-all duration-200 transform hover:scale-102"
                aria-label="Scroll to top"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <div 
                      className="absolute inset-0 bg-orange-500 rounded-full opacity-15"
                      style={{ transform: `scale(${scrollProgress / 100})` }}
                    ></div>
                  </div>
                  <span>Back to Top ({Math.round(scrollProgress)}%)</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;