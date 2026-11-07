import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, CircleDashed, CircleCheck, CircleX, Info, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ArticleStatus, CheckFlag, FlagState, Kpi } from '../types';
import { fmtNumber, fmtSigned, fmtUsd } from '../lib/format';

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="font-display text-2xl font-medium sm:text-[1.75rem]">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName }: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('rounded-lg border bg-card text-card-foreground', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="font-sans text-sm font-semibold tracking-normal">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

export function KpiCard({ kpi, loading, hint }: { kpi?: Kpi; loading?: boolean; hint?: string }) {
  if (loading || !kpi) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-7 w-20" />
        <Skeleton className="mt-2 h-3 w-28" />
      </div>
    );
  }
  const pct = kpi.change_pct;
  const up = (pct ?? 0) > 0;
  const down = (pct ?? 0) < 0;
  // AI cost going up is not good news: colour by meaning, not by sign.
  const costLike = kpi.label.toLowerCase().includes('cost');
  const good = costLike ? down : up;
  const bad = costLike ? up : down;
  const Arrow = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  const value = kpi.unit === 'usd' ? fmtUsd(kpi.value) : fmtNumber(kpi.value);
  return (
    <div className="rounded-lg border bg-card p-4 transition-shadow duration-base ease-standard hover:shadow-sm">
      <p className="truncate text-xs font-medium text-muted-foreground" title={hint}>{kpi.label}</p>
      <p className="mt-2 font-mono text-2xl font-medium tabular-nums tracking-tight">{value}</p>
      <p
        className={cn(
          'mt-1 inline-flex items-center gap-1 font-mono text-xs tabular-nums',
          good && 'text-emerald-700 dark:text-emerald-400',
          bad && 'text-destructive',
          !good && !bad && 'text-muted-foreground',
        )}
      >
        <Arrow className="size-3.5" aria-hidden="true" />
        {pct === null ? 'no prior data' : `${fmtSigned(pct)} vs prior`}
      </p>
    </div>
  );
}

const STATUS_STYLE: Record<ArticleStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  ready: 'bg-mist text-secondary-foreground',
  scheduled: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200',
  published: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200',
  archived: 'border border-border text-muted-foreground',
};

export function StatusBadge({ status }: { status: ArticleStatus | string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.06em]', STATUS_STYLE[status as ArticleStatus] ?? STATUS_STYLE.draft)}>
      {status}
    </span>
  );
}

const FLAG_ICON: Record<FlagState, typeof CircleCheck> = { ok: CircleCheck, warn: AlertTriangle, fail: CircleX, pending: CircleDashed };
const FLAG_STYLE: Record<FlagState, string> = {
  ok: 'text-emerald-700 dark:text-emerald-400',
  warn: 'text-amber-700 dark:text-amber-300',
  fail: 'text-destructive',
  pending: 'text-muted-foreground',
};
const FLAG_LABEL = { fact: 'Fact', risk: 'Risk', seo: 'SEO', duplicate: 'Duplicate' } as const;

export function CheckFlags({ flags, compact = false }: { flags?: Record<keyof typeof FLAG_LABEL, CheckFlag>; compact?: boolean }) {
  if (!flags) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Checks">
      {(Object.keys(FLAG_LABEL) as (keyof typeof FLAG_LABEL)[]).map((key) => {
        const flag = flags[key];
        if (!flag) return null;
        const Icon = FLAG_ICON[flag.state];
        return (
          <li key={key} className={cn('inline-flex items-center gap-1 text-xs', FLAG_STYLE[flag.state])} title={flag.note}>
            <Icon className="size-3.5" aria-hidden="true" />
            <span className="font-medium">{FLAG_LABEL[key]}</span>
            {!compact && <span className="text-muted-foreground">{flag.note}</span>}
            <span className="sr-only">{flag.state}: {flag.note}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function NotEnoughData({ needed, sample, className }: { needed?: string; sample?: Record<string, number>; className?: string }) {
  const sampleText = sample ? Object.entries(sample).map(([k, v]) => `${fmtNumber(v)} ${k.replace(/_/g, ' ')}`).join(', ') : '';
  return (
    <div className={cn('flex gap-3 rounded-md border border-dashed bg-muted/40 p-4 text-sm', className)}>
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">Not enough data yet</p>
        <p className="text-muted-foreground">
          {sampleText && <>So far: {sampleText}. </>}
          {needed && <>Needs {needed}.</>} No estimate is shown until then.
        </p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-destructive">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({ icon: Icon = CircleDashed, title, children }: { icon?: typeof Info; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      {children && <div className="max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function Field({ label, hint, children, counter }: { label: string; hint?: ReactNode; children: (id: string) => ReactNode; counter?: string }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {counter && <span className="font-mono text-xs tabular-nums text-muted-foreground">{counter}</span>}
      </div>
      {children(id)}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function NativeSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Switch({ checked, onCheckedChange, label, disabled }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-fast ease-standard disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-input',
      )}
    >
      <span className={cn('inline-block size-5 rounded-full bg-card shadow transition-transform duration-fast ease-standard', checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5')} />
    </button>
  );
}

export function Tabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-muted p-1">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          type="button"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors duration-fast ease-standard sm:h-8',
            value === item.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
          {item.count !== undefined && <span className="font-mono text-xs tabular-nums text-muted-foreground">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pager({ page, count, pageSize, onPage }: { page: number; count: number; pageSize: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-2 pt-3 text-sm" aria-label="Pagination">
      <span className="font-mono text-xs tabular-nums text-muted-foreground">Page {page} of {pages} · {fmtNumber(count)} total</span>
      <div className="flex gap-1">
        <Button variant="outline" size="icon-sm" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft /></Button>
        <Button variant="outline" size="icon-sm" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page"><ChevronRight /></Button>
      </div>
    </nav>
  );
}

/** Table shell: horizontal scroll on small screens, sticky header row. */
export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('-mx-4 overflow-x-auto sm:mx-0', className)}>
      <table className="w-full min-w-[40rem] border-collapse text-sm [&_td]:border-b [&_td]:px-3 [&_td]:py-2.5 [&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground [&_tr:last-child_td]:border-0 [&_tbody_tr]:transition-colors [&_tbody_tr]:duration-fast [&_tbody_tr:hover]:bg-muted/50">
        {children}
      </table>
    </div>
  );
}
