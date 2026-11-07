import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { StoryImage } from '@/components/news/StoryImage';
import { StoryCard } from '@/components/news/StoryCard';
import { StoryMeta } from '@/components/news/StoryMeta';
import { Skeleton } from '@/components/ui/skeleton';
import { keyPoints } from '@/lib/article/keyPoints';
import { articleLinkProps } from '@/lib/prefetch';
import { categoryHref } from '@/constants/sections';
import { cn } from '@/lib/utils';

/**
 * Peak-end rule: the last moments of a read decide how it is remembered. The article closes
 * with a short recap of what the reader now knows and one clear next read (plus two more),
 * instead of trailing off into an endless feed.
 */
export function ArticleEnd({ article, related, className }: { article: Article; related: Article[] | null; className?: string }) {
  const recap = article.tldr?.length ? article.tldr.slice(0, 3) : keyPoints(article, 3);
  const [next, ...more] = related ?? [];

  return (
    <section className={cn('space-y-12', className)} aria-label="End of article">
      {recap.length > 0 && (
        <div className="rounded-lg border bg-card p-6 sm:p-8">
          <p className="eyebrow flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-3.5" aria-hidden="true" /> You’re up to speed
          </p>
          <h2 className="mt-2 font-display text-[1.6rem] font-medium leading-tight">The short version</h2>
          <ul className="mt-4 space-y-3">
            {recap.map((p, i) => (
              <li key={i} className="flex gap-3 font-serif text-[1.05rem] leading-[1.55]">
                <span className="data mt-1 shrink-0 text-primary" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {article.whyItMatters && (
            <p className="mt-5 border-l-2 border-primary pl-3 text-[0.95rem] leading-relaxed">
              <span className="font-semibold">Why it matters: </span>
              {article.whyItMatters}
            </p>
          )}
        </div>
      )}

      <div>
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-foreground pb-3">
          <h2 className="font-display text-[1.65rem] font-medium leading-none tracking-[-0.015em] sm:text-[1.9rem]">What to read next</h2>
          <Link to={categoryHref(article.category.slug)} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0">
            More {article.category.name} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {related === null ? (
          <div className="grid gap-6 md:grid-cols-12" aria-busy="true" aria-label="Loading what to read next">
            <Skeleton className="aspect-[3/2] w-full md:col-span-6" />
            <div className="space-y-3 md:col-span-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        ) : next ? (
          <>
            {/* One primary next read (Hick's law), large and fully clickable (Fitts's law). */}
            <article className="group relative grid gap-5 rounded-lg border bg-card p-4 transition-[transform,box-shadow] duration-base ease-standard hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.995] sm:p-5 md:grid-cols-12 md:gap-8">
              {next.image && <StoryImage src={next.image} alt={next.title} width={800} ratio="wide" className="md:col-span-5" />}
              <div className={cn('flex flex-col justify-center gap-2', next.image ? 'md:col-span-7' : 'md:col-span-12')}>
                <p className="eyebrow text-primary">Up next</p>
                <h3 className="font-display text-[1.6rem] font-medium leading-[1.12] tracking-[-0.015em] sm:text-[1.9rem]">
                  <Link {...articleLinkProps(next)} className="transition-colors duration-fast after:absolute after:inset-0 group-hover:text-primary">
                    {next.title}
                  </Link>
                </h3>
                {next.excerpt && <p className="line-clamp-2 text-muted-foreground">{next.excerpt}</p>}
                <StoryMeta article={next} className="mt-1" showCategory={false} />
              </div>
            </article>
            {more.length > 0 && (
              <div className="mt-6 grid gap-x-10 md:grid-cols-2">
                {more.slice(0, 2).map((r) => (
                  <StoryCard key={r.slug} article={r} variant="row" showWhy={false} className="border-b" />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            That’s the latest on this. Browse{' '}
            <Link to={categoryHref(article.category.slug)} className="link-underline">
              {article.category.name}
            </Link>{' '}
            for more.
          </p>
        )}
      </div>
    </section>
  );
}
