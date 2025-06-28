import React, { useState } from 'react';
import { subscribeToNewsletter } from '../utils/api';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

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

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
    );
  }

  return (
    <div className={`${variant === 'featured' ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' : 'bg-gray-100'} rounded-lg p-6`}>
      <div className="flex items-start gap-4">
        <Mail className={`${variant === 'featured' ? 'text-white' : 'text-orange-500'} flex-shrink-0`} size={24} />
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 ${variant === 'featured' ? 'text-white' : 'text-gray-900'}`}>
            Stay Updated with GenZ News
          </h3>
          <p className={`mb-4 ${variant === 'featured' ? 'text-orange-100' : 'text-gray-600'}`}>
            Get the latest articles, exclusive content, and insights delivered to your inbox weekly.
          </p>

          {showBenefits && (
            <ul className={`mb-4 space-y-1 text-sm ${variant === 'featured' ? 'text-orange-100' : 'text-gray-600'}`}>
              <li className="flex items-center">
                <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                Weekly digest of top stories
              </li>
              <li className="flex items-center">
                <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                Exclusive subscriber-only content
              </li>
              <li className="flex items-center">
                <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                No spam, unsubscribe anytime
              </li>
            </ul>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name (optional)"
                className={`px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  variant === 'featured' 
                    ? 'bg-white/20 text-white placeholder-orange-200 border-orange-400' 
                    : 'bg-white border border-gray-300'
                }`}
                disabled={status === 'loading'}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className={`flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  variant === 'featured' 
                    ? 'bg-white/20 text-white placeholder-orange-200 border-orange-400' 
                    : 'bg-white border border-gray-300'
                }`}
                required
                disabled={status === 'loading'}
              />
            </div>
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`w-full sm:w-auto px-6 py-2 font-medium rounded-lg transition-all disabled:opacity-50 ${
                variant === 'featured'
                  ? 'bg-white text-orange-600 hover:bg-orange-50'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Subscribing...
                </span>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </form>

          {/* Status Messages */}
          {status === 'success' && (
            <div className={`mt-3 flex items-start gap-2 ${variant === 'featured' ? 'text-white' : 'text-green-700'}`}>
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className={`mt-3 flex items-start gap-2 ${variant === 'featured' ? 'text-orange-100' : 'text-red-700'}`}>
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          <p className={`text-xs mt-3 ${variant === 'featured' ? 'text-orange-100' : 'text-gray-500'}`}>
            By subscribing, you agree to our Privacy Policy. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;