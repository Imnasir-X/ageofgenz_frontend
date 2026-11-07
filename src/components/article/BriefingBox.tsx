import { useState } from 'react';
import { Languages } from 'lucide-react';
import type { Article, ArticleTranslation } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { keyPoints } from '@/lib/article/keyPoints';
import { useI18n } from '@/lib/i18n/useI18n';

interface Props {
  article: Article;
  /** Approved Bangla translation, offered as a TL;DR switch while the page is read in English. */
  bangla?: ArticleTranslation | null;
  className?: string;
}

/**
 * TL;DR + "Why it matters", near the top of every article.
 * - The AI TL;DR only when the backend provides one, labelled as AI (and as editor-reviewed
 *   only when the backend says so).
 * - Otherwise up to three complete sentences taken verbatim from the article (never cut).
 * - Otherwise nothing at all.
 */
export function BriefingBox({ article, bangla, className }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState<'en' | 'bn'>('en');
  const hasAny = Boolean(article.tldr?.length || article.whyItMatters || keyPoints(article).length);
  const hasBn = Boolean(bangla && (bangla.tldr?.length || bangla.title));
  const showBn = hasBn && local === 'bn';
  const extracted = article.tldr ? [] : keyPoints(article);
  const points = showBn && bangla?.tldr?.length ? bangla.tldr : article.tldr ?? (extracted.length ? extracted : undefined);
  const why = showBn && bangla?.whyItMatters ? bangla.whyItMatters : article.whyItMatters;
  if (!hasAny) return null;

  return (
    <section id="explainer" className={cn('rounded-lg border bg-card', className)} aria-labelledby="briefing-title" lang={showBn ? 'bn' : undefined}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3 sm:px-6">
        <h2 id="briefing-title" className="eyebrow text-foreground">
          {article.tldr ? t('briefing.tldr') : points && points.length > 0 ? t('briefing.keyPoints') : t('story.whyItMatters')}
        </h2>
        {hasBn && (
          <Button variant="ghost" size="sm" onClick={() => setLocal((l) => (l === 'en' ? 'bn' : 'en'))} aria-pressed={showBn} className="text-xs sm:h-7">
            <Languages aria-hidden="true" /> <span lang={showBn ? 'en' : 'bn'}>{showBn ? 'English' : 'বাংলা'}</span>
          </Button>
        )}
      </div>
      <div className="px-5 py-5 sm:px-6">
        {showBn && bangla?.title && <p className="mb-3 font-serif text-lg font-semibold leading-snug">{bangla.title}</p>}
        {points && points.length > 0 ? (
          <ul className="space-y-3">
            {points.slice(0, 5).map((p, i) => (
              <li key={i} className="flex gap-3 font-serif text-[1.05rem] leading-[1.55]">
                <span className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {why && (
          <div className="mt-5 rounded-md bg-mist px-4 py-3 text-mist-foreground">
            <p className="eyebrow text-secondary-foreground">{t('story.whyItMatters')}</p>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed">{why}</p>
          </div>
        )}
        <p className="data mt-4 text-muted-foreground">
          {article.tldr
            ? article.aiReviewed
              ? t('briefing.aiReviewed')
              : t('briefing.ai')
            : points && points.length > 0
              ? t('briefing.quoted')
              : null}
        </p>
      </div>
    </section>
  );
}
