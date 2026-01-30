import React, { useEffect, useState } from 'react';

type ProgressiveImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
  fallbackGradient?: string;
  fallbackClassName?: string;
};

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className,
  eager = false,
  fallbackGradient,
  fallbackClassName = 'bg-slate-900',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasSrc = Boolean(src);
  const showImage = hasSrc && !hasError;
  const showSkeleton = hasSrc && !loaded;
  const fallbackClasses = fallbackGradient ? 'absolute inset-0' : `absolute inset-0 ${fallbackClassName}`;
  const transitionClasses = 'transition-opacity duration-500 ease-out';

  useEffect(() => {
    setLoaded(false);
    setHasError(!hasSrc);
  }, [hasSrc, src]);

  return (
    <div className={`relative ${className || ''}`}>
      <div
        className={`${fallbackClasses} ${transitionClasses} ${showImage ? 'opacity-0' : 'opacity-100'}`}
        style={fallbackGradient ? { backgroundImage: fallbackGradient } : undefined}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 bg-gray-200 animate-pulse ${transitionClasses} ${
          showSkeleton ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
      {showImage && (
        <img
          src={src ?? ''}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? ('high' as any) : ('auto' as any)}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setHasError(true);
            setLoaded(true);
          }}
          className={`w-full h-full object-cover ${transitionClasses} ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
