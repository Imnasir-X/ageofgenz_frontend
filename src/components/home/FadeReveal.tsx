import React, { useEffect, useRef, useState } from 'react';

type FadeRevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

const FadeReveal: React.FC<FadeRevealProps> = ({ children, delay = 0, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10%' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const baseClasses = 'transition-all duration-700 ease-out will-change-transform';
  const visibilityClasses = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${visibilityClasses} ${className || ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeReveal;
