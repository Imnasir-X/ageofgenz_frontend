import React from 'react';
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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] px-3 sm:px-4">
      <div
        className={`pointer-events-auto relative mx-auto max-w-4xl rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-2xl backdrop-blur transition-all duration-500 ease-out ${
          newsletterBannerVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
        role="region"
        aria-label="Newsletter signup"
      >
        <button
          type="button"
          aria-label="Dismiss newsletter prompt"
          className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:text-gray-800"
          onClick={onDismiss}
        >
          <X size={18} aria-hidden="true" />
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Newsletter</p>
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Stay a step ahead of the headlines</h3>
            <p className="mt-1 text-sm text-gray-700">
              Get the latest stories, breaking alerts, and weekend reads delivered straight to your inbox.
            </p>
          </div>
          <div className="w-full sm:w-auto [&>div]:border-none [&>div]:bg-transparent [&>div]:p-0 [&>div]:shadow-none">
            <Newsletter
              variant="compact"
              onSubscribed={onSubscribed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPrompt;
