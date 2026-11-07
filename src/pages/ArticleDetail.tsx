import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Scale } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { InitialDataContext } from '@/components/seo/context';
import { ArticleBody } from '@/components/article/ArticleBody';
import { BriefingBox } from '@/components/article/BriefingBox';
import { SourcesList } from '@/components/article/SourcesList';
import { AskPanel } from '@/components/article/AskPanel';
import { ShareBar } from '@/components/article/ShareBar';
import { ReadingProgress } from '@/components/article/ReadingProgress';
import { StoryCard } from '@/components/news/StoryCard';
import { StoryImage } from '@/components/news/StoryImage';
import { OpinionLabel } from '@/components/news/StoryMeta';
import { NewsletterForm } from '@/components/news/NewsletterForm';
import { ErrorState, SectionHeader } from '@/components/news/States';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/useAsync';
import { aiApi, articlesApi, ApiError } from '@/lib/api/client';
import { NEWSROOM } from '@/lib/api/normalize';
import type { Article } from '@/lib/api/types';
import { categoryHref } from '@/constants/sections';
import { SITE_NAME, SITE_URL, absoluteUrl, formatDate } from '@/lib/utils';
import NotFound from './NotFound';

function ArticleSkeleton() {
  return (
    <div className="container max-w-3xl pt-12" aria-busy="true" aria-label="Loading article">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-5 h-12 w-full" />
      <Skeleton className="mt-3 h-12 w-3/4" />
      <Skeleton className="mt-6 h-5 w-2/3" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function ArticleDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const initial = useContext(InitialDataContext);
  const initialArticle = initial.article && initial.article.slug === slug ? initial.article : undefined;
  const { data: article, error, loading, reload } = useAsync((signal) => articlesApi.bySlug(slug, signal), slug, { initial: initialArticle });

  const [enriched, setEnriched] = useState<Partial<Article>>({});
  const [bangla, setBangla] = useState<{ title?: string; tldr?: string[] } | null>(null);
  const [related, setRelated] = useState<Article[]>([]);

  useEffect(() => {
    if (!article) return;
    const c = new AbortController();
    setEnriched({});
    setBangla(null);
    setRelated([]);
    if (!article.tldr || !article.whyItMatters || !article.sources) {
      aiApi.brief(article.slug, c.signal).then((b) => {
        if (b && !c.signal.aborted) setEnriched(Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined)) as Partial<Article>);
      });
    }
    if (article.titleBn || article.tldrBn) setBangla({ title: article.titleBn, tldr: article.tldrBn });
    else aiApi.translate(article.slug, 'bn', c.signal).then((t) => !c.signal.aborted && setBangla(t));
    articlesApi
      .related(article, c.signal)
      .then((r) => !c.signal.aborted && setRelated(r))
      .catch(() => undefined);
    return () => c.abort();
  }, [article]);

  if (initial.articleMissing && !initialArticle && initial.path?.includes(slug)) return <NotFound />;
  if (error instanceof ApiError && error.status === 404) return <NotFound />;
  if (error && !article) {
    return (
      <div className="container max-w-3xl pt-12">
        <ErrorState message={error.message} onRetry={reload} />
      </div>
    );
  }
  if (loading || !article) return <ArticleSkeleton />;

  const a: Article = {
    ...article,
    tldr: article.tldr ?? enriched.tldr,
    whyItMatters: article.whyItMatters ?? enriched.whyItMatters,
    sources: article.sources ?? enriched.sources,
    perspectives: article.perspectives ?? enriched.perspectives,
  };
  // The standfirst is shown under the headline; don't repeat it as the first body paragraph.
  const bodyBlocks =
    a.contentBlocks && a.contentBlocks[0]?.type === 'paragraph' && a.contentBlocks[0].text.trim().toLowerCase() === a.excerpt.trim().toLowerCase()
      ? a.contentBlocks.slice(1)
      : a.contentBlocks;
  const updated = a.updatedAt && a.publishedAt && new Date(a.updatedAt).getTime() - new Date(a.publishedAt).getTime() > 3_600_000;

  return (
    <>
      <Seo
        title={a.metaTitle || a.title}
        description={a.metaDescription}
        path={a.href}
        image={a.image}
        type="article"
        article={{ publishedTime: a.publishedAt, modifiedTime: a.updatedAt, section: a.category.name, author: a.author.name }}
        jsonLd={articleJsonLd(a)}
      />
      <ReadingProgress targetId="article-body" />

      <article className="pt-8 sm:pt-12" aria-labelledby="article-title">
        <header className="container max-w-[64rem]">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <Link to={categoryHref(a.category.slug)} className="eyebrow text-primary hover:underline">
              {a.category.name}
            </Link>
            {a.isOpinion && <OpinionLabel className="ml-2" />}
          </nav>
          <h1
            id="article-title"
            className="mt-5 max-w-[22ch] font-display text-[2.4rem] font-medium leading-[1.04] tracking-[-0.025em] sm:text-[3.4rem] lg:text-[4rem]"
          >
            {a.title}
          </h1>
          {a.excerpt && <p className="mt-5 max-w-[40rem] font-serif text-[1.3rem] leading-[1.5] text-muted-foreground sm:text-[1.4rem]">{a.excerpt}</p>}
          <div className="mt-8 flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm font-medium">{a.isOpinion ? `Opinion by ${a.author.name}` : `By ${a.author.name}`}</span>
              {a.publishedAt && (
                <time dateTime={a.publishedAt} className="data text-muted-foreground">
                  {formatDate(a.publishedAt, { month: 'long' })}
                </time>
              )}
              {updated && (
                <span className="data text-muted-foreground">
                  · Updated <time dateTime={a.updatedAt}>{formatDate(a.updatedAt, { month: 'long' })}</time>
                </span>
              )}
              <span className="data text-muted-foreground">· {a.readMinutes} min read</span>
            </div>
            <ShareBar article={a} />
          </div>
        </header>

        {a.image && (
          <figure className="container mt-8 max-w-[64rem]">
            <StoryImage src={a.image} alt={a.imageCaption || a.title} width={1400} priority ratio="video" />
            {a.imageCaption && <figcaption className="mt-2 text-sm text-muted-foreground">{a.imageCaption}</figcaption>}
          </figure>
        )}

        <div className="container mt-10 max-w-[64rem]">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8">
              <BriefingBox article={a} bangla={bangla} className="mb-10" />
              {a.isOpinion && (
                <p className="mb-8 flex gap-2 rounded-md border bg-card p-3 text-sm">
                  <Scale className="mt-0.5 size-4 shrink-0 text-primary" />
                  This is an opinion piece. It reflects the author’s view, not a news report.
                </p>
              )}
              <div id="article-body">
                <ArticleBody blocks={bodyBlocks} content={a.content} className="max-w-[65ch]" />
              </div>
              {a.tags.length > 0 && (
                <ul className="mt-10 flex flex-wrap gap-2" aria-label="Topics">
                  {a.tags.map((t) => (
                    <li key={t}>
                      <Link to={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-mist">
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-12 lg:hidden">
                <AskPanel article={a} />
              </div>
              <div className="mt-12">
                <SourcesList article={a} />
              </div>
            </div>
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-[calc(var(--header-h)+1.5rem)] space-y-5">
                <AskPanel article={a} />
                <div className="rounded-lg border bg-card p-5">
                  <p className="eyebrow text-primary">The weekly briefing</p>
                  <p className="mt-2 font-display text-lg font-medium leading-snug">Stories like this, explained, once a week.</p>
                  <NewsletterForm source="article-aside" className="mt-4" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <div className="container mt-20 max-w-[64rem]">
        {related.length > 0 && (
          <section aria-label="Related stories">
            <SectionHeader title="Keep following this story" eyebrow="Related" />
            <div className="grid gap-x-8 gap-y-10 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((r) => (
                <StoryCard key={r.slug} article={r} showWhy={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
