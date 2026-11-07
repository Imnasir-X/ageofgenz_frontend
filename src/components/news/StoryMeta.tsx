import { Link } from 'react-router-dom';
import type { Article } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { categoryHref } from '@/constants/sections';
import { cn, timeAgo } from '@/lib/utils';
import { meaningfulUpdate } from '@/lib/dates';

export function OpinionLabel({ className }: { className?: string }) {
  return (
    <Badge variant="opinion" className={className} title="Opinion: the author’s argument, not a news report.">
      Opinion
    </Badge>
  );
}

export function CategoryLink({ article, className }: { article: Article; className?: string }) {
  return (
    <Link to={categoryHref(article.category.slug)} className={cn('eyebrow relative z-10 text-primary hover:underline', className)}>
      {article.category.name}
    </Link>
  );
}

export function StoryMeta({ article, className, showCategory = true }: { article: Article; className?: string; showCategory?: boolean }) {
  const updated = meaningfulUpdate(article);
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground', className)}>
      {article.isOpinion && <OpinionLabel />}
      {showCategory && <CategoryLink article={article} />}
      {updated ? (
        <span className="data" title={`Published ${new Date(article.publishedAt).toUTCString()}`}>
          <span className="font-medium text-foreground/80">Updated</span>{' '}
          <time dateTime={updated.toISOString()} suppressHydrationWarning>
            {timeAgo(updated.toISOString())}
          </time>
        </span>
      ) : (
        article.publishedAt && (
          <time dateTime={article.publishedAt} className="data" suppressHydrationWarning>
            {timeAgo(article.publishedAt)}
          </time>
        )
      )}
      <span aria-hidden="true" className="data">·</span>
      <span className="data">{article.readMinutes} min</span>
    </div>
  );
}
