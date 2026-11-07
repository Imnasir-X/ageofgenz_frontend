import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Languages, Scale } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { InitialDataContext } from '@/components/seo/context';
import { ArticleBody } from '@/components/article/ArticleBody';
import { ArticleEnd } from '@/components/article/ArticleEnd';
import { BriefingBox } from '@/components/article/BriefingBox';
import { SourcesList } from '@/components/article/SourcesList';
import { AskPanel } from '@/components/article/AskPanel';
import { MobileAsk } from '@/components/article/MobileAsk';
import { NewsletterBlock } from '@/components/news/NewsletterBlock';
import { ShareBar } from '@/components/article/ShareBar';
import { ReadingProgress } from '@/components/article/ReadingProgress';
import { StoryImage } from '@/components/news/StoryImage';
import { OpinionLabel } from '@/components/news/StoryMeta';
import { ErrorState } from '@/components/news/States';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/useAsync';
import { aiApi, articlesApi, ApiError } from '@/lib/api/client';
import type { Article, ArticleTranslation } from '@/lib/api/types';
import { useI18n } from '@/lib/i18n/useI18n';
import type { StringKey } from '@/lib/i18n/strings';
import { articleJsonLd } from '@/lib/article/jsonLd';
import { useReadingHeartbeat } from '@/lib/readingHeartbeat';
import { loadArticle } from '@/lib/prefetch';
import { categoryHref } from '@/constants/sections';
import { meaningfulUpdate } from '@/lib/dates';
import NotFound from './NotFound';

function BodySkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className={i % 4 === 3 ? 'h-4 w-2/3' : 'h-4 w-full'} />
      ))}
    </div>
  );
}

/** Mirrors the article layout (header, 16:9 hero, body column) so nothing jumps when it loads. */
function ArticleSkeleton() {
  const { t } = useI18n();
  return (
    <div className="pt-8 sm:pt-12" aria-busy="true" aria-label={t('article.loading')}>
      <div className="container max-w-[64rem]">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-5 h-12 w-full max-w-[40rem]" />
        <Skeleton className="mt-3 h-12 w-3/4 max-w-[32rem]" />
        <Skeleton className="mt-6 h-6 w-2/3" />
        <Skeleton className="mt-8 h-14 w-full" />
        <Skeleton className="mt-8 aspect-video w-full" />
      </div>
      <div className="container mt-10 max-w-[64rem]">
        <div className="max-w-[65ch]">
          <BodySkeleton />
        </div>
      </div>
    </div>
  );
}

const ROLE_KEYS = new Set(['desk', 'staff', 'editor', 'contributor', 'columnist']);

function ArticleHeader({ a }: { a: Article }) {
  const { t, date, category } = useI18n();
  const updated = meaningfulUpdate(a);
  const role = a.author.role && ROLE_KEYS.has(a.author.role) ? t(`author.role.${a.author.role}` as StringKey) : a.author.role;
  return (
    <>
      <header className="container max-w-[64rem]">
        <nav aria-label={t('article.breadcrumb')} className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            {t('nav.home')}
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <Link to={categoryHref(a.category.slug)} className="eyebrow text-primary hover:underline">
            {category(a.category.slug, a.category.name)}
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
            <span className="text-sm font-medium">
              {a.isOpinion ? t('story.opinionBy') : t('story.by')}
              {a.author.url ? (
                a.author.url.startsWith('/') ? (
                  <Link to={a.author.url} className="link-underline" rel="author">
                    {a.author.name}
                  </Link>
                ) : (
                  <a href={a.author.url} className="link-underline" rel="author">
                    {a.author.name}
                  </a>
                )
              ) : (
                a.author.name
              )}
              {role && !a.author.isDesk && <span className="font-normal text-muted-foreground">, {role}</span>}
            </span>
            {a.publishedAt && (
              <time dateTime={a.publishedAt} className="data text-muted-foreground">
                {date(a.publishedAt, { month: 'long' })}
              </time>
            )}
            {updated && (
              <span className="data text-muted-foreground">
                · {t('story.updated')} <time dateTime={updated.toISOString()}>{date(updated.toISOString(), { month: 'long' })}</time>
              </span>
            )}
            <span className="data text-muted-foreground">· {t('story.minRead', { n: a.readMinutes })}</span>
          </div>
          <ShareBar article={a} />
        </div>
      </header>

      {a.image && (
        <figure className="container mt-8 max-w-[64rem]">
          <StoryImage src={a.image} alt={a.imageAlt || a.imageCaption || a.title} width={1024} sizes="(max-width: 1088px) calc(100vw - 2.5rem), 1024px" priority ratio="video" />
          {(a.imageCaption || a.imageCredit) && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {a.imageCaption}
              {a.imageCredit && <span className="data ml-2 uppercase tracking-wide">{a.imageCredit}</span>}
            </figcaption>
          )}
        </figure>
      )}
    </>
  );
}

export default function ArticleDetail() {
  const { t, lang } = useI18n();
  const { slug = '' } = useParams<{ slug: string }>();
  const initial = useContext(InitialDataContext);
  const initialArticle = initial.article && initial.article.slug === slug ? initial.article : undefined;
  const { data: article, error, loading, reload } = useAsync(() => loadArticle(slug), slug, { initial: initialArticle });
  useReadingHeartbeat(article?.id);
  // Optimistic UI: the card the reader clicked travels in router state, so the headline,
  // standfirst and image paint immediately while the full article loads.
  const location = useLocation();
  const statePreview = (location.state as { preview?: Article } | null)?.preview;
  const preview = statePreview && statePreview.slug === slug ? statePreview : undefined;

  const [enriched, setEnriched] = useState<Partial<Article>>({});
  const [bangla, setBangla] = useState<ArticleTranslation | null>(null);
  const [bnChecked, setBnChecked] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [related, setRelated] = useState<Article[] | null>(null);
  const [askAvailable, setAskAvailable] = useState(false);

  useEffect(() => {
    if (!article) return;
    const c = new AbortController();
    setEnriched({});
    setBangla(null);
    setBnChecked(false);
    setShowOriginal(false);
    setRelated(null);
    setAskAvailable(false);
    aiApi.askAvailable(article.slug, c.signal).then((ok) => !c.signal.aborted && setAskAvailable(ok));
    if (!article.tldr || !article.whyItMatters || !article.sources) {
      aiApi.brief(article.slug, c.signal).then((b) => {
        if (b && !c.signal.aborted) setEnriched(Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined)) as Partial<Article>);
      });
    }
    if (article.titleBn || article.tldrBn) setBangla({ language: 'bn', title: article.titleBn, tldr: article.tldrBn });
    aiApi.translate(article.slug, 'bn', c.signal).then((tr) => {
      if (c.signal.aborted) return;
      if (tr) setBangla(tr);
      setBnChecked(true);
    });
    articlesApi
      .related(article, c.signal)
      .then((r) => !c.signal.aborted && setRelated(r))
      .catch(() => !c.signal.aborted && setRelated([]));
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
  if ((loading || !article) && preview) {
    return (
      <article className="pt-8 sm:pt-12" aria-labelledby="article-title" aria-busy="true">
        <ArticleHeader a={preview} />
        <div className="container mt-10 max-w-[64rem]">
          <div className="max-w-[65ch]">
            <BodySkeleton />
          </div>
        </div>
      </article>
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
  // Bangla interface + an approved Bangla translation: show the translated story (title, standfirst,
  // body, TL;DR) with a switch back to the English original. SEO and JSON-LD stay on the original.
  const translated = lang === 'bn' && !showOriginal && bangla && (bangla.title || bangla.content) ? bangla : null;
  const view: Article = translated
    ? {
        ...a,
        title: translated.title ?? a.title,
        excerpt: translated.excerpt ?? (translated.content ? '' : a.excerpt),
        content: translated.content ?? a.content,
        contentBlocks: translated.content ? null : a.contentBlocks,
        tldr: translated.tldr ?? a.tldr,
        aiReviewed: translated.tldr ? false : a.aiReviewed,
        whyItMatters: translated.whyItMatters ?? a.whyItMatters,
      }
    : a;
  const hasBnStory = Boolean(bangla && (bangla.title || bangla.content));
  // The standfirst is shown under the headline; don't repeat it as the first body paragraph.
  const bodyBlocks =
    view.contentBlocks && view.contentBlocks[0]?.type === 'paragraph' && view.contentBlocks[0].text.trim().toLowerCase() === view.excerpt.trim().toLowerCase()
      ? view.contentBlocks.slice(1)
      : view.contentBlocks;

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
      <ReadingProgress targetId="article-body" minutes={a.readMinutes} />

      <article className="pt-8 sm:pt-12" aria-labelledby="article-title" lang={translated ? 'bn' : 'en'}>
        <ArticleHeader a={view} />
        {lang === 'bn' && (hasBnStory || bnChecked) && (
          <div className="container mt-6 max-w-[64rem]">
            <p lang="bn" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border bg-mist/60 px-4 py-3 text-sm text-mist-foreground" role="status">
              <Languages className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                {hasBnStory ? (translated ? t('article.bnAvailable') : t('article.translatedNote')) : t('article.enOnly')}
              </span>
              {hasBnStory && (
                <button type="button" onClick={() => setShowOriginal((v) => !v)} className="min-h-11 font-medium text-primary underline-offset-4 hover:underline sm:min-h-0">
                  {translated ? t('article.bnShowOriginal') : t('article.bnShowTranslation')}
                </button>
              )}
            </p>
          </div>
        )}

        <div className="container mt-10 max-w-[64rem]">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8">
              <BriefingBox article={view} bangla={translated ? null : bangla} className="mb-10" />
              {a.isOpinion && (
                <p className="mb-8 flex gap-2 rounded-md border bg-card p-3 text-sm">
                  <Scale className="mt-0.5 size-4 shrink-0 text-primary" />
                  {t('article.opinionNote')}
                </p>
              )}
              <div id="article-body">
                <ArticleBody blocks={bodyBlocks} content={view.content} className="max-w-[65ch]" />
              </div>
              {a.tags.length > 0 && (
                <ul className="mt-10 flex flex-wrap gap-2" aria-label={t('article.topics')}>
                  {a.tags.map((t) => (
                    <li key={t}>
                      <Link to={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-mist">
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-12">
                <SourcesList article={a} />
              </div>
            </div>
            <aside className="hidden lg:col-span-4 lg:block">
              {askAvailable && (
                <div className="sticky top-[calc(var(--header-h)+1.5rem)]">
                  <AskPanel article={a} available onUnavailable={() => setAskAvailable(false)} />
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>

      <div className="container mt-16 max-w-[64rem]">
        <ArticleEnd article={view} related={related ? related.slice(0, 3) : null} />
        {/* The page's only newsletter ask, after the reader has finished. */}
        <NewsletterBlock source="article-end" className="mt-16" title={t('newsletter.articleTitle')} />
      </div>
      {askAvailable && <MobileAsk article={a} onUnavailable={() => setAskAvailable(false)} />}
    </>
  );
}
