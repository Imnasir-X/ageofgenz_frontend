import { cn } from '@/lib/utils';

/** Placeholder block with a soft shimmer (static under prefers-reduced-motion). Always aria-hidden: the parent carries aria-busy. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'motion-safe:after:absolute motion-safe:after:inset-0 motion-safe:after:-translate-x-full motion-safe:after:animate-shimmer',
        'motion-safe:after:bg-gradient-to-r motion-safe:after:from-transparent motion-safe:after:via-background/50 motion-safe:after:to-transparent',
        className,
      )}
      {...props}
    />
  );
}
