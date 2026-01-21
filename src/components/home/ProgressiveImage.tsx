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

  useEffect(() => {
    setLoaded(false);
    setHasError(!hasSrc);
  }, [hasSrc, src]);

  return (
    <div className={`relative ${className || ''}`}>
      {!showImage && (
        <div
          className={`absolute inset-0 ${fallbackClassName}`}
          style={fallbackGradient ? { backgroundImage: fallbackGradient } : undefined}
          aria-hidden="true"
        />
      )}
      {showImage && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${loaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        />
      )}
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
          className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
