import React, { useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import Newsletter from '../Newsletter';

type NewsletterPromptProps = {
  showNewsletterCard: boolean;
  newsletterBannerVisible: boolean;
  onDismiss: () => void;
  onSubscribed: () => void;
};

const NewsletterPrompt: React.FC<NewsletterPromptProps> = ({
  showNewsletterCard,
  newsletterBannerVisible,
  onDismiss,
  onSubscribed,
}) => {
  if (!showNewsletterCard) return null;

  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const handleDismiss = useCallback(() => {
    if (typeof document !== 'undefined') {
      const active = document.activeElement;
      lastFocusedRef.current = active instanceof HTMLElement ? active : null;
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('newsletterDismissedAt', `${Date.now()}`);
      } catch {
        // ignore storage errors
      }
    }
    onDismiss();
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        lastFocusedRef.current?.focus();
      });
    }
  }, [onDismiss]);

  return (
    <div className="relative mx-auto mt-6 px-3 sm:fixed sm:inset-x-0 sm:bottom-28 sm:z-[60] sm:px-4 sm:pointer-events-none md:bottom-32">
      <div
        className={`pointer-events-auto relative mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 ease-out sm:p-4 ${
          newsletterBannerVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        role="region"
        aria-label="Newsletter signup"
      >
        <span
          className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-orange-400/80"
          aria-hidden="true"
        />
        <button
          type="button"
          aria-label="Dismiss newsletter prompt"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          onClick={handleDismiss}
        >
          <X size={16} aria-hidden="true" />
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Newsletter</p>
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Stay ahead of the headlines</h3>
            <p className="mt-1 text-sm text-gray-700">A weekly roundup. No spam.</p>
          </div>
          <div className="w-full sm:w-auto">
            <Newsletter
              variant="banner"
              onSubscribed={onSubscribed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPrompt;
