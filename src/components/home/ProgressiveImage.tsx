import React, { useState } from 'react';

type ProgressiveImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
};

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ src, alt, className, eager = false }) => {
  const [loaded, setLoaded] = useState(false);
  const imgSrc = src || '/api/placeholder/1200/675';

  return (
    <div className={`relative ${className || ''}`}>
      <div
        className={`absolute inset-0 bg-gray-200 animate-pulse ${loaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      />
      <img
        src={imgSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? ('high' as any) : ('auto' as any)}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/api/placeholder/1200/675';
          setLoaded(true);
        }}
        className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />
    </div>
  );
};

export default ProgressiveImage;
