import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StoryCard } from '@/components/news/StoryCard';
import { EmptyState, ErrorState, StoryGridSkeleton } from '@/components/news/States';
import { useAsync } from '@/hooks/useAsync';
import { articlesApi } from '@/lib/api/client';
import { PRIMARY_NAV, SECTIONS } from '@/constants/sections';
import { Link } from 'react-router-dom';

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [value, setValue] = useState(q);
  useEffect(() => setValue(q), [q]);

  const { data, error, loading, reload } = useAsync(
    async (signal) => (q.length >= 2 ? articlesApi.list({ search: q, signal }) : { results: [], count: 0, next: null }),
    q,
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = value.trim();
    setParams(next ? { q: next } : {});
  };

  const results = data?.results ?? [];
  return (
    <>
      <Seo title={q ? `Search: ${q}` : 'Search'} description="Search The Age of GenZ stories by topic, place or person." path="/search/" noindex={Boolean(q)} />
      <div className="container max-w-4xl pt-8 sm:pt-12">
        <p className="eyebrow text-primary">Search</p>
        <form onSubmit={submit} role="search" className="mt-4 flex gap-2">
          <label htmlFor="search-q" className="sr-only">
            Search stories
          </label>
          <Input id="search-q" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search stories, topics, places" className="h-12 text-lg" autoFocus={!q} />
          <Button type="submit" size="lg" className="h-12">
            <Search /> <span className="hidden sm:inline">Search</span>
          </Button>
        </form>
        {q && (
          <p className="mt-6 font-display text-2xl font-medium" aria-live="polite">
            {loading ? 'Searching…' : `${data?.count ?? 0} ${data?.count === 1 ? 'result' : 'results'} for “${q}”`}
          </p>
        )}
        <div className="mt-6">
          {!q || q.length < 2 ? (
            <div className="rounded-lg border bg-card p-6">
              <p className="font-display text-xl font-medium">Try a topic, a place or a person.</p>
              <p className="mt-2 text-sm text-muted-foreground">Or browse a section:</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {PRIMARY_NAV.map((k) => (
                  <li key={k}>
                    <Link to={SECTIONS[k].path} className="inline-block rounded-full bg-muted px-3 py-1.5 text-sm font-medium hover:bg-mist">
                      {SECTIONS[k].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : loading ? (
            <StoryGridSkeleton count={3} className="sm:grid-cols-1 lg:grid-cols-1" />
          ) : error ? (
            <ErrorState message={error.message} onRetry={reload} />
          ) : results.length === 0 ? (
            <EmptyState title="Nothing matches yet" body="Try fewer words, a different spelling, or a broader topic." />
          ) : (
            <div className="divide-y border-y">
              {results.map((a) => (
                <StoryCard key={a.slug} article={a} variant="row" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
