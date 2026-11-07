import { useEffect, useState } from 'react';

/** Thin Signal Blue progress line at the top of the viewport. */
export function ReadingProgress({ targetId }: { targetId: string }) {
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
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5" aria-hidden="true">
      <div className="h-full origin-left bg-primary transition-transform duration-150" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
