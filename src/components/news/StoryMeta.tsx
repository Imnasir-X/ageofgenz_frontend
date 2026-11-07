import { Link } from 'react-router-dom';
import type { Article } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { categoryHref } from '@/constants/sections';
import { cn } from '@/lib/utils';
import { meaningfulUpdate } from '@/lib/dates';
import { useI18n } from '@/lib/i18n/useI18n';

export function OpinionLabel({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Badge variant="opinion" className={className} title={t('story.opinionTitle')}>
      {t('story.opinion')}
    </Badge>
  );
}

export function CategoryLink({ article, className }: { article: Article; className?: string }) {
  const { category } = useI18n();
  return (
    <Link to={categoryHref(article.category.slug)} className={cn('eyebrow relative z-10 text-primary hover:underline', className)}>
      {category(article.category.slug, article.category.name)}
    </Link>
  );
}

export function StoryMeta({ article, className, showCategory = true }: { article: Article; className?: string; showCategory?: boolean }) {
  const { t, ago } = useI18n();
  const updated = meaningfulUpdate(article);
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground', className)}>
      {article.isOpinion && <OpinionLabel />}
      {showCategory && <CategoryLink article={article} />}
      {updated ? (
        <span className="data" title={`Published ${new Date(article.publishedAt).toUTCString()}`}>
          <span className="font-medium text-foreground/80">{t('story.updated')}</span>{' '}
          <time dateTime={updated.toISOString()} suppressHydrationWarning>
            {ago(updated.toISOString())}
          </time>
        </span>
      ) : (
        article.publishedAt && (
          <time dateTime={article.publishedAt} className="data" suppressHydrationWarning>
            {ago(article.publishedAt)}
          </time>
        )
      )}
      <span aria-hidden="true" className="data">·</span>
      <span className="data">{t('story.min', { n: article.readMinutes })}</span>
    </div>
  );
}
