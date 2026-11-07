import { AlertCircle, Newspaper, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

export function SectionHeader({ eyebrow, title, action, className }: { eyebrow?: string; title: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-2 flex items-end justify-between gap-4 border-b border-foreground pb-3', className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="font-display text-[1.65rem] font-medium leading-none tracking-[-0.015em] sm:text-[1.9rem]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message?: string; onRetry?: () => void; className?: string }) {
  const { t, lang } = useI18n();
  return (
    <div className={cn('flex flex-col items-start gap-3 rounded-lg border border-dashed bg-card p-6', className)} role="alert">
      <AlertCircle className="size-5 text-destructive" />
      <div>
        <p className="font-medium">{t('state.errorTitle')}</p>
        <p className="text-sm text-muted-foreground">{lang === 'en' && message ? message : t('state.errorBody')}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCw /> {t('state.retry')}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, body, className }: { title?: string; body?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn('flex flex-col items-start gap-2 rounded-lg border bg-card p-8', className)}>
      <Newspaper className="size-5 text-primary" />
      <p className="font-display text-2xl font-medium">{title ?? t('state.emptyTitle')}</p>
      {body && <p className="max-w-xl text-muted-foreground">{body}</p>}
    </div>
  );
}

/**
 * Skeletons mirror the real layouts box for box (same aspect ratios, same line heights),
 * so swapping skeleton for content does not move anything (no CLS).
 */
export function StoryGridSkeleton({ count = 3, className, withImage = true }: { count?: number; className?: string; withImage?: boolean }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} aria-busy="true" aria-label="Loading stories">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          {withImage && <Skeleton className="aspect-video w-full" />}
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

/** Matches StoryCard variant="row": text column plus a square thumbnail. */
export function StoryRowSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('divide-y', className)} aria-busy="true" aria-label="Loading stories">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 py-5">
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="aspect-square w-24 shrink-0 sm:w-36" />
        </div>
      ))}
    </div>
  );
}

/** Matches StoryCard variant="hero": 16:9 art, meta line, two-line headline, three-line excerpt. */
export function HeroSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading top story">
      <Skeleton className="aspect-video w-full" />
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-[2rem] w-full sm:h-[2.7rem]" />
        <Skeleton className="h-[2rem] w-3/4 sm:h-[2.7rem]" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </div>
    </div>
  );
}

/** Matches StoryCard variant="lead" with art: 7/5 split, 3:2 image. */
export function LeadSkeleton() {
  return (
    // Same minimum height as the text-led lead cover, so either kind of lead replaces it without a jump.
    <div className="grid min-h-[34rem] content-start gap-5 md:min-h-[30rem] md:grid-cols-12 md:gap-8" aria-busy="true" aria-label="Loading top story">
      <Skeleton className="aspect-[3/2] w-full md:col-span-7" />
      <div className="space-y-3 md:col-span-5 md:py-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-5/6" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-2 h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
    </div>
  );
}

/** Matches the home Quick briefing card: five numbered items. */
export function BriefingSkeleton() {
  return (
    <div className="h-full rounded-lg border bg-card p-6 sm:p-7" aria-busy="true" aria-label="Loading quick briefing">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-44" />
      <div className="mt-5 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-3 w-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
