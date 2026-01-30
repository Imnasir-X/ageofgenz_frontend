import React from 'react';
import { RefreshCw } from 'lucide-react';

type ErrorWithRetryProps = {
  error: string;
  onRetry: () => void;
  section: string;
  isRetrying?: boolean;
};

const ErrorWithRetry: React.FC<ErrorWithRetryProps> = ({ error, onRetry, section, isRetrying = false }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center" role="alert">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <RefreshCw size={32} className="text-red-500" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Content</h3>
    <p className="text-gray-700 mb-6 max-w-md mx-auto">We couldn&apos;t load this content right now.</p>
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <RefreshCw size={18} className="mr-2" aria-hidden="true" />
      {isRetrying ? 'Retrying...' : 'Try Again'}
    </button>
    <p className="text-gray-500 mt-4 text-sm">
      {section === 'featured' && 'Featured stories will appear here once available.'}
      {section === 'latest' && 'Latest stories will appear here shortly.'}
    </p>
  </div>
);

export default ErrorWithRetry;
