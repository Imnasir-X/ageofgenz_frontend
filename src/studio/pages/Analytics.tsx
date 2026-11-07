import { Skeleton } from '@/components/ui/skeleton';
import { studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { useStudio } from '../context';
import { DataTable, ErrorState, NotEnoughData, PageHeader, Panel } from '../components/common';
import { DateRangePicker } from '../components/DateRangePicker';
import { HourBars, TrendChart } from '../components/charts';
import { fmtHourRange, fmtNumber, fmtPct, fmtSeconds, fmtUsd } from '../lib/format';

const ChartSkeleton = () => <Skeleton className="h-[220px] w-full" />;

export default function Analytics() {
  const { range, setRange } = useStudio();
  const key = JSON.stringify(range);
  const ts = useApi(() => studioApi.timeseries(range), [key]);
  const hours = useApi(() => studioApi.publishHours(range), [key]);
  const engagement = useApi(() => studioApi.engagement(range), [key]);
  const returning = useApi(() => studioApi.returning(range), [key]);
  const s = ts.data?.series;
  const labels = ts.data?.labels ?? [];
  const sum = (xs?: number[]) => (xs ?? []).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Measured from the site's own counters. Days follow Asia/Dhaka time."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />
      {ts.error && <ErrorState message={ts.error} onRetry={ts.reload} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Views and readers" description={s ? `${fmtNumber(sum(s.page_views))} views, readers counted per day` : undefined}>
          {s ? (
            <TrendChart
              labels={labels}
              series={[
                { key: 'views', label: 'Views', values: s.page_views },
                { key: 'readers', label: 'Readers', values: s.readers, color: 'rgb(var(--slate))' },
              ]}
            />
          ) : <ChartSkeleton />}
        </Panel>
        <Panel title="Newsletter" description={s ? `${fmtNumber(sum(s.new_subscribers))} joined, ${fmtNumber(sum(s.unsubscribes))} left` : undefined}>
          {s ? (
            <TrendChart
              labels={labels}
              series={[
                { key: 'subs', label: 'New subscribers', values: s.new_subscribers },
                { key: 'unsubs', label: 'Unsubscribes', values: s.unsubscribes, color: 'rgb(var(--destructive))' },
              ]}
            />
          ) : <ChartSkeleton />}
        </Panel>
        <Panel title="Donations" description={s ? `${fmtUsd(sum(s.donations_usd))} completed` : undefined}>
          {s ? <TrendChart labels={labels} series={[{ key: 'don', label: 'Donations', values: s.donations_usd }]} format={(v) => fmtUsd(v, 0)} /> : <ChartSkeleton />}
        </Panel>
        <Panel title="Hermes cost" description={s ? `${fmtUsd(sum(s.ai_cost_usd))} (provider-reported where available, else estimated)` : undefined}>
          {s ? <TrendChart labels={labels} series={[{ key: 'cost', label: 'AI cost', values: s.ai_cost_usd, color: 'rgb(var(--slate))' }]} format={(v) => fmtUsd(v, 2)} /> : <ChartSkeleton />}
        </Panel>
      </div>

      <div className="space-y-1 pt-2">
        <h2 className="font-display text-xl font-medium">Honest metrics</h2>
        <p className="text-sm text-muted-foreground">Real reading behaviour only. When the sample is small you will see that instead of a guess. No forecasts.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="When readers read" description={hours.data ? `Views per hour, ${hours.data.timezone}` : undefined}>
          {hours.error ? <ErrorState message={hours.error} onRetry={hours.reload} /> : !hours.data ? <ChartSkeleton /> : (
            <div className="space-y-3">
              {hours.data.reading.status === 'ok' && hours.data.reading.peak_hour !== undefined ? (
                <p className="text-sm">
                  Busiest hour: <span className="font-mono font-medium">{fmtHourRange(hours.data.reading.peak_hour)}</span>, {fmtPct(hours.data.reading.peak_share_pct)} of views
                  <span className="text-muted-foreground"> (from {fmtNumber(hours.data.reading.sample.views)} views over {hours.data.reading.sample.days} days)</span>
                </p>
              ) : (
                <NotEnoughData needed={hours.data.reading.needed} sample={hours.data.reading.sample} />
              )}
              <HourBars
                label="Views by hour of day"
                hours={hours.data.reading.hours.map((h) => ({ hour: h.hour, value: h.views }))}
                highlight={hours.data.reading.status === 'ok' ? hours.data.reading.peak_hour : undefined}
              />
            </div>
          )}
        </Panel>

        <Panel title="Best publish hour" description="Median views in an article's first two days, by the hour it went live">
          {!hours.data ? <ChartSkeleton /> : (
            <div className="space-y-3">
              {hours.data.publishing.status === 'ok' && hours.data.publishing.best_hour !== undefined ? (
                <p className="text-sm">
                  Best so far: <span className="font-mono font-medium">{fmtHourRange(hours.data.publishing.best_hour)}</span>, median {fmtNumber(hours.data.publishing.best_median_views)} views
                </p>
              ) : (
                <NotEnoughData needed={hours.data.publishing.needed} sample={hours.data.publishing.sample} />
              )}
              {hours.data.publishing.hours.length > 0 && (
                <DataTable className="sm:-mx-0">
                  <thead><tr><th>Publish hour</th><th className="text-right">Articles</th><th className="text-right">Median views</th></tr></thead>
                  <tbody>
                    {hours.data.publishing.hours.map((h) => (
                      <tr key={h.hour} className={h.comparable ? '' : 'text-muted-foreground'}>
                        <td className="font-mono">{fmtHourRange(h.hour)}{!h.comparable && <span className="ml-2 text-xs">(too few)</span>}</td>
                        <td className="text-right font-mono tabular-nums">{h.articles}</td>
                        <td className="text-right font-mono tabular-nums">{fmtNumber(h.median_views_first_2_days)}</td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              )}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Read time and scroll depth" description="Visible, active reading only (paused when the tab is hidden)">
          {engagement.error ? <ErrorState message={engagement.error} onRetry={engagement.reload} /> : !engagement.data ? <ChartSkeleton /> : engagement.data.status !== 'ok' ? (
            <NotEnoughData needed={engagement.data.needed} sample={engagement.data.sample} />
          ) : (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Avg read time', fmtSeconds(engagement.data.summary.avg_read_seconds)],
                  ['Avg scroll', fmtPct(engagement.data.summary.avg_scroll_pct, 0)],
                  ['Reached 50%', fmtPct(engagement.data.summary.reached_pct['50'], 0)],
                  ['Finished (90%+)', fmtPct(engagement.data.summary.reached_pct['90'], 0)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md bg-muted/50 p-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-mono text-lg tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <TrendChart
                height={180}
                labels={engagement.data.series.labels}
                series={[{ key: 'read', label: 'Avg read time', values: engagement.data.series.avg_read_seconds }]}
                format={(v) => fmtSeconds(v)}
              />
              <p className="text-xs text-muted-foreground">From {fmtNumber(engagement.data.summary.sessions)} measured reading sessions.</p>
            </div>
          )}
        </Panel>

        <Panel title="Returning readers" description={returning.data?.definition}>
          {returning.error ? <ErrorState message={returning.error} onRetry={returning.reload} /> : !returning.data ? <ChartSkeleton /> : returning.data.status !== 'ok' ? (
            <NotEnoughData needed={returning.data.needed} sample={{ readers: returning.data.readers }} />
          ) : (
            <div className="space-y-2">
              <p className="font-mono text-3xl tabular-nums">{fmtPct(returning.data.returning_rate_pct)}</p>
              <p className="text-sm text-muted-foreground">
                {fmtNumber(returning.data.returning)} of {fmtNumber(returning.data.readers)} readers came back.
                {returning.data.previous.returning_rate_pct !== null && <> Previous period: {fmtPct(returning.data.previous.returning_rate_pct)}.</>}
              </p>
              <p className="text-xs text-muted-foreground">Readers who clear their browser or switch devices count as new, so this is a floor.</p>
            </div>
          )}
        </Panel>
      </div>

      {engagement.data?.status === 'ok' && engagement.data.articles.length > 0 && (
        <Panel title="Most read, by time spent" description={`Articles with at least ${engagement.data.min_article_sessions} measured sessions`}>
          <DataTable>
            <thead><tr><th>Article</th><th className="text-right">Sessions</th><th className="text-right">Avg read</th><th className="text-right">Avg scroll</th><th className="text-right">Finished</th></tr></thead>
            <tbody>
              {engagement.data.articles.map((a) => (
                <tr key={a.id}>
                  <td className="max-w-[22rem] truncate">{a.title}</td>
                  <td className="text-right font-mono tabular-nums">{fmtNumber(a.sessions)}</td>
                  <td className="text-right font-mono tabular-nums">{fmtSeconds(a.avg_read_seconds)}</td>
                  <td className="text-right font-mono tabular-nums">{fmtPct(a.avg_scroll_pct, 0)}</td>
                  <td className="text-right font-mono tabular-nums">{fmtPct(a.finished_pct, 0)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Panel>
      )}
    </div>
  );
}
