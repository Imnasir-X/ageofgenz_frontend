import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { clearAnalyticsCookies, useCookieConsent } from '@/lib/cookieConsent';

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const ENV_GA_ID = import.meta.env.VITE_GA_ID;

/** Consent Mode v2 defaults: everything denied until the reader accepts. */
export const CONSENT_DEFAULTS = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const;

function ensureGtag(): Gtag {
  if (window.gtag) return window.gtag;
  const dataLayer: unknown[] = (window.dataLayer = window.dataLayer || []);
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', CONSENT_DEFAULTS);
  return window.gtag;
}

/**
 * Google Analytics 4, loaded only when VITE_GA_ID is set AND the reader accepted analytics
 * cookies in the cookie banner. Before that no gtag.js is requested and no cookie is set.
 * One page_view per client navigation.
 */
export function Analytics({ gaId = ENV_GA_ID }: { gaId?: string }) {
  const { pathname, search } = useLocation();
  const consent = useCookieConsent();
  const loaded = useRef(false);

  useEffect(() => {
    if (!gaId) return;
    if (consent !== 'granted') {
      window[`ga-disable-${gaId}`] = true;
      if (loaded.current && window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      if (consent === 'denied') clearAnalyticsCookies();
      return;
    }
    window[`ga-disable-${gaId}`] = false;
    const gtag = ensureGtag();
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (!loaded.current) {
      loaded.current = true;
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(script);
      gtag('js', new Date());
      gtag('config', gaId, { send_page_view: false, anonymize_ip: true });
    }
  }, [gaId, consent]);

  useEffect(() => {
    if (!gaId || consent !== 'granted' || !window.gtag) return;
    window.gtag('event', 'page_view', { page_path: pathname + search, page_location: window.location.href, page_title: document.title });
  }, [gaId, consent, pathname, search]);

  return null;
}
