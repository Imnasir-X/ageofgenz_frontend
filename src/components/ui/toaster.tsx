import { useSyncExternalStore } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { dismissToast, toastStore } from '@/lib/toast';
import { cn } from '@/lib/utils';

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

/** Bottom-centre on phones (thumb zone, clear of content), bottom-right on desktop. Polite live region. */
export function Toaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.get, toastStore.getServer);
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg"
          >
            <Icon className={cn('mt-0.5 size-4 shrink-0', t.tone === 'error' ? 'text-destructive' : 'text-primary')} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="-m-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
