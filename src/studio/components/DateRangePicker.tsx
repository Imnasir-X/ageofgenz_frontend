import { useState } from 'react';
import { CalendarRange, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { RangeParams } from '../types';
import { rangeLabel } from '../context';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const PRESETS = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '12 months' },
];

const todayDhaka = () => new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);

/** Preset chips plus a custom start/end range. Dates are Asia/Dhaka days, as the backend counts them. */
export function DateRangePicker({ value, onChange }: { value: RangeParams; onChange: (r: RangeParams) => void }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(value.start ?? '');
  const [end, setEnd] = useState(value.end ?? todayDhaka());
  const valid = start && end && start <= end;

  return (
    <div className="flex items-center gap-1">
      <div className="hidden items-center gap-1 rounded-md bg-muted p-1 md:flex" role="group" aria-label="Date range">
        {PRESETS.slice(1, 4).map((p) => {
          const active = !value.start && value.days === p.days;
          return (
            <button
              key={p.days}
              type="button"
              onClick={() => onChange({ days: p.days })}
              aria-pressed={active}
              className={cn(
                'h-8 rounded px-2.5 text-xs font-medium transition-colors duration-fast ease-standard',
                active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <CalendarRange />
            <span className="max-w-[11rem] truncate">{rangeLabel(value)}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[min(24rem,calc(100vw-1.5rem))]">
          <DialogHeader>
            <DialogTitle>Date range</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRESETS.map((p) => {
              const active = !value.start && value.days === p.days;
              return (
                <Button
                  key={p.days}
                  variant={active ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onChange({ days: p.days });
                    setOpen(false);
                  }}
                >
                  {active && <Check />}
                  {p.label}
                </Button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">From</span>
              <Input type="date" value={start} max={end || undefined} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">To</span>
              <Input type="date" value={end} min={start || undefined} max={todayDhaka()} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Days follow Asia/Dhaka time. Changes are compared with the same number of days just before.</p>
          <DialogFooter>
            <Button
              disabled={!valid}
              onClick={() => {
                onChange({ start, end });
                setOpen(false);
              }}
            >
              Apply range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
