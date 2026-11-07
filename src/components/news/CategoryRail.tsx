import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { articlesApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import { useAsync } from '@/hooks/useAsync';
import { useInView } from '@/hooks/useInView';
import { StoryCard } from './StoryCard';
import { RailSkeleton, SectionHeader } from './States';

/** A section rail: one larger story plus a short list. Invisible until it has stories to show. */
export function CategoryRail({ slug, title, href, exclude = [] }: { slug: string; title: string; href: string; exclude?: string[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { data, loading, error } = useAsync((signal) => cached(`cat:${slug}`, () => articlesApi.list({ category: slug, signal })), slug, {
    enabled: inView,
  });
  const stories = (data?.results ?? []).filter((a) => !exclude.includes(a.slug)).slice(0, 4);
  const ready = inView && !loading && data !== undefined && stories.length > 0;
  // Rails load ~400px before they scroll into view, so the skeleton is usually never seen;
  // if it is, it occupies the same box as the rail. Empty rails collapse off-screen.
  const pending = inView && !error && (loading || data === undefined);

  return (
    <div ref={ref} className={ready || pending ? 'py-10' : 'h-px'} aria-hidden={ready || pending ? undefined : true}>
      {pending && <RailSkeleton title={title} />}
      {ready && (
        <section aria-label={title}>
          <SectionHeader
            title={title}
            action={
              <Link to={href} className="group/all inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0">
                All {title} <ArrowRight className="size-4 transition-transform duration-base ease-standard group-hover/all:translate-x-0.5" aria-hidden="true" />
              </Link>
            }
          />
          {/* Layout adapts to how many stories there are, so a thin section never looks empty. */}
          {stories.length === 1 ? (
            <StoryCard article={stories[0]} variant="feature" className="pt-4" />
          ) : stories.length === 2 ? (
            <div className="grid gap-x-10 gap-y-8 pt-4 md:grid-cols-2">
              {stories.map((a) => (
                <StoryCard key={a.slug} article={a} />
              ))}
            </div>
          ) : (
            <div className="grid gap-x-10 gap-y-2 pt-4 lg:grid-cols-12">
              <StoryCard article={stories[0]} className="lg:col-span-5" />
              <div className="divide-y lg:col-span-7">
                {stories.slice(1).map((a) => (
                  <StoryCard key={a.slug} article={a} variant="row" />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
