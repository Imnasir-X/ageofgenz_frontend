/**
 * Anonymous reading heartbeat for the article page: measures visible, active reading time and
 * the deepest scroll point, and sends small increments to POST /api/core/engagement/.
 *
 * - Counts time only while the tab is visible and the reader was active in the last 30 s.
 * - Beats every 15 s of reading and once more when the tab is hidden (sendBeacon, text/plain,
 *   so no CORS preflight and it survives page unload).
 * - Identifiers: a random page-view id per article view and the anonymous visitor id kept in
 *   localStorage (agz_vid). The server only uses them to de-duplicate; nothing personal is sent.
 */
import { useEffect } from 'react';
import { buildUrl } from '@/lib/api/client';

const BEAT_MS = 15000;
const IDLE_MS = 30000;
const ENDPOINT = '/api/core/engagement/';

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '')
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

export function visitorId(): string {
  try {
    let id = window.localStorage.getItem('agz_vid');
    if (!id) {
      id = randomId();
      window.localStorage.setItem('agz_vid', id);
    }
    return id;
  } catch {
    return '';
  }
}

function scrollDepth(): number {
  const doc = document.documentElement;
  const body = document.getElementById('article-body') ?? document.querySelector('article') ?? doc;
  const rect = body.getBoundingClientRect();
  const total = rect.height || doc.scrollHeight;
  if (total <= 0) return 0;
  const seen = window.innerHeight - rect.top;
  return Math.max(0, Math.min(100, Math.round((seen / total) * 100)));
}

function send(body: Record<string, unknown>) {
  const url = buildUrl(ENDPOINT);
  const payload = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.(url, payload)) return;
  } catch {
    /* fall through to fetch */
  }
  fetch(url, { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => undefined);
}

export function useReadingHeartbeat(articleId: number | undefined) {
  useEffect(() => {
    if (!articleId || typeof window === 'undefined' || typeof document === 'undefined') return;
    const pv = randomId();
    const v = visitorId();
    let first = true;
    let pending = 0; // engaged ms not yet sent
    let reported = 0; // deepest scroll % already sent
    let deepest = scrollDepth();
    let lastActive = Date.now();
    let lastTick = Date.now();

    const visible = () => document.visibilityState === 'visible';
    const beat = () => {
      const depth = Math.max(deepest, reported);
      const seconds = Math.min(Math.floor(pending / 1000), 120);
      if (seconds < 1 && depth <= reported) return;
      send({ article: articleId, pv, v, first, ds: seconds, pd: reported, d: depth });
      first = false;
      pending = Math.max(0, pending - seconds * 1000);
      reported = depth;
    };
    const tick = () => {
      const now = Date.now();
      if (visible() && now - lastActive < IDLE_MS) pending += now - lastTick;
      lastTick = now;
      if (pending >= BEAT_MS) beat();
    };
    const onActivity = () => {
      lastActive = Date.now();
      deepest = Math.max(deepest, scrollDepth());
    };
    const onVisibility = () => {
      tick();
      if (!visible()) beat();
      else {
        lastActive = Date.now();
        lastTick = Date.now();
      }
    };

    const timer = window.setInterval(tick, 1000);
    const opts: AddEventListenerOptions = { passive: true };
    const activity = ['scroll', 'pointerdown', 'keydown', 'mousemove', 'touchstart'] as const;
    activity.forEach((evt) => window.addEventListener(evt, onActivity, opts));
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onVisibility);

    return () => {
      tick();
      beat();
      window.clearInterval(timer);
      activity.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onVisibility);
    };
  }, [articleId]);
}
