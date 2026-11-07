import markBlue from '@/assets/logo-mark.png';
import markWhite from '@/assets/logo-mark-white.png';
import { cn } from '@/lib/utils';

/**
 * The official GZ mark. Signal Blue on light surfaces; white on dark surfaces and in dark
 * mode, where the blue mark falls below a comfortable contrast against Deep Ink.
 */
export function LogoMark({ className, title, inverted = false }: { className?: string; title?: string; inverted?: boolean }) {
  const common = {
    width: 224,
    height: 224,
    alt: title ?? '',
    'aria-hidden': title ? undefined : true,
    decoding: 'async' as const,
  };
  if (inverted) return <img src={markWhite} {...common} className={cn('size-7', className)} />;
  return (
    <>
      <img src={markBlue} {...common} className={cn('size-7 dark:hidden', className)} />
      <img src={markWhite} {...common} alt="" aria-hidden className={cn('hidden size-7 dark:block', className)} />
    </>
  );
}

export function Wordmark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <LogoMark className="size-[28px]" inverted={inverted} />
      <span className={cn('font-display text-[1.1rem] font-semibold sm:text-[1.2rem] leading-none tracking-[-0.02em]', inverted ? 'text-ink-foreground' : 'text-foreground')}>
        The Age of <span className={inverted ? 'text-lime' : 'text-primary'}>GenZ</span>
      </span>
    </span>
  );
}
