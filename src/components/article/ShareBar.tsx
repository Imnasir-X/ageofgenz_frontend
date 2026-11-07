import { useEffect, useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Article } from '@/lib/api/types';
import { absoluteUrl, cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { useI18n } from '@/lib/i18n/useI18n';

export function ShareBar({ article, className }: { article: Article; className?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === 'function'), []);
  const url = absoluteUrl(article.shortLink || article.href);
  const text = encodeURIComponent(article.title);
  const enc = encodeURIComponent(url);
  const links = [
    { label: 'X', href: `https://twitter.com/intent/tweet?text=${text}&url=${enc}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${enc}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast(t('share.copiedToast'), { description: t('share.copiedBody') });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(t('share.copyFail'), { tone: 'error', description: t('share.copyFailBody') });
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: article.title, url });
    } catch (err) {
      // The reader closing the share sheet is not an error; anything else falls back to copying.
      if (err instanceof Error && err.name === 'AbortError') return;
      await copy();
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {/* Phones get the native share sheet as the main action; everywhere else, copy link. */}
      {canShare ? (
        <Button size="sm" onClick={nativeShare}>
          <Share2 aria-hidden="true" /> {t('share.share')}
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />} <span>{copied ? t('share.copied') : t('share.copy')}</span>
        </Button>
      )}
      {canShare && (
        <Button variant="ghost" size="sm" onClick={copy} aria-label={t('share.copy')}>
          {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />} <span className="sr-only sm:not-sr-only">{copied ? t('share.copied') : t('share.copy')}</span>
        </Button>
      )}
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('share.on', { network: l.label })}
          className={cn(
            'min-h-11 items-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground sm:min-h-8',
            // Phones keep one tidy row (Share or Copy link); the network links are for wider screens.
            'hidden sm:inline-flex',
          )}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
