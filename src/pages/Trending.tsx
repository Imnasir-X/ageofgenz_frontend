import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from '../components/ErrorBoundary';
import CategoryGrid from '../components/CategoryGrid';
import { getTrendingArticles, getArticles } from '../utils/api';
import type { Article } from '../types';

const Trending: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        response = await getTrendingArticles();
      } catch {
        response = await getArticles();
      }
      setArticles(response.data?.results || []);
    } catch (e: any) {
      setError(e?.message || 'Could not load trending articles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrending(); }, [fetchTrending]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-8">
        <Helmet>
          <title>Trending | The Age of GenZ</title>
          <meta name="description" content="Trending stories and viral moments across news, culture, and tech." />
        </Helmet>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded shadow">Skip to content</a>
        <div className="container mx-auto px-4 max-w-5xl">
          <section className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What's Hot</h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">Viral moments and breaking news in Gen Z's world.</p>
          </section>

          <main id="main-content">
            <div className="bg-gray-900 rounded border border-gray-800 p-6" aria-live="polite">
              <div className="flex items-center mb-4">
                <TrendingUp className="text-orange-500 mr-2" size={24} />
                <h2 className="text-xl font-bold text-white pb-2 border-b-2 border-orange-500 flex-1">Trending Stories</h2>
              </div>
              <CategoryGrid articles={articles} loading={loading} error={error} onRetry={fetchTrending} />
            </div>

            <div className="mt-4 text-center">
              <Link to="/home" className="text-orange-500 hover:text-orange-600">Home</Link>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Trending;
