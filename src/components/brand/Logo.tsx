import gzMark from '@/assets/gz-mark.png';
import { cn } from '@/lib/utils';

/** The blue GZ mark, re-exported from the original artwork (unchanged). */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <img
      src={gzMark}
      width={165}
      height={112}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      className={cn('h-7 w-auto', className)}
      decoding="async"
    />
  );
}

export function Wordmark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <LogoMark className="h-[26px]" />
      <span className={cn('font-display text-[1.2rem] font-semibold leading-none tracking-[-0.02em]', inverted ? 'text-ink-foreground' : 'text-foreground')}>
        The Age of <span className={inverted ? 'text-lime' : 'text-primary'}>GenZ</span>
      </span>
    </span>
  );
}
