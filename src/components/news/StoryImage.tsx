import { useState } from 'react';
import { cn } from '@/lib/utils';
import { optimizeImage } from '@/lib/image';
import { CoverArt } from './CoverArt';

const RATIOS = {
  video: 'aspect-[16/9]',
  wide: 'aspect-[3/2]',
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
};

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
}

/** Story art in a fixed aspect box (no CLS). Missing or broken art falls back to the branded CoverArt. */
export function StoryImage({ src, alt, className, width = 800, priority = false, ratio = 'video', category, categoryLabel }: StoryImageProps) {
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
        alt={alt}
        width={width}
        height={Math.round((width * 9) / 16)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-standard motion-safe:group-hover:scale-[1.03]"
      />
    </div>
  );
}
