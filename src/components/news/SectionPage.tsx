import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Scale } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';
import { StoryCard } from './StoryCard';
import { AiExplainerEntry } from './AiExplainerEntry';
import { NewsletterForm } from './NewsletterForm';
import { EmptyState, ErrorState, LeadSkeleton, StoryGridSkeleton } from './States';
import { useAsync } from '@/hooks/useAsync';
import { articlesApi } from '@/lib/api/client';
import { cached } from '@/lib/api/cache';
import type { Article } from '@/lib/api/types';
import { CATEGORY_LOOKUP } from '@/constants/categories';
import { PRIMARY_NAV, SECTIONS, categoryHref, type Section } from '@/constants/sections';
import { SITE_URL, absoluteUrl } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

interface Feed {
  results: Article[];
  next: string | null;
  usedFallback: boolean;
}

async function loadFeed(section: Section, page: number, signal: AbortSignal): Promise<Feed> {
  if (section.kind === 'trending' || !section.category) {
    if (page === 1) return { results: await cached('latest', () => articlesApi.latest(signal)), next: null, usedFallback: false };
    const r = await articlesApi.list({ page, signal });
    return { results: r.results, next: r.next, usedFallback: false };
  }
  const primary = await articlesApi.list({ category: section.category, page, signal });
  if (primary.results.length === 0 && page === 1 && section.fallback) {
    const fb = await articlesApi.list({ category: section.fallback, page, signal });
    return { results: fb.results, next: fb.next, usedFallback: true };
  }
  return { results: primary.results, next: primary.next, usedFallback: false };
}

/** Shared layout for sections (Trending, Opinion, AI, Politics…) and /category/:slug pages. */
export function SectionPage({ section, trail }: { section: Section; trail?: string[] }) {
  const { t, lang, sectionOf, section: sectionText, category } = useI18n();
  const first = useAsync((signal) => loadFeed(section, 1, signal), `${section.path}|${section.category ?? ''}`);
  const [extra, setExtra] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setExtra([]);
    setPage(1);
    setNext(first.data?.next ?? null);
  }, [first.data]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const feed = await loadFeed(section, page + 1, new AbortController().signal);
      setExtra((e) => e.concat(feed.results));
      setNext(feed.next);
      setPage((p) => p + 1);
    } catch {
      setNext(null);
    } finally {
      setLoadingMore(false);
    }
  };

  const stories = (first.data?.results ?? []).concat(extra);
  const [lead, ...rest] = stories;
  const listStories = rest.slice(0, 4);
  const gridStories = rest.slice(4);
  const isOpinion = section.kind === 'opinion';
  const children = section.category ? CATEGORY_LOOKUP[section.category]?.node.children ?? [] : [];
  const otherSections = PRIMARY_NAV.filter((k) => SECTIONS[k].path !== section.path).slice(0, 7);
  const crumbs = trail && trail.length > 1 ? trail : null;
  // Interface text in the reader's language; SEO and JSON-LD stay in English (the canonical page).
  const isCategoryPage = section.path.startsWith('/category/');
  const text = isCategoryPage
    ? {
        title: category(section.category, section.title),
        dek: lang === 'bn' ? t('section.categoryDek', { name: category(section.category, section.title) }) : section.dek,
      }
    : sectionOf(section);
  const crumbName = (slug: string) => category(slug, CATEGORY_LOOKUP[slug]?.name ?? slug);

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${section.title} | The Age of GenZ`,
      description: section.dek,
      url: absoluteUrl(section.path),
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        ...(crumbs ?? [section.category ?? section.title]).map((slug, i, arr) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: i === arr.length - 1 ? section.title : CATEGORY_LOOKUP[slug]?.name ?? slug,
          item: i === arr.length - 1 ? absoluteUrl(section.path) : absoluteUrl(categoryHref(slug)),
        })),
      ],
    },
  ];

  return (
    <>
      <Seo title={section.title} description={section.dek} path={section.path} jsonLd={jsonLd} />
      <div className="container pt-8 sm:pt-12">
        {crumbs && (
          <nav aria-label={t('article.breadcrumb')} className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              {t('nav.home')}
            </Link>
            {crumbs.map((slug, i) => (
              <span key={slug} className="flex items-center gap-1">
                <ChevronRight className="size-3" />
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-foreground">
                    {crumbName(slug)}
                  </span>
                ) : (
                  <Link to={categoryHref(slug)} className="hover:text-foreground">
                    {crumbName(slug)}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
        <header className="grid gap-6 border-b border-foreground pb-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-primary">{isOpinion ? t('section.opinionEyebrow') : t('section.eyebrow')}</p>
            <h1 className="mt-3 font-display text-[3rem] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[4.5rem]">{text.title}</h1>
            <p className="mt-5 max-w-2xl font-serif text-xl leading-[1.5] text-muted-foreground">{text.dek}</p>
          </div>
          {children.length > 0 && (
            <nav
              aria-label={t('section.topics', { title: text.title })}
              className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:col-span-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0"
            >
              {children.map((child) => (
                <Link
                  key={child.slug}
                  to={`/category/${child.slug}/`}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full border bg-card px-3.5 text-sm font-medium transition-colors duration-fast hover:border-primary hover:text-primary lg:min-h-9"
                >
                  {category(child.slug, child.name)}
                </Link>
              ))}
            </nav>
          )}
        </header>

        {isOpinion && (
          <div className="mt-6 flex gap-3 rounded-lg border bg-card p-4 text-sm">
            <Scale className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              <span className="font-semibold">{t('section.opinionNoteStrong')}</span> {t('section.opinionNote')}{' '}
              <Link to="/politics/" className="link-underline">
                {sectionText('politics').title}
              </Link>{' '}
              {t('section.and')}{' '}
              <Link to="/world/" className="link-underline">
                {sectionText('world').title}
              </Link>
              .
            </p>
          </div>
        )}

        {first.data?.usedFallback && (
          <p className="mt-6 rounded-lg bg-mist px-4 py-3 text-sm text-mist-foreground">
            {t('section.fallback', { title: text.title, from: section.fallback && SECTIONS[section.fallback] ? sectionText(section.fallback).title : t('section.theNewsroom') })}
          </p>
        )}

        <div className="mt-10">
          {first.loading && !stories.length ? (
            <div className="space-y-10">
              <LeadSkeleton />
              <StoryGridSkeleton />
            </div>
          ) : first.error && !stories.length ? (
            <ErrorState message={first.error.message} onRetry={first.reload} />
          ) : !lead ? (
            <div className="grid gap-8 lg:grid-cols-12">
              <EmptyState
                className="lg:col-span-8"
                title={t('section.emptyTitle', { title: text.title })}
                body={t('section.emptyBody')}
              />
              <div className="rounded-lg border bg-card p-6 lg:col-span-4">
                <p className="eyebrow text-primary">{t('newsletter.eyebrow')}</p>
                <NewsletterForm source={`empty-${section.label.toLowerCase().replace(/\W+/g, '-')}`} className="mt-4" />
              </div>
            </div>
          ) : (
            <>
              <StoryCard article={lead} variant="lead" priority />
              <div className="mt-14 grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  {listStories.length > 0 && (
                    <div className="divide-y border-y">
                      {listStories.map((a) => (
                        <StoryCard key={a.slug} article={a} variant="row" />
                      ))}
                    </div>
                  )}
                  {gridStories.length > 0 && (
                    <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2">
                      {gridStories.map((a) => (
                        <StoryCard key={a.slug} article={a} />
                      ))}
                    </div>
                  )}
                  {next && (
                    <div className="mt-12 flex justify-center">
                      <Button variant="outline" onClick={loadMore} disabled={loadingMore} loading={loadingMore}>
                        {t('section.more', { title: text.title })}
                      </Button>
                    </div>
                  )}
                  {!listStories.length && !gridStories.length && (
                    <p className="text-sm text-muted-foreground">{t('section.end', { title: text.title })}</p>
                  )}
                </div>
                <aside className="space-y-6 lg:col-span-4">
                  {section.kind === 'ai' && <AiExplainerEntry article={lead} className="h-auto" />}
                  <div className="rounded-lg border bg-card p-6">
                    <p className="eyebrow text-primary">{t('newsletter.eyebrow')}</p>
                    <p className="mt-2 font-display text-[1.35rem] font-medium leading-snug">{t('newsletter.sectionTitle', { title: text.title })}</p>
                    <NewsletterForm source={`section-${section.label.toLowerCase().replace(/\W+/g, '-')}`} className="mt-4" />
                  </div>
                  <nav aria-label={t('section.moreSections')} className="rounded-lg border bg-card p-6">
                    <p className="eyebrow">{t('section.explore')}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {otherSections.map((k) => (
                        <li key={k}>
                          <Link to={SECTIONS[k].path} className="inline-flex min-h-11 items-center rounded-full bg-muted px-3.5 text-sm font-medium transition-colors duration-fast hover:bg-mist hover:text-secondary-foreground lg:min-h-9">
                            {sectionText(k).label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
