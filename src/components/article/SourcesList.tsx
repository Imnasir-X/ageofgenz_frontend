import { BookOpen, ExternalLink, FlaskConical, Newspaper, type LucideIcon } from 'lucide-react';
import type { Article, ArticleSource, SourceKind } from '@/lib/api/types';
import { CONTACT_EMAIL } from '@/lib/utils';
import { extractLinks } from '@/lib/article/html';
import { useI18n } from '@/lib/i18n/useI18n';

const KIND_ICON: Record<SourceKind, LucideIcon> = { original: Newspaper, research: FlaskConical, reference: BookOpen };

/** Sources and perspectives. Falls back to links cited in the body, then to a corrections note. */
export function SourcesList({ article }: { article: Article }) {
  const { t } = useI18n();
  const sources: ArticleSource[] = article.sources?.length ? article.sources : extractLinks(article.contentBlocks, article.content);
  return (
    <section className="border-t border-foreground pt-6" aria-labelledby="sources-title">
      <h2 id="sources-title" className="font-display text-[1.6rem] font-medium tracking-[-0.015em]">
        {article.perspectives?.length ? t('sources.titlePerspectives') : t('sources.title')}
      </h2>
      {sources.length > 0 ? (
        <ol className="mt-4 divide-y border-y">
          {sources.slice(0, 12).map((s, i) => {
            const Icon = s.kind ? KIND_ICON[s.kind] : null;
            const kindLabel = s.kind ? t(`sources.kind.${s.kind}`) : null;
            return (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="group flex gap-4 py-3 text-sm">
                  <span className="data pt-0.5 text-muted-foreground" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1 break-words">
                    <span className="font-medium group-hover:text-primary group-hover:underline">{s.title}</span>
                    {s.publisher && s.publisher !== s.title && <span className="data ml-2 text-muted-foreground">{s.publisher}</span>}
                    {Icon && kindLabel && (
                      <span className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.72rem] font-medium text-foreground/80" data-kind={s.kind}>
                        <Icon className="size-3.5 text-primary" aria-hidden="true" />
                        <span className="sr-only">{t('sources.kindPrefix')} </span>
                        {kindLabel}
                      </span>
                    )}
                  </span>
                  <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">{t('sources.opens')}</span>
                </a>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t('sources.none')}{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Correction: ${article.title}`)}`} className="link-underline text-primary">
            {CONTACT_EMAIL}
          </a>{' '}
          {t('sources.noneEnd')}
        </p>
      )}
      {article.perspectives && article.perspectives.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {article.perspectives.map((p, i) => (
            <div key={i} className="rounded-md bg-muted p-4">
              <p className="eyebrow text-foreground">{p.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed">{p.summary}</p>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                  {t('sources.readSource')}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
