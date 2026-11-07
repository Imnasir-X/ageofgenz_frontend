import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

/**
 * Thin Signal Blue progress line at the top of the viewport, plus a quiet "N min left"
 * pill once the reader is into the body. Both are decorative for screen readers (the
 * reading time is stated in the article meta).
 */
export function ReadingProgress({ targetId, minutes }: { targetId: string; minutes?: number }) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.getElementById(targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      setProgress(Math.min(1, Math.max(0, -rect.top / Math.max(total, 1))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  const left = minutes ? Math.max(1, Math.ceil(minutes * (1 - progress))) : 0;
  const showPill = Boolean(minutes && minutes > 1 && progress > 0.05 && progress < 0.98);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5" aria-hidden="true">
        <div className="h-full origin-left bg-primary transition-transform duration-fast ease-standard" style={{ transform: `scaleX(${progress})` }} />
      </div>
      {minutes ? (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed right-4 top-[calc(var(--header-h)+2.5rem+0.75rem)] z-30 rounded-full border bg-background/90 px-3 py-1 font-mono text-[0.7rem] text-muted-foreground shadow-sm backdrop-blur transition-opacity duration-base ease-standard xl:top-[calc(var(--header-h)+0.75rem)]',
            showPill ? 'opacity-100' : 'opacity-0',
          )}
        >
          {t('progress.left', { n: left })}
        </div>
      ) : null}
    </>
  );
}
