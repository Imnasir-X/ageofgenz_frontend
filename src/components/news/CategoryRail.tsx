import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { articlesApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import { useAsync } from '@/hooks/useAsync';
import { useInView } from '@/hooks/useInView';
import { StoryCard } from './StoryCard';
import { SectionHeader } from './States';

/** A section rail: one larger story plus a short list. Invisible until it has stories to show. */
export function CategoryRail({ slug, title, href, exclude = [] }: { slug: string; title: string; href: string; exclude?: string[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { data, loading } = useAsync((signal) => cached(`cat:${slug}`, () => articlesApi.list({ category: slug, signal })), slug, {
    enabled: inView,
  });
  const stories = (data?.results ?? []).filter((a) => !exclude.includes(a.slug)).slice(0, 4);
  const ready = inView && !loading && data !== undefined && stories.length > 0;

  return (
    <div ref={ref} className={ready ? 'py-10' : 'h-px'} aria-hidden={ready ? undefined : true}>
      {ready && (
        <section aria-label={title}>
          <SectionHeader
            title={title}
            action={
              <Link to={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                All {title} <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="grid gap-x-10 gap-y-2 pt-4 lg:grid-cols-12">
            <StoryCard article={stories[0]} className="lg:col-span-5" />
            {stories.length > 1 && (
              <div className="divide-y lg:col-span-7">
                {stories.slice(1).map((a) => (
                  <StoryCard key={a.slug} article={a} variant="row" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
