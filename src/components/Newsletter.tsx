import React, { useState } from 'react';
import { subscribeToNewsletter } from '../utils/api';
import { Mail, CheckCircle, AlertCircle, Send, Sparkles, Users } from 'lucide-react';

interface NewsletterProps {
  variant?: 'default' | 'compact' | 'featured';
  showBenefits?: boolean;
}

const Newsletter: React.FC<NewsletterProps> = ({ 
  variant = 'default',
  showBenefits = true 
}) => {
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await subscribeToNewsletter(email);
      setStatus('success');
      setMessage(response.data.message || 'Successfully subscribed! Check your email for confirmation.');
      setEmail('');
      setFirstName('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (err: any) {
      setStatus('error');
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        if (err.response.data.email) {
          setMessage('This email is already subscribed.');
        } else {
          setMessage(err.response.data.message || 'Invalid email address.');
        }
      } else {
        setMessage('Failed to subscribe. Please try again later.');
      }
    }
  };

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-900">Quick Subscribe</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={14} />
                  Go
                </>
              )}
            </button>
          </div>
          
          {/* Status Messages for Compact */}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-700 text-xs">
              <CheckCircle size={14} />
              <span>Subscribed successfully!</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle size={14} />
              <span>{message}</span>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Success state for default and featured variants
  if (status === 'success') {
    return (
      <div className={`rounded-xl shadow-sm p-6 text-center overflow-hidden relative ${
        variant === 'featured' 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
          : 'bg-white border border-green-200'
      }`}>
        {/* Success animation background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 animate-bounce">🎉</div>
          <div className="absolute top-8 right-6 animate-bounce animation-delay-300">✨</div>
          <div className="absolute bottom-6 left-6 animate-bounce animation-delay-600">📧</div>
        </div>
        
        <div className="relative z-10">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            variant === 'featured' ? 'bg-white bg-opacity-20' : 'bg-green-100'
          }`}>
            <CheckCircle size={32} className={variant === 'featured' ? 'text-white' : 'text-green-600'} />
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${
            variant === 'featured' ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome to the Community! 🎉
          </h3>
          
          <p className={`mb-4 ${
            variant === 'featured' ? 'text-green-100' : 'text-gray-600'
          }`}>
            {message}
          </p>
          
          <div className={`text-sm ${
            variant === 'featured' ? 'text-green-200' : 'text-gray-500'
          }`}>
            <p>📧 Check your inbox for a confirmation email</p>
            <p className="mt-1">💌 Your first newsletter arrives weekly</p>
          </div>
          
          <button
            onClick={() => {
              setStatus('idle');
              setMessage('');
            }}
            className={`mt-4 text-sm underline transition-colors ${
              variant === 'featured' 
                ? 'text-green-200 hover:text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Subscribe another email
          </button>
        </div>
      </div>
    );
  }

  // Main newsletter component (default and featured variants)
  return (
    <div className={`rounded-xl shadow-sm p-6 relative overflow-hidden ${
      variant === 'featured' 
        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' 
        : 'bg-white border border-gray-200'
    }`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -translate-y-12 translate-x-12"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white bg-opacity-5 rounded-full translate-y-10 -translate-x-10"></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'featured' ? 'bg-white bg-opacity-20' : 'bg-orange-100'
          }`}>
            <Mail size={24} className={variant === 'featured' ? 'text-white' : 'text-orange-500'} />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${
              variant === 'featured' ? 'text-white' : 'text-gray-900'
            }`}>
              Stay Updated with GenZ News
            </h3>
            <p className={`${
              variant === 'featured' ? 'text-orange-100' : 'text-gray-600'
            }`}>
              Get the latest articles, exclusive content, and insights delivered weekly.
            </p>
          </div>
        </div>

        {showBenefits && (
          <div className={`mb-6 p-4 rounded-lg ${
            variant === 'featured' 
              ? 'bg-white bg-opacity-10 border border-white border-opacity-20' 
              : 'bg-gray-50 border border-gray-100'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className={variant === 'featured' ? 'text-orange-200' : 'text-orange-500'} />
              <span className={`text-sm font-medium ${
                variant === 'featured' ? 'text-white' : 'text-gray-900'
              }`}>
                What you'll get:
              </span>
            </div>
            <ul className={`space-y-2 text-sm ${
              variant === 'featured' ? 'text-orange-100' : 'text-gray-600'
            }`}>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>Weekly digest of top stories</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>Exclusive subscriber-only content</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>No spam, unsubscribe anytime</span>
              </li>
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name (optional)"
              className={`w-full px-4 py-3 rounded-lg transition-all focus:ring-2 focus:ring-opacity-50 ${
                variant === 'featured' 
                  ? 'bg-white bg-opacity-20 text-white placeholder-orange-200 border border-white border-opacity-30 focus:ring-white focus:border-white' 
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500'
              }`}
              disabled={status === 'loading'}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className={`w-full px-4 py-3 rounded-lg transition-all focus:ring-2 focus:ring-opacity-50 ${
                variant === 'featured' 
                  ? 'bg-white bg-opacity-20 text-white placeholder-orange-200 border border-white border-opacity-30 focus:ring-white focus:border-white' 
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500'
              }`}
              required
              disabled={status === 'loading'}
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className={`w-full py-3 px-6 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              variant === 'featured'
                ? 'bg-white text-orange-600 hover:bg-orange-50 shadow-lg hover:shadow-xl'
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
            }`}
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Subscribe Now</span>
              </>
            )}
          </button>
        </form>

        {/* Status Messages */}
        {status === 'error' && (
          <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
            variant === 'featured' 
              ? 'bg-white bg-opacity-20 border border-white border-opacity-30' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle size={18} className={`flex-shrink-0 mt-0.5 ${
              variant === 'featured' ? 'text-orange-200' : 'text-red-600'
            }`} />
            <p className={`text-sm ${
              variant === 'featured' ? 'text-orange-100' : 'text-red-700'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* Stats and Trust Indicators */}
        <div className="mt-6 pt-4 border-t border-opacity-20 border-current">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className={variant === 'featured' ? 'text-orange-200' : 'text-gray-500'} />
              <span className={variant === 'featured' ? 'text-orange-200' : 'text-gray-500'}>
                Join 12K+ readers
              </span>
            </div>
            <span className={variant === 'featured' ? 'text-orange-200' : 'text-gray-500'}>
              📧 Weekly • 🔒 Privacy respected
            </span>
          </div>
        </div>

        <p className={`text-xs mt-3 ${
          variant === 'featured' ? 'text-orange-200' : 'text-gray-500'
        }`}>
          By subscribing, you agree to our Privacy Policy. We respect your privacy.
        </p>
      </div>
    </div>
  );
};

export default Newsletter;