import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Analytics, CONSENT_DEFAULTS } from '@/components/layout/Analytics';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { CONSENT_STORAGE_KEY, openCookieSettings } from '@/lib/cookieConsent';

const GA = 'G-TEST123';

const gaScripts = () => Array.from(document.querySelectorAll('script')).filter((s) => s.src.includes('googletagmanager.com'));

function Site({ gaId = GA }: { gaId?: string }) {
  return (
    <MemoryRouter>
      <Analytics gaId={gaId} />
      <CookieBanner gaId={gaId} />
    </MemoryRouter>
  );
}

function reset() {
  window.localStorage.clear();
  gaScripts().forEach((s) => s.remove());
  delete window.gtag;
  delete window.dataLayer;
}

beforeEach(reset);
afterEach(reset);

describe('Google Analytics cookie consent', () => {
  it('loads nothing and shows the banner until the reader chooses', () => {
    render(<Site />);
    expect(screen.getByRole('region', { name: 'Cookies for analytics' })).toBeInTheDocument();
    expect(gaScripts()).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
    expect(window.dataLayer).toBeUndefined();
    expect(window[`ga-disable-${GA}`]).toBe(true);
  });

  it('on Accept stores the choice, sets Consent Mode defaults to denied first, then grants analytics and loads gtag.js', () => {
    render(<Site />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted');
    expect(gaScripts()).toHaveLength(1);
    const commands = (window.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>));
    expect(commands[0]).toEqual(['consent', 'default', CONSENT_DEFAULTS]);
    expect(Object.values(CONSENT_DEFAULTS).every((v) => v === 'denied')).toBe(true);
    expect(commands[1]).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
    expect(commands.some((c) => c[0] === 'config' && c[1] === GA)).toBe(true);
    expect(screen.queryByRole('region', { name: 'Cookies for analytics' })).not.toBeInTheDocument();
  });

  it('on Decline stores the choice and never loads Google Analytics', () => {
    render(<Site />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied');
    expect(gaScripts()).toHaveLength(0);
    expect(window.gtag).toBeUndefined();
    expect(screen.queryByRole('region', { name: 'Cookies for analytics' })).not.toBeInTheDocument();
  });

  it('remembers an earlier choice and can be reopened from the footer link', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
    render(<Site />);
    expect(screen.queryByRole('region', { name: 'Cookies for analytics' })).not.toBeInTheDocument();
    act(() => openCookieSettings());
    expect(screen.getByRole('region', { name: 'Cookies for analytics' })).toBeInTheDocument();
  });

  it('loads straight away for a reader who accepted before', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
    render(<Site />);
    expect(gaScripts()).toHaveLength(1);
    expect(screen.queryByRole('region', { name: 'Cookies for analytics' })).not.toBeInTheDocument();
  });

  it('shows no banner when analytics is not configured', () => {
    render(<Site gaId="" />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(gaScripts()).toHaveLength(0);
  });
});
