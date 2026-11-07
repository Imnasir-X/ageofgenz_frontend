import { ExternalLink } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { CONTACT_EMAIL } from '@/lib/utils';
import { extractLinks } from '@/lib/article/html';

/** Sources and perspectives. Falls back to links cited in the body, then to a corrections note. */
export function SourcesList({ article }: { article: Article }) {
  const sources = article.sources?.length ? article.sources : extractLinks(article.contentBlocks, article.content);
  return (
    <section className="border-t border-foreground pt-6" aria-labelledby="sources-title">
      <h2 id="sources-title" className="font-display text-[1.6rem] font-medium tracking-[-0.015em]">
        Sources{article.perspectives?.length ? ' & perspectives' : ''}
      </h2>
      {sources.length > 0 ? (
        <ol className="mt-4 divide-y border-y">
          {sources.slice(0, 12).map((s, i) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="group flex gap-4 py-3 text-sm">
                <span className="data pt-0.5 text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 break-words">
                  <span className="font-medium group-hover:text-primary group-hover:underline">{s.title}</span>
                  {s.publisher && s.publisher !== s.title && <span className="data ml-2 text-muted-foreground">{s.publisher}</span>}
                </span>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A source list for this story hasn’t been published yet. See something wrong? Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Correction: ${article.title}`)}`} className="link-underline text-primary">
            {CONTACT_EMAIL}
          </a>{' '}
          and we’ll look at it.
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
                  Read the source
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
