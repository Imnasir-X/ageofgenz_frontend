/**
 * Minimal toast store (no dependency). Toasts confirm an action the reader just took;
 * they never carry urgency, countdowns or upsells.
 */
export type ToastTone = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

type Listener = () => void;
let toasts: Toast[] = [];
/** Stable empty snapshot for SSR/hydration (useSyncExternalStore requires a cached value). */
const SERVER_SNAPSHOT: Toast[] = [];
let seq = 0;
const listeners = new Set<Listener>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();
const emit = () => listeners.forEach((l) => l());

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
  emit();
}

export function toast(title: string, opts: { description?: string; tone?: ToastTone; durationMs?: number } = {}) {
  const id = ++seq;
  toasts = [...toasts.slice(-2), { id, title, description: opts.description, tone: opts.tone ?? 'success' }];
  emit();
  if (typeof window !== 'undefined') timers.set(id, setTimeout(() => dismissToast(id), opts.durationMs ?? 4000));
  return id;
}

export const toastStore = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => toasts,
  getServer: (): Toast[] => SERVER_SNAPSHOT,
};
