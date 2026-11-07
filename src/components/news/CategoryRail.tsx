import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { StoryCard } from './StoryCard';
import { SectionHeader } from './States';

/** Presentational rail whose layout adapts to 1, 2 or 3+ stories, so a thin section never looks empty. */
export function RailView({ title, href, stories, linkLabel }: { title: string; href?: string; stories: Article[]; linkLabel?: string }) {
  if (stories.length === 0) return null;
  return (
    <section aria-label={title} className="py-10">
      <SectionHeader
        title={title}
        action={
          href ? (
            <Link to={href} className="group/all inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0">
              {linkLabel ?? `All ${title}`}{' '}
              <ArrowRight className="size-4 transition-transform duration-base ease-standard group-hover/all:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : undefined
        }
      />
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
            {stories.slice(1, 4).map((a) => (
              <StoryCard key={a.slug} article={a} variant="row" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
