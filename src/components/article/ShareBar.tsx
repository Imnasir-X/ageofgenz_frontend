import { useEffect, useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Article } from '@/lib/api/types';
import { absoluteUrl, cn } from '@/lib/utils';

export function ShareBar({ article, className }: { article: Article; className?: string }) {
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? <Check /> : <Link2 />} <span aria-live="polite">{copied ? 'Copied' : 'Copy link'}</span>
      </Button>
      {canShare && (
        <Button variant="outline" size="sm" onClick={() => navigator.share({ title: article.title, url }).catch(() => undefined)}>
          <Share2 /> Share
        </Button>
      )}
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          {l.label}
        </a>
      ))}
    </div>
  );
}
