import { useState } from 'react';
import { cn } from '@/lib/utils';
import { imageSrcSet, optimizeImage } from '@/lib/image';
import { CoverArt } from './CoverArt';

const RATIOS = {
  video: 'aspect-[16/9]',
  wide: 'aspect-[3/2]',
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
};
/** Height / width for each ratio, so the width/height attributes match the box the image sits in. */
const RATIO_VALUES: Record<keyof typeof RATIOS, number> = { video: 9 / 16, wide: 2 / 3, square: 1, portrait: 5 / 4 };

interface StoryImageProps {
  src: string | null;
  alt: string;
  className?: string;
  width?: number;
  priority?: boolean;
  ratio?: keyof typeof RATIOS;
  /** Category slug and label for the branded fallback cover. */
  category?: string;
  categoryLabel?: string;
  /** `sizes` attribute for the responsive source set; defaults to the display width. */
  sizes?: string;
}

/** Story art in a fixed aspect box (no CLS). Missing or broken art falls back to the branded CoverArt. */
export function StoryImage({ src, alt, className, width = 800, priority = false, ratio = 'video', category, categoryLabel, sizes }: StoryImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn('relative overflow-hidden rounded-md bg-ink', RATIOS[ratio], className)}>
        <CoverArt category={category} label={categoryLabel} size={width <= 360 ? 'sm' : width >= 1200 ? 'lg' : 'md'} className="transition-transform duration-slow ease-standard motion-safe:group-hover:scale-[1.03]" />
      </div>
    );
  }
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-mist', RATIOS[ratio], className)}>
      <img
        src={optimizeImage(src, width)}
        srcSet={imageSrcSet(src, width)}
        sizes={imageSrcSet(src, width) ? sizes ?? `(max-width: ${width}px) 100vw, ${width}px` : undefined}
        alt={alt}
        width={width}
        height={Math.round(width * RATIO_VALUES[ratio])}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-standard motion-safe:group-hover:scale-[1.03]"
      />
    </div>
  );
}
