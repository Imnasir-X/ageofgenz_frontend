import type { CSSProperties } from 'react';
import { coverTint } from '@/lib/cover';
import { cn } from '@/lib/utils';

/**
 * Branded stand-in for a story without art (or whose image failed): a Deep Ink field with a
 * category-tinted Signal Blue glow, a fine dot grid and the section name. Pure CSS, no
 * network request, never a stock photo. Decorative: the headline next to it carries meaning.
 */
export function CoverArt({ category, label, className, size = 'md' }: { category?: string; label?: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      aria-hidden="true"
      style={{ '--tint': coverTint(category) } as CSSProperties}
      className={cn('cover-art absolute inset-0 overflow-hidden bg-ink', className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgb(var(--tint)/0.55),transparent_60%),radial-gradient(80%_70%_at_0%_100%,rgb(var(--tint)/0.22),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.09)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      {label && size !== 'sm' && (
        <span
          className={cn(
            'absolute bottom-3 left-3 font-mono uppercase tracking-[0.14em] text-white/70',
            size === 'lg' ? 'bottom-5 left-5 text-xs' : 'text-[0.65rem]',
          )}
        >
          {label}
        </span>
      )}
      <span
        className={cn(
          'absolute right-3 top-3 font-display font-semibold italic leading-none text-white/15',
          size === 'lg' ? 'right-5 top-4 text-6xl' : size === 'sm' ? 'right-2 top-1.5 text-xl' : 'text-4xl',
        )}
      >
        GZ
      </span>
    </div>
  );
}
