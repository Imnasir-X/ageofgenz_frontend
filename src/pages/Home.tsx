import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { WEBSITE_LD } from '@/components/seo/seo-core';
import { StoryCard } from '@/components/news/StoryCard';
import { StoryImage } from '@/components/news/StoryImage';
import { AiExplainerEntry } from '@/components/news/AiExplainerEntry';
import { NewsletterForm } from '@/components/news/NewsletterForm';
import { BriefingSkeleton, ErrorState, HeroSkeleton, SectionHeader } from '@/components/news/States';
import { Skeleton } from '@/components/ui/skeleton';
import { articleLinkProps } from '@/lib/prefetch';
import { useAsync } from '@/hooks/useAsync';
import { articlesApi, homeApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import type { Article } from '@/lib/api/types';
import { SECTIONS, categoryHref } from '@/constants/sections';
import { addSections, planHome, sanitizePlan, type HomePlan, type SectionPool } from '@/lib/home/plan';
import { homeFreshnessLabel } from '@/lib/dates';
import { SITE_NAME, TAGLINE, cn, truncate } from '@/lib/utils';

/** Section rows on the home page, in order. */
const HOME_SECTION_KEYS = ['ai', 'tech', 'politics', 'world'] as const;

interface HomeData {
  plan: HomePlan;
  newest: string | null;
  source: 'server' | 'client';
}

const newestOf = (list: Article[]) =>
  list.reduce<string | null>((max, a) => (a.publishedAt && (!max || new Date(a.publishedAt) > new Date(max)) ? a.publishedAt : max), null);

/**
 * Prefer the server-built feed (/api/home/, already deduped across modules); fall back to planning
 * the latest stories client-side. Both requests start together so the fallback costs no extra wait.
 */
async function loadHome(signal: AbortSignal): Promise<HomeData> {
  const latestP = cached('latest', () => articlesApi.latest(signal));
  latestP.catch(() => undefined);
  const feed = await homeApi.feed(signal);
  if (feed && (feed.lead || feed.secondary.length)) {
    const plan = sanitizePlan({
      lead: feed.lead,
      secondary: feed.secondary,
      briefing: feed.briefing,
      trending: feed.trending,
      trendingByViews: true,
      sections: feed.sections.map((s) => ({
        key: s.key,
        title: s.label || SECTIONS[s.key]?.title || s.key,
        href: SECTIONS[s.key]?.path ?? (s.categorySlug ? categoryHref(s.categorySlug) : '/'),
        stories: s.articles,
      })),
    });
    const all = [plan.lead, ...plan.secondary, ...plan.briefing, ...plan.trending].filter((a): a is Article => Boolean(a));
    return { plan, newest: feed.latestPublishedAt ?? newestOf(all), source: 'server' };
  }
  const latest = await latestP;
  return { plan: planHome(latest), newest: newestOf(latest), source: 'client' };
}

async function loadSectionPools(): Promise<SectionPool[]> {
  const settled = await Promise.allSettled(
    HOME_SECTION_KEYS.map((key) => {
      const slug = SECTIONS[key].category ?? key;
      return cached(`cat:${slug}`, () => articlesApi.list({ category: slug }));
    }),
  );
  return settled.map((r, i) => {
    const s = SECTIONS[HOME_SECTION_KEYS[i]];
    return { key: HOME_SECTION_KEYS[i], title: s.title, href: s.path, stories: r.status === 'fulfilled' ? r.value.results : [] };
  });
}

function QuickBriefing({ stories }: { stories: Article[] }) {
  if (!stories.length) return null;
  return (
    <aside className="rounded-lg border bg-card p-6 sm:p-7" aria-labelledby="quick-briefing">
      <p className="eyebrow text-primary">In two minutes</p>
      <h2 id="quick-briefing" className="mt-2 font-display text-[1.6rem] font-medium leading-none tracking-[-0.015em]">
        Quick briefing
      </h2>
      <ol className="mt-5 divide-y">
        {stories.slice(0, 5).map((a, i) => {
          const line = a.whyItMatters || truncate(a.excerpt, 110);
          return (
            <li key={a.slug} className="group relative flex gap-4 py-4 first:pt-0 last:pb-0">
              <span className="pt-1 font-mono text-xs font-medium text-primary" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <Link {...articleLinkProps(a)} className="font-display text-[1.08rem] font-medium leading-[1.25] transition-colors duration-fast after:absolute after:inset-0 group-hover:text-primary">
                  {a.title}
                </Link>
                {line && (
                  <p className="mt-1 truncate text-[0.86rem] leading-relaxed text-muted-foreground" title={line}>
                    {a.whyItMatters && <span className="font-medium text-foreground/80">Why it matters: </span>}
                    {line}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function SecondaryGrid({ stories }: { stories: Article[] }) {
  if (!stories.length) return null;
  return (
    <section className="mt-14" aria-label="Top stories">
      <SectionHeader title="Top stories" />
      <div className="grid gap-x-10 gap-y-10 pt-5 md:grid-cols-2">
        {stories.slice(0, 6).map((a) => (
          <StoryCard key={a.slug} article={a} sizes="(min-width: 768px) 45vw, calc(100vw - 2.5rem)" />
        ))}
      </div>
    </section>
  );
}

function TrendingList({ stories, byViews }: { stories: Article[]; byViews: boolean }) {
  if (!stories.length) return null;
  // Called "Trending" only when the list really is ranked by readership.
  const title = byViews ? 'Trending now' : 'More stories';
  return (
    <section className="rounded-lg border bg-card p-6 sm:p-8" aria-labelledby="trending-now">
      <div className="flex items-center justify-between gap-4 border-b pb-3">
        <h2 id="trending-now" className="flex items-center gap-2 font-display text-[1.6rem] font-medium leading-none tracking-[-0.015em]">
          {byViews && <TrendingUp className="size-5 text-primary" aria-hidden="true" />} {title}
        </h2>
        <Link to="/trending/" className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline sm:min-h-0">
          See all
        </Link>
      </div>
      <ol>
        {stories.slice(0, 5).map((a, i) => (
          <li key={a.slug} className="group relative flex items-center gap-4 border-b py-4 transition-transform duration-fast ease-standard last:border-0 last:pb-0 motion-safe:active:scale-[0.995]">
            <span className="w-7 shrink-0 font-mono text-2xl font-medium leading-none text-primary" aria-hidden="true">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Link {...articleLinkProps(a)} className="line-clamp-2 font-display text-[1.08rem] font-medium leading-[1.25] transition-colors duration-fast after:absolute after:inset-0 group-hover:text-primary">
                {a.title}
              </Link>
              <p className="data mt-1 text-muted-foreground">
                {a.category.name} · {a.readMinutes} min
              </p>
            </div>
            <StoryImage src={a.image} alt="" width={64} sizes="64px" ratio="square" className="w-16 shrink-0" category={a.category.slug} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionRow({ title, href, stories }: { title: string; href: string; stories: Article[] }) {
  if (!stories.length) return null;
  return (
    <section aria-label={title} className="mt-14">
      <SectionHeader
        title={title}
        action={
          <Link to={href} className="group/all inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0">
            All {title} <ArrowRight className="size-4 transition-transform duration-base ease-standard group-hover/all:translate-x-0.5" aria-hidden="true" />
          </Link>
        }
      />
      <div className="grid gap-x-8 gap-y-10 pt-5 md:grid-cols-3">
        {stories.slice(0, 3).map((a) => (
          <StoryCard key={a.slug} article={a} showWhy={false} sizes="(min-width: 768px) 30vw, calc(100vw - 2.5rem)" />
        ))}
      </div>
    </section>
  );
}

function SectionRowsSkeleton() {
  return (
    <div className="mt-14" aria-busy="true" aria-label="Loading sections">
      <div className="mb-2 flex items-end justify-between gap-4 border-b border-foreground pb-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid gap-x-8 gap-y-10 pt-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn('space-y-3', i > 0 && 'hidden md:block')}>
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const home = useAsync((signal) => cached('home', () => loadHome(signal)), 'home');
  const needsSections = home.data?.source === 'client';
  const pools = useAsync(() => cached('home-sections', loadSectionPools), 'home-sections', { enabled: needsSections });

  const base = home.data?.plan;
  const plan = base && needsSections && pools.data ? addSections(base, pools.data) : base;
  const loading = home.loading && !plan;
  const sectionsLoading = needsSections && (pools.loading || pools.data === undefined);
  const fresh = homeFreshnessLabel(home.data?.newest ?? null);

  return (
    <>
      <Seo title={`${SITE_NAME} — ${TAGLINE}`} rawTitle path="/" jsonLd={WEBSITE_LD} />

      <div className="container pt-6 sm:pt-8">
        <header className="mb-6 flex flex-col gap-1.5 border-b border-foreground pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            {/* Fixed-height line: the label only swaps text when data lands, so nothing below moves. */}
            <p className="eyebrow h-4" suppressHydrationWarning>
              {plan ? (
                <>
                  {fresh.label}
                  {fresh.date && <span className="text-muted-foreground"> · {fresh.date}</span>}
                </>
              ) : (
                'Latest'
              )}
            </p>
            <h1 className="mt-2 font-display text-[1.9rem] font-medium leading-[1.02] tracking-[-0.025em] sm:text-[2.6rem]">
              Understand what’s happening. <span className="italic text-muted-foreground">Not just what’s trending.</span>
            </h1>
          </div>
        </header>

        {home.error && !plan ? (
          <ErrorState message={home.error.message} onRetry={home.reload} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">{loading ? <HeroSkeleton /> : plan?.lead && <StoryCard article={plan.lead} variant="hero" priority />}</div>
            <div className={cn('lg:col-span-4', !loading && !plan?.briefing.length && 'hidden')}>{loading ? <BriefingSkeleton /> : <QuickBriefing stories={plan?.briefing ?? []} />}</div>
          </div>
        )}

        {plan && <SecondaryGrid stories={plan.secondary} />}

        {plan && (
          <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
            {plan.trending.length > 0 && (
              <div className="lg:col-span-8">
                <TrendingList stories={plan.trending} byViews={plan.trendingByViews} />
              </div>
            )}
            <div className={cn('lg:col-span-4', plan.trending.length === 0 && 'lg:col-span-12')}>
              <AiExplainerEntry article={plan.lead} />
            </div>
          </div>
        )}

        {plan?.sections.map((s) => (
          <SectionRow key={s.key} title={s.title} href={s.href} stories={s.stories} />
        ))}
        {plan && sectionsLoading && <SectionRowsSkeleton />}

        {/* Serial position: the strongest story opens the page, the one ask (newsletter) closes it. */}
        <section className="mt-16 grid gap-6 rounded-lg border bg-mist/60 p-7 sm:p-12 lg:grid-cols-12 lg:items-center" aria-labelledby="newsletter-home">
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
