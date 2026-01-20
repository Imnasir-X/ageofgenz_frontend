import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, PointerEvent, SetStateAction } from 'react';

const HERO_SWIPE_THRESHOLD = 48;

type HeroPointerEvent = PointerEvent<HTMLDivElement>;

type HeroPointerHandlers = {
  onPointerDown: (event: HeroPointerEvent) => void;
  onPointerMove: (event: HeroPointerEvent) => void;
  onPointerUp: (event: HeroPointerEvent) => void;
  onPointerCancel: (event: HeroPointerEvent) => void;
  onPointerLeave: (event: HeroPointerEvent) => void;
};

type UseHeroCarouselResult = {
  heroIndex: number;
  heroPlaying: boolean;
  setHeroPlaying: Dispatch<SetStateAction<boolean>>;
  goToHeroSlide: (index: number) => void;
  goToNextHero: () => void;
  goToPrevHero: () => void;
  pointerHandlers: HeroPointerHandlers;
};

export function useHeroCarousel(itemsLength: number, intervalMs: number): UseHeroCarouselResult {
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPlaying, setHeroPlaying] = useState(true);
  const heroTimerRef = useRef<number | null>(null);
  const heroSwipePointerRef = useRef<number | null>(null);
  const heroSwipeStartXRef = useRef<number | null>(null);
  const heroSwipeLastXRef = useRef<number | null>(null);

  useEffect(() => {
    if (heroTimerRef.current) {
      window.clearInterval(heroTimerRef.current);
      heroTimerRef.current = null;
    }

    if (itemsLength <= 1 || !heroPlaying) {
      return () => {
        if (heroTimerRef.current) {
          window.clearInterval(heroTimerRef.current);
          heroTimerRef.current = null;
        }
      };
    }

    heroTimerRef.current = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % itemsLength);
    }, intervalMs);

    return () => {
      if (heroTimerRef.current) {
        window.clearInterval(heroTimerRef.current);
        heroTimerRef.current = null;
      }
    };
  }, [itemsLength, heroPlaying, heroIndex, intervalMs]);

  const goToHeroSlide = useCallback((index: number) => {
    if (itemsLength === 0) return;
    const safeIndex = ((index % itemsLength) + itemsLength) % itemsLength;
    setHeroIndex(safeIndex);
  }, [itemsLength]);

  const goToNextHero = useCallback(() => {
    if (itemsLength === 0) return;
    setHeroIndex((i) => (i + 1) % itemsLength);
  }, [itemsLength]);

  const goToPrevHero = useCallback(() => {
    if (itemsLength === 0) return;
    setHeroIndex((i) => (i - 1 + itemsLength) % itemsLength);
  }, [itemsLength]);

  const handleHeroPointerDown = useCallback((event: HeroPointerEvent) => {
    if (itemsLength <= 1) return;
    heroSwipePointerRef.current = event.pointerId;
    heroSwipeStartXRef.current = event.clientX;
    heroSwipeLastXRef.current = event.clientX;
  }, [itemsLength]);

  const handleHeroPointerMove = useCallback((event: HeroPointerEvent) => {
    if (heroSwipePointerRef.current !== event.pointerId || heroSwipeStartXRef.current === null) return;
    heroSwipeLastXRef.current = event.clientX;
  }, []);

  const resetHeroSwipeTracking = useCallback(() => {
    heroSwipePointerRef.current = null;
    heroSwipeStartXRef.current = null;
    heroSwipeLastXRef.current = null;
  }, []);

  const handleHeroPointerEnd = useCallback((event: HeroPointerEvent) => {
    if (heroSwipePointerRef.current !== event.pointerId || heroSwipeStartXRef.current === null) {
      return;
    }
    const endX = heroSwipeLastXRef.current ?? event.clientX;
    const deltaX = endX - heroSwipeStartXRef.current;
    resetHeroSwipeTracking();
    if (Math.abs(deltaX) < HERO_SWIPE_THRESHOLD) return;
    if (deltaX < 0) {
      goToNextHero();
    } else {
      goToPrevHero();
    }
  }, [goToNextHero, goToPrevHero, resetHeroSwipeTracking]);

  const handleHeroPointerCancel = useCallback((event: HeroPointerEvent) => {
    if (heroSwipePointerRef.current !== event.pointerId) return;
    resetHeroSwipeTracking();
  }, [resetHeroSwipeTracking]);

  return {
    heroIndex,
    heroPlaying,
    setHeroPlaying,
    goToHeroSlide,
    goToNextHero,
    goToPrevHero,
    pointerHandlers: {
      onPointerDown: handleHeroPointerDown,
      onPointerMove: handleHeroPointerMove,
      onPointerUp: handleHeroPointerEnd,
      onPointerCancel: handleHeroPointerCancel,
      onPointerLeave: handleHeroPointerCancel,
    },
  };
}

export default useHeroCarousel;
