/**
 * The reader's analytics cookie choice, kept in localStorage.
 *
 * - `null`: not asked yet. Google Analytics is not loaded and sets no cookies.
 * - `'granted'`: the reader accepted; Analytics loads with Consent Mode updated to granted.
 * - `'denied'`: the reader declined; Analytics never loads.
 *
 * Components read it with `useCookieConsent()` and change it with `setCookieConsent()`.
 * `openCookieSettings()` asks the banner to show again (the footer "Cookie settings" link).
 */
import { useSyncExternalStore } from 'react';

export type CookieConsent = 'granted' | 'denied';

export const CONSENT_STORAGE_KEY = 'agz-cookie-consent';
const CHANGE_EVENT = 'agz:cookie-consent';
const OPEN_EVENT = 'agz:cookie-settings';

const canUseWindow = () => typeof window !== 'undefined';

/** Fallback when localStorage is blocked: the choice holds for this page view only. */
let memoryChoice: CookieConsent | null = null;

export function getCookieConsent(): CookieConsent | null {
  if (!canUseWindow()) return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(value: CookieConsent): void {
  if (!canUseWindow()) return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    memoryChoice = value;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function snapshot(): CookieConsent | null {
  return getCookieConsent() ?? memoryChoice;
}

function subscribe(onChange: () => void): () => void {
  if (!canUseWindow()) return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** The current choice; `null` during prerender and until the reader decides. */
export function useCookieConsent(): CookieConsent | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export function openCookieSettings(): void {
  if (canUseWindow()) window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(handler: () => void): () => void {
  if (!canUseWindow()) return () => {};
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

/** Remove Google Analytics cookies (`_ga`, `_ga_<id>`) after a reader withdraws consent. */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat')
    .forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      });
    });
}
