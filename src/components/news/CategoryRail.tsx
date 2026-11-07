import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { articlesApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import type { Article } from '@/lib/api/types';
import { useAsync } from '@/hooks/useAsync';
import { useInView } from '@/hooks/useInView';
import { SECTIONS } from '@/constants/sections';
import { StoryCard } from './StoryCard';
import { RailSkeleton, SectionHeader } from './States';

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

interface RailData {
  key: string;
  title: string;
  href: string;
  stories: Article[];
}

/**
 * The section rails at the bottom of the home page, loaded together just before they scroll
 * into view (one skeleton, one swap, so no rail-by-rail jumping).
 * - Stories already shown higher on the page are skipped, and no story appears in two rails.
 * - Rails with 3+ new stories keep their own rail; thinner ones are merged into a single
 *   "More from the newsroom" rail; empty ones are dropped.
 * - When the home feed already holds the whole newsroom (`complete`) there is nothing new to
 *   show, so nothing is fetched and no skeleton is reserved.
 */
export function HomeRails({ railKeys, exclude, complete }: { railKeys: readonly string[]; exclude: string[]; complete: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { data, loading } = useAsync(
    async () => {
      const settled = await Promise.allSettled(
        railKeys.map((key) => {
          const slug = SECTIONS[key].category ?? key;
          return cached(`cat:${slug}`, () => articlesApi.list({ category: slug }));
        }),
      );
      return settled.map((r, i) => ({ key: railKeys[i], results: r.status === 'fulfilled' ? r.value.results : [] }));
    },
    'home-rails',
    { enabled: inView && !complete },
  );

  if (complete) return null;

  const seen = new Set(exclude);
  const full: RailData[] = [];
  const thin: Article[] = [];
  (data ?? []).forEach(({ key, results }) => {
    const fresh = results.filter((a) => a.slug && !seen.has(a.slug)).slice(0, 4);
    fresh.forEach((a) => seen.add(a.slug));
    if (fresh.length >= 3) full.push({ key, title: SECTIONS[key].title, href: SECTIONS[key].path, stories: fresh });
    else thin.push(...fresh);
  });

  const pending = inView && (loading || data === undefined);
  return (
    <div ref={ref} className={pending ? 'py-10' : undefined} aria-busy={pending || undefined}>
      {pending && <RailSkeleton title="more sections" />}
      {full.map((r) => (
        <RailView key={r.key} title={r.title} href={r.href} stories={r.stories} />
      ))}
      {thin.length > 0 && <RailView title="More from the newsroom" href="/trending/" linkLabel="Everything new" stories={thin.slice(0, 4)} />}
    </div>
  );
}
