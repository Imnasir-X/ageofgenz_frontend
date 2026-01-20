import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';

const DEFAULT_INTERVAL_MS = 6000;

type BreakingKeyEvent = KeyboardEvent<HTMLDivElement>;

type UseBreakingTickerResult = {
  breakingIndex: number;
  breakingPlaying: boolean;
  setBreakingPlaying: Dispatch<SetStateAction<boolean>>;
  breakingVisible: boolean;
  goToBreakingSlide: (index: number) => void;
  goToNextBreaking: () => void;
  goToPrevBreaking: () => void;
  handleBreakingKeyDown: (event: BreakingKeyEvent) => void;
};

export function useBreakingTicker(itemsLength: number, intervalMs = DEFAULT_INTERVAL_MS): UseBreakingTickerResult {
  const [breakingIndex, setBreakingIndex] = useState(0);
  const [breakingPlaying, setBreakingPlaying] = useState(true);
  const [breakingVisible, setBreakingVisible] = useState(true);
  const breakingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (breakingTimerRef.current) {
      window.clearInterval(breakingTimerRef.current);
      breakingTimerRef.current = null;
    }

    if (itemsLength <= 1 || !breakingPlaying) {
      return () => {
        if (breakingTimerRef.current) {
          window.clearInterval(breakingTimerRef.current);
          breakingTimerRef.current = null;
        }
      };
    }

    breakingTimerRef.current = window.setInterval(() => {
      setBreakingIndex((i) => (i + 1) % itemsLength);
    }, intervalMs);

    return () => {
      if (breakingTimerRef.current) {
        window.clearInterval(breakingTimerRef.current);
        breakingTimerRef.current = null;
      }
    };
  }, [itemsLength, breakingPlaying, intervalMs]);

  useEffect(() => {
    setBreakingVisible(false);
    const id = window.setTimeout(() => setBreakingVisible(true), 40);
    return () => window.clearTimeout(id);
  }, [breakingIndex]);

  const goToBreakingSlide = useCallback((index: number) => {
    const total = itemsLength;
    if (total === 0) return;
    const normalized = ((index % total) + total) % total;
    setBreakingIndex(normalized);
  }, [itemsLength]);

  const goToNextBreaking = useCallback(() => {
    if (itemsLength === 0) return;
    setBreakingIndex((i) => (i + 1) % itemsLength);
  }, [itemsLength]);

  const goToPrevBreaking = useCallback(() => {
    if (itemsLength === 0) return;
    setBreakingIndex((i) => (i - 1 + itemsLength) % itemsLength);
  }, [itemsLength]);

  const handleBreakingKeyDown = useCallback((event: BreakingKeyEvent) => {
    if (itemsLength <= 1) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setBreakingPlaying(false);
      goToNextBreaking();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setBreakingPlaying(false);
      goToPrevBreaking();
    }
  }, [itemsLength, goToNextBreaking, goToPrevBreaking]);

  return {
    breakingIndex,
    breakingPlaying,
    setBreakingPlaying,
    breakingVisible,
    goToBreakingSlide,
    goToNextBreaking,
    goToPrevBreaking,
    handleBreakingKeyDown,
  };
}

export default useBreakingTicker;
