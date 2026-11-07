import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PLACEHOLDER_IMAGE, optimizeImage } from '@/lib/image';

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
}

export function StoryImage({ src, alt, className, width = 800, priority = false, ratio = 'video' }: StoryImageProps) {
  const [failed, setFailed] = useState(false);
  const url = !src || failed ? PLACEHOLDER_IMAGE : optimizeImage(src, width);
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-mist', RATIOS[ratio], className)}>
      <img
        src={url}
        alt={!src || failed ? '' : alt}
        width={width}
        height={Math.round((width * 9) / 16)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </div>
  );
}
