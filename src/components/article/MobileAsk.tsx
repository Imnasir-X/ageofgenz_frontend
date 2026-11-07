import { useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AskPanel } from './AskPanel';
import { useI18n } from '@/lib/i18n/useI18n';

/**
 * Phones: a floating "Ask" button in the thumb zone (bottom-right, above the safe area)
 * that opens the Q&A in a bottom sheet. Desktop keeps the panel in the sidebar.
 */
export function MobileAsk({ article, onUnavailable }: { article: Article; onUnavailable?: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform duration-fast ease-standard motion-safe:active:scale-[0.97] lg:hidden"
          aria-label={t('ask.title')}
        >
          <MessagesSquare className="size-4" aria-hidden="true" /> {t('ask.fab')}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        <SheetTitle className="sr-only">{t('ask.title')}</SheetTitle>
        <SheetDescription className="sr-only">{t('ask.sheetDesc')}</SheetDescription>
        <AskPanel article={article} available onUnavailable={onUnavailable} className="rounded-none bg-transparent p-5 pt-6" />
      </SheetContent>
    </Sheet>
  );
}
