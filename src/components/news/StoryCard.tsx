import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { cn, truncate } from '@/lib/utils';
import { StoryImage } from './StoryImage';
import { StoryMeta } from './StoryMeta';

export function WhyItMatters({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn('border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground/85', className)}>
      <span className="font-semibold text-foreground">Why it matters: </span>
      {text}
    </p>
  );
}

type Variant = 'lead' | 'standard' | 'row' | 'compact' | 'text';

interface StoryCardProps {
  article: Article;
  variant?: Variant;
  className?: string;
  index?: number;
  priority?: boolean;
  showWhy?: boolean;
}

/** Whole-card link: the headline link stretches over the card; category links sit above it. */
export function StoryCard({ article, variant = 'standard', className, index, priority, showWhy = true }: StoryCardProps) {
  const headline = (size: string) => (
    <h3 className={cn('font-display font-medium leading-[1.2] tracking-[-0.01em] text-foreground', size)}>
      <Link to={article.href} className="after:absolute after:inset-0 group-hover:text-primary">
        {article.title}
      </Link>
    </h3>
  );

  if (variant === 'lead' && !article.image) {
    // Text-led cover for stories without art: no placeholder blocks.
    return (
      <article className={cn('group relative overflow-hidden rounded-lg bg-ink px-6 py-8 text-ink-foreground sm:px-10 sm:py-12', className)}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {article.isOpinion && (
            <span className="rounded-full border border-ink-foreground/60 px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider">Opinion</span>
          )}
          <span className="eyebrow text-lime">{article.category.name}</span>
          <span className="data text-ink-foreground/60">{article.readMinutes} min read</span>
        </div>
        <h2 className="mt-5 max-w-4xl font-display text-[2.1rem] font-medium leading-[1.04] tracking-[-0.022em] text-ink-foreground sm:text-[3.25rem] lg:text-[3.75rem]">
          <Link to={article.href} className="after:absolute after:inset-0 decoration-lime decoration-2 underline-offset-[8px] group-hover:underline">
            {article.title}
          </Link>
        </h2>
        {article.excerpt && (
          <p className="mt-6 max-w-2xl font-serif text-lg leading-[1.55] text-ink-foreground/75 sm:text-xl">{truncate(article.excerpt, 260)}</p>
        )}
        {showWhy && article.whyItMatters && (
          <p className="mt-6 max-w-2xl border-l-2 border-lime pl-3 text-sm leading-relaxed text-ink-foreground/90">
            <span className="font-semibold text-lime">Why it matters: </span>
            {article.whyItMatters}
          </p>
        )}
        <p className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-lime">
          Read the story <ArrowRight className="size-4" aria-hidden="true" />
        </p>
      </article>
    );
  }

  if (variant === 'lead') {
    return (
      <article className={cn('group relative grid gap-5 md:grid-cols-12 md:gap-8', className)}>
        <StoryImage src={article.image} alt={article.title} width={1200} priority={priority} className="md:col-span-7" ratio="wide" />
        <div className="flex flex-col gap-3 md:col-span-5 md:py-2">
          <StoryMeta article={article} />
          <h2 className="font-display text-[2rem] font-medium leading-[1.06] tracking-[-0.02em] sm:text-[2.6rem]">
            <Link to={article.href} className="after:absolute after:inset-0 group-hover:text-primary">
              {article.title}
            </Link>
          </h2>
          {article.excerpt && <p className="font-serif text-lg leading-[1.55] text-muted-foreground">{truncate(article.excerpt, 240)}</p>}
          {showWhy && <WhyItMatters text={article.whyItMatters} />}
        </div>
      </article>
    );
  }

  if (variant === 'row') {
    return (
      <article className={cn('group relative flex gap-4 py-5', className)}>
        <div className="min-w-0 flex-1">
          <StoryMeta article={article} className="mb-2" />
          {headline('text-[1.2rem] sm:text-[1.35rem]')}
          {showWhy && article.whyItMatters ? (
            <WhyItMatters text={article.whyItMatters} className="mt-2.5 text-[0.82rem]" />
          ) : (
            article.excerpt && <p className="mt-2 line-clamp-2 text-[0.9rem] leading-relaxed text-muted-foreground">{article.excerpt}</p>
          )}
        </div>
        {article.image && <StoryImage src={article.image} alt={article.title} width={320} className="w-24 shrink-0 sm:w-36" ratio="square" />}
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className={cn('group relative flex gap-3 py-3', className)}>
        {typeof index === 'number' && (
          <span className="w-7 shrink-0 font-mono text-sm font-medium leading-6 text-primary" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
        <div className="min-w-0">
          {headline('text-[1.05rem]')}
          <StoryMeta article={article} className="mt-1" />
        </div>
      </article>
    );
  }

  if (variant === 'text') {
    return (
      <article className={cn('group relative py-5', className)}>
        <StoryMeta article={article} className="mb-2" />
        {headline('text-[1.3rem]')}
        {article.excerpt && <p className="mt-2 line-clamp-3 text-[0.9rem] leading-relaxed text-muted-foreground">{article.excerpt}</p>}
      </article>
    );
  }

  return (
    <article className={cn('group relative flex flex-col gap-3', !article.image && 'border-t border-foreground pt-4', className)}>
      {article.image && <StoryImage src={article.image} alt={article.title} width={640} priority={priority} />}
      <StoryMeta article={article} />
      {headline('text-[1.3rem]')}
      {showWhy && article.whyItMatters ? (
        <WhyItMatters text={article.whyItMatters} className="text-[0.82rem]" />
      ) : (
        article.excerpt && <p className="line-clamp-3 text-[0.9rem] leading-relaxed text-muted-foreground">{article.excerpt}</p>
      )}
    </article>
  );
}
