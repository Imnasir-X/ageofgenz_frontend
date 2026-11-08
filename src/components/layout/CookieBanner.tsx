import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { onOpenCookieSettings, setCookieConsent, useCookieConsent } from '@/lib/cookieConsent';
import { useI18n } from '@/lib/i18n/useI18n';

const ENV_GA_ID = import.meta.env.VITE_GA_ID;

/**
 * Asks once whether Google Analytics may set cookies. Shown only when analytics is configured
 * (VITE_GA_ID) and the reader has not chosen yet, or when they reopen it from the footer.
 * Client-only: the prerendered HTML never contains it.
 */
export function CookieBanner({ gaId = ENV_GA_ID }: { gaId?: string }) {
  const { t } = useI18n();
  const consent = useCookieConsent();
  const [mounted, setMounted] = useState(false);
  const [reopened, setReopened] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => onOpenCookieSettings(() => setReopened(true)), []);

  if (!gaId || !mounted || (consent !== null && !reopened)) return null;

  const choose = (value: 'granted' | 'denied') => {
    setCookieConsent(value);
    setReopened(false);
  };

  return (
    <section
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-body"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl animate-in fade-in-0 slide-in-from-bottom-4 rounded-lg border bg-card p-4 text-card-foreground shadow-lg duration-base sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-mist text-primary">
          <Cookie className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="cookie-banner-title" className="font-display text-base font-semibold leading-tight">
            {t('cookies.title')}
          </h2>
          <p id="cookie-banner-body" className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t('cookies.body')}{' '}
            <Link to="/privacy" className="link-underline text-primary">
              {t('cookies.privacy')}
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={() => choose('denied')}>
          <X aria-hidden="true" /> {t('cookies.decline')}
        </Button>
        <Button size="sm" onClick={() => choose('granted')}>
          <Check aria-hidden="true" /> {t('cookies.accept')}
        </Button>
      </div>
    </section>
  );
}
