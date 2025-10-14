import React from 'react';
import { Link } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import useCategoryArticles from '../hooks/useCategoryArticles';

const Sports: React.FC = () => {
  const { articles, loading, error, retry, hasMore, loadMore } = useCategoryArticles('sports');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Sports Central</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">From game-changing plays to athlete activism — covering sports that matter to the next generation.</p>
        </section>

        <div className="bg-gray-900 rounded border border-gray-800 p-6 shadow-lg mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500">Latest Sports</h2>
          <CategoryGrid
            articles={articles}
            loading={loading}
            error={error}
            onRetry={retry}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Sports;

