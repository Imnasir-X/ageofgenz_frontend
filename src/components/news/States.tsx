import { AlertCircle, Newspaper, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  return (
    <div className={cn('flex flex-col items-start gap-3 rounded-lg border border-dashed bg-card p-6', className)} role="alert">
      <AlertCircle className="size-5 text-destructive" />
      <div>
        <p className="font-medium">We couldn’t load these stories.</p>
        <p className="text-sm text-muted-foreground">{message || 'The newsroom server may be waking up. Give it a moment.'}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No stories here yet', body, className }: { title?: string; body?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-start gap-2 rounded-lg border bg-card p-8', className)}>
      <Newspaper className="size-5 text-primary" />
      <p className="font-display text-2xl font-medium">{title}</p>
      {body && <p className="max-w-xl text-muted-foreground">{body}</p>}
    </div>
  );
}

export function StoryGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} aria-busy="true" aria-label="Loading stories">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export function LeadSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-8" aria-busy="true" aria-label="Loading top story">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  );
}
