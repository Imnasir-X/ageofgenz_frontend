import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { cn, truncate } from '@/lib/utils';
import { StoryImage } from './StoryImage';
import { CoverArt } from './CoverArt';
import { StoryMeta } from './StoryMeta';
import { articleLinkProps } from '@/lib/prefetch';

export function WhyItMatters({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn('border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground/85', className)}>
      <span className="font-semibold text-foreground">Why it matters: </span>
      {text}
    </p>
  );
}

type Variant = 'hero' | 'lead' | 'feature' | 'standard' | 'row' | 'compact' | 'text';

interface StoryCardProps {
  article: Article;
  variant?: Variant;
  className?: string;
  index?: number;
  priority?: boolean;
  showWhy?: boolean;
  /** `sizes` for the card image (standard variant), when the grid it sits in is known. */
  sizes?: string;
}

/** Hover lift + press feedback, transform-only (no layout shift), disabled under reduced motion. */
const lift = 'transition-transform duration-base ease-standard motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.995]';
const press = 'transition-transform duration-fast ease-standard motion-safe:active:scale-[0.995]';

/** Whole-card link: the headline link stretches over the card; category links sit above it. */
export function StoryCard({ article, variant = 'standard', className, index, priority, showWhy = true, sizes }: StoryCardProps) {
  const headline = (size: string) => (
    <h3 className={cn('font-display font-medium leading-[1.2] tracking-[-0.01em] text-foreground', size)}>
      <Link {...articleLinkProps(article)} className="transition-colors duration-fast after:absolute after:inset-0 group-hover:text-primary">
        {article.title}
      </Link>
    </h3>
  );

  if (variant === 'hero') {
    // Home lead: full-width 16:9 art (branded cover when the story has none), headline underneath.
    return (
      <article className={cn('group relative flex flex-col gap-4', press, className)}>
        <StoryImage
          src={article.image}
          alt={article.imageAlt || article.title}
          width={880}
          sizes="(min-width: 1024px) 58vw, calc(100vw - 2.5rem)"
          priority={priority}
          ratio="video"
          category={article.category.slug}
          categoryLabel={article.category.name}
        />
        <div className="flex flex-col gap-2.5">
          <StoryMeta article={article} />
          <h2 className="font-display text-[1.85rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
            <Link {...articleLinkProps(article)} className="transition-colors duration-fast after:absolute after:inset-0 group-hover:text-primary">
              {article.title}
            </Link>
          </h2>
          {article.excerpt && <p className="line-clamp-3 font-serif text-[1.08rem] leading-[1.55] text-muted-foreground sm:text-lg">{truncate(article.excerpt, 240)}</p>}
          {showWhy && <WhyItMatters text={article.whyItMatters} />}
        </div>
      </article>
    );
  }

  if (variant === 'lead' && !article.image) {
    // Text-led cover for stories without art: no placeholder blocks.
    return (
      <article className={cn('group relative isolate flex min-h-[34rem] flex-col justify-center overflow-hidden rounded-lg bg-ink px-6 py-8 text-ink-foreground sm:px-10 sm:py-12 md:min-h-[30rem]', press, className)}>
        <CoverArt category={article.category.slug} size="lg" className="-z-10 opacity-90" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {article.isOpinion && (
            <span className="rounded-full border border-ink-foreground/60 px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider">Opinion</span>
          )}
          <span className="eyebrow text-ink-foreground/70">{article.category.name}</span>
          <span className="data text-ink-foreground/60">{article.readMinutes} min read</span>
        </div>
        <h2 className="mt-5 max-w-4xl font-display text-[2.1rem] font-medium leading-[1.04] tracking-[-0.022em] text-ink-foreground sm:text-[3.25rem] lg:text-[3.75rem]">
          <Link {...articleLinkProps(article)} className="decoration-ink-foreground/40 decoration-2 underline-offset-[8px] after:absolute after:inset-0 group-hover:underline">
            {article.title}
          </Link>
        </h2>
        {article.excerpt && (
          <p className="mt-6 max-w-2xl font-serif text-lg leading-[1.55] text-ink-foreground/75 sm:text-xl">{truncate(article.excerpt, 260)}</p>
        )}
        {showWhy && article.whyItMatters && (
          <p className="mt-6 max-w-2xl border-l-2 border-ink-foreground/30 pl-3 text-sm leading-relaxed text-ink-foreground/90">
            <span className="font-semibold text-ink-foreground">Why it matters: </span>
            {article.whyItMatters}
          </p>
        )}
        {/* Von Restorff: the one Electric Lime element in the view is the lead story's call to action. */}
        <p className="mt-9 inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-lime px-4 text-sm font-semibold text-lime-foreground" aria-hidden="true">
          Read the story <ArrowRight className="size-4 transition-transform duration-base ease-standard group-hover:translate-x-0.5" />
        </p>
      </article>
    );
  }

  if (variant === 'lead') {
    return (
      <article className={cn('group relative grid gap-5 md:grid-cols-12 md:gap-8', press, className)}>
        <StoryImage src={article.image} alt={article.imageAlt || article.title} width={720} sizes="(min-width: 768px) 55vw, calc(100vw - 2.5rem)" priority={priority} className="md:col-span-7" ratio="wide" category={article.category.slug} categoryLabel={article.category.name} />
        <div className="flex flex-col gap-3 md:col-span-5 md:py-2">
          <StoryMeta article={article} />
          <h2 className="font-display text-[2rem] font-medium leading-[1.06] tracking-[-0.02em] sm:text-[2.6rem]">
            <Link {...articleLinkProps(article)} className="transition-colors duration-fast after:absolute after:inset-0 group-hover:text-primary">
              {article.title}
            </Link>
          </h2>
          {article.excerpt && <p className="font-serif text-lg leading-[1.55] text-muted-foreground">{truncate(article.excerpt, 240)}</p>}
          {showWhy && <WhyItMatters text={article.whyItMatters} />}
        </div>
      </article>
    );
  }

  if (variant === 'feature') {
    // A single story given the full width (sparse rails, a lone related story): image left, text right.
    return (
      <article className={cn('group relative grid gap-5 sm:grid-cols-12 sm:items-center sm:gap-8', press, className)}>
        <StoryImage src={article.image} alt={article.imageAlt || article.title} width={560} sizes="(min-width: 640px) 40vw, calc(100vw - 2.5rem)" ratio="wide" className="sm:col-span-5" category={article.category.slug} categoryLabel={article.category.name} />
        <div className="flex flex-col gap-2.5 sm:col-span-7">
          <StoryMeta article={article} />
          {headline('text-[1.5rem] sm:text-[1.85rem] leading-[1.12]')}
          {showWhy && article.whyItMatters ? (
            <WhyItMatters text={article.whyItMatters} className="text-[0.88rem]" />
          ) : (
            article.excerpt && <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">{article.excerpt}</p>
          )}
        </div>
      </article>
    );
  }

  if (variant === 'row') {
    return (
      <article className={cn('group relative flex gap-4 py-5', press, className)}>
        <div className="min-w-0 flex-1">
          <StoryMeta article={article} className="mb-2" />
          {headline('text-[1.2rem] sm:text-[1.35rem]')}
          {showWhy && article.whyItMatters ? (
            <WhyItMatters text={article.whyItMatters} className="mt-2.5 text-[0.82rem]" />
          ) : (
            article.excerpt && <p className="mt-2 line-clamp-2 text-[0.9rem] leading-relaxed text-muted-foreground">{article.excerpt}</p>
          )}
        </div>
        {article.image && (
          <StoryImage src={article.image} alt={article.imageAlt || article.title} width={144} sizes="(min-width: 640px) 144px, 96px" className="w-24 shrink-0 sm:w-36" ratio="square" category={article.category.slug} />
        )}
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
    <article className={cn('group relative flex flex-col gap-3', lift, className)}>
      <StoryImage src={article.image} alt={article.imageAlt || article.title} width={640} sizes={sizes ?? '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, calc(100vw - 2.5rem)'} priority={priority} category={article.category.slug} categoryLabel={article.category.name} />
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
