import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, Check, Clock, Info, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { useStudio } from '../context';
import { CheckFlags, EmptyState, ErrorState, KpiCard, NotEnoughData, PageHeader, Panel, RowsSkeleton, StatusBadge } from '../components/common';
import { ScheduleDialog } from '../components/ScheduleDialog';
import { fmtDateTime, fmtHourRange, fmtNumber } from '../lib/format';
import type { Insight, StudioArticle } from '../types';

const WEEK = { days: 7 };
const KPI_KEYS = ['page_views', 'readers', 'new_subscribers', 'donations_total', 'ai_cost_usd'] as const;

const DIRECTION_ICON = { up: ArrowUpRight, down: ArrowDownRight, warn: AlertTriangle, info: Info } as const;
const DIRECTION_STYLE = {
  up: 'text-emerald-700 dark:text-emerald-400',
  down: 'text-destructive',
  warn: 'text-amber-700 dark:text-amber-300',
  info: 'text-muted-foreground',
} as const;

function BriefLine({ item }: { item: Insight }) {
  const Icon = DIRECTION_ICON[item.direction] ?? Info;
  return (
    <li className="flex gap-3 py-2.5">
      <Icon className={cn('mt-0.5 size-4 shrink-0', DIRECTION_STYLE[item.direction])} aria-hidden="true" />
      <p className="font-serif text-[1.05rem] leading-snug">{item.text}</p>
    </li>
  );
}

function QueueRow({ article, onChanged }: { article: StudioArticle; onChanged: () => void }) {
  const [scheduling, setScheduling] = useState(false);
  const [approving, setApproving] = useState(false);
  const approve = async () => {
    setApproving(true);
    try {
      await studioApi.approve(article.id);
      toast('Approved', { description: 'Recorded your approval. It is not published yet.' });
      onChanged();
    } catch (err) {
      toast('Could not approve', { tone: 'error', description: errorText(err) });
    } finally {
      setApproving(false);
    }
  };
  return (
    <li className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={article.status} />
          {article.human_approved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"><Check className="size-3.5" /> Approved</span>
          )}
          {article.scheduled_for && (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground"><Clock className="size-3.5" /> {fmtDateTime(article.scheduled_for)}</span>
          )}
          {article.category_name && <span className="text-xs text-muted-foreground">{article.category_name}</span>}
        </div>
        <Link to={`/studio/articles/${article.id}`} className="block font-serif text-lg leading-snug hover:text-primary">
          {article.title}
        </Link>
        <CheckFlags flags={article.check_flags} compact />
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" onClick={approve} loading={approving} disabled={article.human_approved}>
          {!approving && <Check />} Approve
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/studio/articles/${article.id}`}><Pencil /> Edit</Link>
        </Button>
        <Button size="sm" variant="outline" onClick={() => setScheduling(true)}>
          <CalendarClock /> Schedule
        </Button>
      </div>
      <ScheduleDialog
        open={scheduling}
        onOpenChange={setScheduling}
        initial={article.scheduled_for}
        title={article.title}
        onSchedule={async (iso) => {
          await studioApi.schedule(article.id, iso);
          toast(iso ? `Scheduled for ${fmtDateTime(iso)}` : 'Marked ready');
          onChanged();
        }}
      />
    </li>
  );
}

export default function Today() {
  const { me } = useStudio();
  const overview = useApi(() => studioApi.overview(WEEK), []);
  const insights = useApi(() => studioApi.insights(WEEK), []);
  const hours = useApi(() => studioApi.publishHours({ days: 30 }), []);
  const queue = useApi(async () => {
    const [ready, scheduled, drafts] = await Promise.all([
      studioApi.articles({ status: 'ready', page_size: 20, ordering: '-updated_at' }),
      studioApi.articles({ status: 'scheduled', page_size: 20, ordering: '-updated_at' }),
      studioApi.articles({ status: 'draft', check_status: 'needs_human', page_size: 10, ordering: '-updated_at' }),
    ]);
    return [...ready.results, ...scheduled.results, ...drafts.results];
  }, []);

  const hello = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', weekday: 'long', day: 'numeric', month: 'long' });
  const first = me.first_name || me.name.split(' ')[0];

  return (
    <div className="space-y-6">
      <PageHeader title={`Today${first ? `, ${first}` : ''}`} description={`${hello}. This week compared with the week before.`} />

      <Panel title="Brief" description="What changed this week, from your own numbers. No guesses.">
        {insights.error ? (
          <ErrorState message={insights.error} onRetry={insights.reload} />
        ) : insights.loading && !insights.data ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-5 w-full max-w-2xl" />)}</div>
        ) : insights.data?.insights.length ? (
          <ul className="-my-2.5 divide-y">{insights.data.insights.slice(0, 5).map((item, i) => <BriefLine key={`${item.kind}-${i}`} item={item} />)}</ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nothing notable yet this week.</p>
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {KPI_KEYS.map((key, i) => (
          <div key={key} className={cn(i === 4 && 'col-span-2 md:col-span-1')}>
            <KpiCard kpi={overview.data?.kpis[key]} loading={overview.loading && !overview.data} hint={overview.data?.definitions?.[key]} />
          </div>
        ))}
      </div>
      {overview.error && <ErrorState message={overview.error} onRetry={overview.reload} />}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Panel
          title="Approval queue"
          description="Ready and scheduled drafts, plus drafts the checks flagged for a human."
          actions={<Button variant="ghost" size="sm" asChild><Link to="/studio/articles?status=ready">All drafts</Link></Button>}
        >
          {queue.error ? (
            <ErrorState message={queue.error} onRetry={queue.reload} />
          ) : queue.loading && !queue.data ? (
            <RowsSkeleton rows={3} />
          ) : queue.data?.length ? (
            <ul className="-my-3.5 divide-y">{queue.data.map((a) => <QueueRow key={a.id} article={a} onChanged={queue.reload} />)}</ul>
          ) : (
            <EmptyState icon={Check} title="Queue is clear">Nothing is waiting for your approval.</EmptyState>
          )}
        </Panel>

        <Panel title="When readers read" description="Last 30 days, Asia/Dhaka time">
          {hours.loading && !hours.data ? (
            <Skeleton className="h-16" />
          ) : hours.data?.reading.status === 'ok' && hours.data.reading.peak_hour !== undefined ? (
            <div className="space-y-2">
              <p className="font-mono text-2xl tabular-nums">{fmtHourRange(hours.data.reading.peak_hour)}</p>
              <p className="text-sm text-muted-foreground">
                Busiest hour, {fmtNumber(hours.data.reading.peak_share_pct, 1)}% of views.
                {hours.data.publishing.status === 'ok' && hours.data.publishing.best_hour !== undefined && (
                  <> Articles published at {fmtHourRange(hours.data.publishing.best_hour)} earned the most views in their first two days.</>
                )}
              </p>
              <Button variant="link" size="sm" asChild><Link to="/studio/analytics">See the hours</Link></Button>
            </div>
          ) : (
            <NotEnoughData needed={hours.data?.reading.needed} sample={hours.data?.reading.sample} />
          )}
        </Panel>
      </div>
    </div>
  );
}
