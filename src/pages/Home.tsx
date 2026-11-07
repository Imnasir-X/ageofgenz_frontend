import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { WEBSITE_LD } from '@/components/seo/seo-core';
import { StoryCard } from '@/components/news/StoryCard';
import { CategoryRail } from '@/components/news/CategoryRail';
import { AiExplainerEntry } from '@/components/news/AiExplainerEntry';
import { NewsletterForm } from '@/components/news/NewsletterForm';
import { BriefingSkeleton, ErrorState, LeadSkeleton, SectionHeader, StoryRowSkeleton } from '@/components/news/States';
import { Skeleton } from '@/components/ui/skeleton';
import { articleLinkProps } from '@/lib/prefetch';
import { useAsync } from '@/hooks/useAsync';
import { articlesApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import type { Article } from '@/lib/api/types';
import { HOME_RAILS, SECTIONS } from '@/constants/sections';
import { SITE_NAME, TAGLINE, truncate } from '@/lib/utils';

const todayLabel = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function QuickBriefing({ stories }: { stories: Article[] }) {
  const items = stories.slice(0, 5).map((a) => ({ key: a.slug, article: a, title: a.title, href: a.href, line: a.whyItMatters || truncate(a.excerpt, 120) }));
  if (!items.length) return null;

  return (
    <aside className="h-full rounded-lg border bg-card p-6 sm:p-7" aria-labelledby="quick-briefing">
      <p className="eyebrow text-primary">In two minutes</p>
      <h2 id="quick-briefing" className="mt-2 font-display text-[1.6rem] font-medium leading-none tracking-[-0.015em]">
        Quick briefing
      </h2>
      <ol className="mt-5 divide-y">
        {items.map((item, i) => (
          <li key={item.key} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <span className="pt-1 font-mono text-xs font-medium text-primary" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              {item.href ? (
                <Link {...articleLinkProps(item.article)} className="font-display text-[1.1rem] font-medium leading-[1.25] transition-colors duration-fast hover:text-primary">
                  {item.title}
                </Link>
              ) : (
                <p className="font-display text-[1.1rem] font-medium leading-[1.25]">{item.title}</p>
              )}
              {item.line && <p className="mt-1.5 text-[0.88rem] leading-relaxed text-muted-foreground">{item.line}</p>}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function TrendingBand({ stories }: { stories: Article[] }) {
  if (stories.length === 0) return null;
  return (
    <section className="rounded-lg border bg-card p-6 sm:p-8" aria-labelledby="trending-now">
      <div className="flex items-center justify-between gap-4 border-b pb-3">
        <h2 id="trending-now" className="flex items-center gap-2 font-display text-[1.6rem] font-medium leading-none tracking-[-0.015em]">
          <TrendingUp className="size-5 text-primary" /> Trending now
        </h2>
        <Link to="/trending/" className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline sm:min-h-0">
          See all
        </Link>
      </div>
      <ol className="grid gap-x-10 sm:grid-cols-2">
        {stories.slice(0, 6).map((a, i) => (
          <li key={a.slug} className="group relative flex gap-4 border-b py-5 transition-transform duration-fast ease-standard last:border-0 motion-safe:active:scale-[0.995] sm:[&:nth-last-child(2):nth-child(odd)]:border-0">
            <span className="w-8 shrink-0 font-mono text-2xl font-medium leading-none text-primary" aria-hidden="true">
              {i + 1}
            </span>
            <div className="min-w-0">
              <Link {...articleLinkProps(a)} className="font-display text-[1.12rem] font-medium leading-[1.25] transition-colors duration-fast after:absolute after:inset-0 group-hover:text-primary">
                {a.title}
              </Link>
              <p className="data mt-1.5 text-muted-foreground">
                {a.category.name} · {a.readMinutes} min
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Home() {
  const latest = useAsync((signal) => cached('latest', () => articlesApi.latest(signal)), 'latest');

  const stories = latest.data ?? [];
  const featured = stories.find((a) => a.isFeatured && !a.isOpinion) ?? stories[0];
  const rest = stories.filter((a) => a !== featured);
  // The quick briefing summarises the top five (lead included); "Top stories" continues
  // after it so nothing repeats above the fold.
  const briefing = featured ? [featured, ...rest].slice(0, 5) : [];
  const topStories = rest.slice(4, 10);

  return (
    <>
      <Seo title={`${SITE_NAME} — ${TAGLINE}`} rawTitle path="/" jsonLd={WEBSITE_LD} />

      <div className="container pt-8 sm:pt-12">
        <header className="mb-8 grid gap-4 border-b border-foreground pb-8 sm:mb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <p className="eyebrow" suppressHydrationWarning>
              Today’s briefing · {todayLabel()}
            </p>
            <h1 className="mt-3 font-display text-[2.6rem] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[4rem] lg:text-[4.75rem]">
              Understand what’s happening.
              <span className="block italic text-muted-foreground">Not just what’s trending.</span>
            </h1>
          </div>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground lg:col-span-3 lg:justify-self-end">
            The few stories that matter today, the reporting behind them, and the context to make sense of it.
          </p>
        </header>

        {latest.error && !stories.length ? (
          <ErrorState message={latest.error.message} onRetry={latest.reload} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">{latest.loading && !featured ? <LeadSkeleton /> : featured && <StoryCard article={featured} variant="lead" priority />}</div>
            <div className="lg:col-span-4">
              {latest.loading && !stories.length ? (
                <BriefingSkeleton />
              ) : (
                <QuickBriefing stories={briefing} />
              )}
            </div>
          </div>
        )}

        {latest.loading && !stories.length && (
          <section className="mt-16" aria-label="Loading top stories">
            <div className="mb-2 border-b border-foreground pb-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-2 h-8 w-48" />
            </div>
            <div className="grid gap-x-12 md:grid-cols-2">
              <StoryRowSkeleton count={2} />
              <StoryRowSkeleton count={2} className="hidden md:block" />
            </div>
          </section>
        )}

        {topStories.length > 0 && (
          <section className="mt-16" aria-label="Top stories">
            <SectionHeader title="Top stories" eyebrow="What matters today" />
            <div className="grid gap-x-12 md:grid-cols-2">
              {topStories.map((a) => (
                <StoryCard key={a.slug} article={a} variant="row" className="border-b" />
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-8">
            {latest.loading && !stories.length ? (
              <div className="rounded-lg border bg-card p-6 sm:p-8" aria-busy="true" aria-label="Loading trending stories">
                <Skeleton className="h-7 w-44" />
                <StoryRowSkeleton count={3} className="mt-3" />
              </div>
            ) : (
              <TrendingBand stories={stories} />
            )}
          </div>
          <div className="lg:col-span-4">
            <AiExplainerEntry article={featured} />
          </div>
        </div>

        <div className="mt-6">
          {HOME_RAILS.map((key) => {
            const section = SECTIONS[key];
            return <CategoryRail key={key} slug={section.category ?? key} title={section.title} href={section.path} />;
          })}
        </div>

        {/* Serial position: the strongest story opens the page, the one ask (newsletter) closes it. */}
        <section className="mt-12 grid gap-6 rounded-lg border bg-mist/60 p-7 sm:p-12 lg:grid-cols-12 lg:items-center" aria-labelledby="newsletter-home">
          <div className="lg:col-span-7">
            <p className="eyebrow text-primary">The weekly briefing</p>
            <h2 id="newsletter-home" className="mt-3 font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
              The week’s news, explained in five minutes.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">One email with the stories that matter and why. No endless feed. Unsubscribe anytime.</p>
          </div>
          <div className="lg:col-span-5">
            <NewsletterForm source="home" />
          </div>
        </section>

      </div>
    </>
  );
}
