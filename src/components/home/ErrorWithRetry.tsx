import React from 'react';
import { RefreshCw } from 'lucide-react';

type ErrorWithRetryProps = {
  error: string;
  onRetry: () => void;
  section: string;
};

const ErrorWithRetry: React.FC<ErrorWithRetryProps> = ({ error, onRetry, section }) => (
  <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <RefreshCw size={32} className="text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Content</h3>
    <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
    >
      <RefreshCw size={18} className="mr-2" />
      Try Again
    </button>
    <p className="text-gray-500 mt-4 text-sm">
      {section === 'featured' && "Featured articles will appear here once they're added to the system."}
      {section === 'latest' && "Latest articles will appear here once they're published."}
    </p>
  </div>
);

export default ErrorWithRetry;
