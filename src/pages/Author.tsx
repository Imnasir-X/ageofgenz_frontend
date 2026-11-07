import { useContext } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight, Newspaper } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { InitialDataContext } from '@/components/seo/context';
import { StoryCard } from '@/components/news/StoryCard';
import { ErrorState, StoryRowSkeleton } from '@/components/news/States';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/useAsync';
import { ApiError, authorsApi } from '@/lib/api/client';
import type { AuthorProfile } from '@/lib/api/types';
import { authorJsonLd } from '@/lib/article/jsonLd';
import { optimizeImage } from '@/lib/image';
import { useI18n } from '@/lib/i18n/useI18n';
import type { StringKey } from '@/lib/i18n/strings';
import { truncate } from '@/lib/utils';
import NotFound from './NotFound';

const ROLE_KEYS = new Set(['desk', 'staff', 'editor', 'contributor', 'columnist']);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[\p{L}]/u.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

function AuthorSkeleton() {
  const { t } = useI18n();
  return (
    <div className="container max-w-[64rem] pt-8 sm:pt-12" aria-busy="true" aria-label={t('state.loading')}>
      <div className="flex items-start gap-5 border-b border-foreground pb-8">
        <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </div>
      <StoryRowSkeleton count={4} className="mt-6" />
    </div>
  );
}

/** /author/:slug/ : a byline's bio and its live stories, 12 per page (GET /api/authors/<slug>/?page=). */
export default function AuthorPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const initial = useContext(InitialDataContext);
  const initialProfile = page === 1 && initial.author && initial.author.author.slug === slug ? initial.author : undefined;
  const { data, error, loading, reload } = useAsync<AuthorProfile>((signal) => authorsApi.bySlug(slug, page, signal), `${slug}|${page}`, {
    initial: initialProfile,
  });
  const { t, num } = useI18n();

  if (initial.authorMissing && !initialProfile && initial.path?.includes(slug)) return <NotFound />;
  if (error instanceof ApiError && error.status === 404) return <NotFound />;
  if (error && !data) {
    return (
      <div className="container max-w-3xl pt-12">
        <ErrorState message={error.message} onRetry={reload} />
      </div>
    );
  }
  if (loading || !data) return <AuthorSkeleton />;

  const { author, articles, count, pages } = data;
  const path = `/author/${author.slug ?? slug}/`;
  const role = author.role && ROLE_KEYS.has(author.role) ? t(`author.role.${author.role}` as StringKey) : author.role;
  const description = author.bio ? truncate(author.bio, 160) : `Stories by ${author.name} at The Age of GenZ.`;
  const pageHref = (p: number) => (p <= 1 ? path : `${path}?page=${p}`);

  return (
    <>
      <Seo
        title={page > 1 ? `${author.name} (page ${page})` : author.name}
        description={description}
        path={path}
        image={author.avatar ?? undefined}
        noindex={page > 1}
        jsonLd={authorJsonLd(data)}
      />
      <div className="container max-w-[64rem] pt-8 sm:pt-12">
        <nav aria-label={t('article.breadcrumb')} className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            {t('nav.home')}
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <span aria-current="page" className="text-foreground">
            {author.name}
          </span>
        </nav>

        <header className="flex flex-col gap-5 border-b border-foreground pb-8 sm:flex-row sm:items-start sm:gap-7">
          {author.avatar ? (
            <img
              src={optimizeImage(author.avatar, 192)}
              alt=""
              width={96}
              height={96}
              loading="eager"
              decoding="async"
              className="size-20 shrink-0 rounded-full border object-cover sm:size-24"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-20 shrink-0 items-center justify-center rounded-full bg-mist font-display text-2xl font-medium text-secondary-foreground sm:size-24 sm:text-3xl"
            >
              {author.isDesk ? <Newspaper className="size-8 text-primary" /> : initials(author.name) || <Newspaper className="size-8 text-primary" />}
            </span>
          )}
          <div className="min-w-0">
            <p className="eyebrow text-primary">{author.isDesk ? t('author.eyebrowDesk') : t('author.eyebrow')}</p>
            <h1 className="mt-2 font-display text-[2.4rem] font-medium leading-[1.02] tracking-[-0.025em] sm:text-[3.4rem]">{author.name}</h1>
            {role && <p className="mt-2 text-sm font-medium text-muted-foreground">{role}</p>}
            {author.bio && <p className="mt-4 max-w-2xl font-serif text-[1.2rem] leading-[1.55] text-foreground/85">{author.bio}</p>}
            <p className="data mt-4 text-muted-foreground">{count === 1 ? t('author.story') : t('author.stories', { n: count })}</p>
          </div>
        </header>

        <section aria-label={t('author.storiesBy', { name: author.name })} className="mt-2">
          {articles.length > 0 ? (
            <div className="divide-y border-b">
              {articles.map((a) => (
                <StoryCard key={a.slug} article={a} variant="row" />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border bg-card p-8">
              <p className="font-display text-2xl font-medium">{t('author.noStories')}</p>
              <p className="mt-2 text-muted-foreground">{t('author.noStoriesBody')}</p>
            </div>
          )}
        </section>

        {pages > 1 && (
          <nav aria-label={t('author.pagination')} className="mt-10 flex items-center justify-between gap-4">
            {page > 1 ? (
              <Link to={pageHref(page - 1)} rel="prev" className="inline-flex min-h-11 items-center gap-1.5 rounded-md border bg-card px-4 text-sm font-medium hover:border-primary hover:text-primary">
                <ArrowLeft className="size-4" aria-hidden="true" /> {t('author.prev')}
              </Link>
            ) : (
              <span />
            )}
            <p className="data text-muted-foreground" aria-current="page">
              {t('author.page', { page: num(page), pages: num(pages) })}
            </p>
            {page < pages ? (
              <Link to={pageHref(page + 1)} rel="next" className="inline-flex min-h-11 items-center gap-1.5 rounded-md border bg-card px-4 text-sm font-medium hover:border-primary hover:text-primary">
                {t('author.next')} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </>
  );
}
