import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReadingHeartbeat } from '@/lib/readingHeartbeat';

describe('reading heartbeat', () => {
  let beacon: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.useFakeTimers();
    beacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });
  afterEach(() => vi.useRealTimers());

  it('sends a first beat after 15s of active reading and a final one on hide', () => {
    const { unmount } = renderHook(() => useReadingHeartbeat(42));
    for (let i = 0; i < 16; i += 1) {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1000);
    }
    expect(beacon).toHaveBeenCalled();
    const [url, payload] = beacon.mock.calls[0];
    expect(String(url)).toContain('/api/core/engagement/');
    const body = JSON.parse(payload as string);
    expect(body).toMatchObject({ article: 42, first: true });
    expect(body.ds).toBeGreaterThanOrEqual(15);
    expect(body.pv).toMatch(/^[A-Za-z0-9]{8,64}$/);

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(1000);
    document.dispatchEvent(new Event('visibilitychange'));
    const calls = beacon.mock.calls.length;
    vi.advanceTimersByTime(20000); // hidden: no time counted, no more beats
    expect(beacon.mock.calls.length).toBe(calls);
    expect(JSON.parse(beacon.mock.calls[calls - 1][1] as string).first).toBe(false);
    unmount();
  });

  it('does nothing without an article id', () => {
    renderHook(() => useReadingHeartbeat(undefined));
    vi.advanceTimersByTime(30000);
    expect(beacon).not.toHaveBeenCalled();
  });
});
