import { useState } from 'react';
import { Languages } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { cn, truncate } from '@/lib/utils';
import { keyPoints } from '@/lib/article/keyPoints';

interface Props {
  article: Article;
  bangla?: { title?: string; tldr?: string[] } | null;
  className?: string;
}

/**
 * TL;DR + "Why it matters", shown near the top of every article. Uses the backend's AI
 * summary when present; otherwise the editor's standfirst. Never invents a summary.
 */
export function BriefingBox({ article, bangla, className }: Props) {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const hasBn = Boolean(bangla && (bangla.tldr?.length || bangla.title));
  const extracted = article.tldr ? [] : keyPoints(article);
  const points = lang === 'bn' && bangla?.tldr?.length ? bangla.tldr : article.tldr ?? (extracted.length ? extracted : undefined);

  return (
    <section id="explainer" className={cn('rounded-lg border bg-card', className)} aria-labelledby="briefing-title" lang={lang === 'bn' ? 'bn' : undefined}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3 sm:px-6">
        <h2 id="briefing-title" className="eyebrow text-foreground">
          {article.tldr ? 'TL;DR' : 'Key points'}
        </h2>
        {hasBn && (
          <Button variant="ghost" size="sm" onClick={() => setLang((l) => (l === 'en' ? 'bn' : 'en'))} aria-pressed={lang === 'bn'} className="h-7 text-xs">
            <Languages /> {lang === 'en' ? 'বাংলা' : 'English'}
          </Button>
        )}
      </div>
      <div className="px-5 py-5 sm:px-6">
        {lang === 'bn' && bangla?.title && <p className="mb-3 font-serif text-lg font-semibold leading-snug">{bangla.title}</p>}
        {points && points.length > 0 ? (
          <ul className="space-y-3">
            {points.slice(0, 5).map((p, i) => (
              <li key={i} className="flex gap-3 font-serif text-[1.05rem] leading-[1.55]">
                <span className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-serif text-[1.08rem] leading-[1.55]">{truncate(article.excerpt || article.metaDescription || article.title, 360)}</p>
        )}
        {article.whyItMatters && (
          <div className="mt-5 rounded-md bg-mist px-4 py-3 text-mist-foreground">
            <p className="eyebrow text-secondary-foreground">Why it matters</p>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed">{article.whyItMatters}</p>
          </div>
        )}
        <p className="data mt-4 text-muted-foreground">
          {article.tldr ? 'AI-assisted summary of this article' : 'Opening lines of the article’s main points'}
        </p>
      </div>
    </section>
  );
}
