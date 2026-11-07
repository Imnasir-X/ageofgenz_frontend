import { useEffect, useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Article } from '@/lib/api/types';
import { absoluteUrl, cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

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
      toast('Link copied', { description: 'Paste it anywhere to share this story.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Couldn’t copy the link', { tone: 'error', description: 'Your browser blocked clipboard access. Copy it from the address bar.' });
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />} <span>{copied ? 'Copied' : 'Copy link'}</span>
      </Button>
      {canShare && (
        <Button variant="outline" size="sm" onClick={() => navigator.share({ title: article.title, url }).catch(() => undefined)}>
          <Share2 /> Share
        </Button>
      )}
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.label} (opens in a new tab)`}
          className="inline-flex min-h-11 items-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground sm:min-h-8"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
