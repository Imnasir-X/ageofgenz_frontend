import React, { useEffect, useRef, useState } from 'react';

const revealedKeys = new Set<string>();

type FadeRevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
  revealKey?: string;
};

const FadeReveal: React.FC<FadeRevealProps> = ({
  children,
  delay = 0,
  className,
  once = true,
  revealKey,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [delayActive, setDelayActive] = useState(false);
  const hasRevealedRef = useRef(false);
  const lastRevealKeyRef = useRef<string | undefined>(revealKey);

  useEffect(() => {
    if (lastRevealKeyRef.current !== revealKey) {
      hasRevealedRef.current = false;
      if (once) {
        setIsVisible(false);
      }
      lastRevealKeyRef.current = revealKey;
    }
  }, [once, revealKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(media.matches);
    handleChange();
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (once && revealKey && revealedKeys.has(revealKey)) {
      hasRevealedRef.current = true;
      setIsVisible(true);
      return;
    }

    if (prefersReducedMotion) {
      hasRevealedRef.current = true;
      setIsVisible(true);
      if (revealKey) {
        revealedKeys.add(revealKey);
      }
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      hasRevealedRef.current = true;
      setIsVisible(true);
      if (revealKey) {
        revealedKeys.add(revealKey);
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasRevealedRef.current = true;
          if (once && revealKey) {
            revealedKeys.add(revealKey);
          }
          if (delay > 0) {
            setDelayActive(true);
          }
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -15%' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, once, prefersReducedMotion, revealKey]);

  useEffect(() => {
    if (!delayActive) return;
    const timeout = window.setTimeout(() => setDelayActive(false), Math.max(0, delay));
    return () => window.clearTimeout(timeout);
  }, [delay, delayActive]);

  const baseClasses = prefersReducedMotion ? '' : 'transition-all duration-500 ease-out will-change-transform';
  const visibilityClasses = prefersReducedMotion
    ? 'opacity-100'
    : isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-2';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${visibilityClasses} ${className || ''}`}
      style={delayActive && !prefersReducedMotion ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export default FadeReveal;
