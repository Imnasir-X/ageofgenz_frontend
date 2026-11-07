import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleCheck, CircleX, FilePlus2, FileText, Loader2, Play, Radar, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { useStudio } from '../context';
import { DataTable, EmptyState, ErrorState, NativeSelect, PageHeader, Pager, Panel, RowsSkeleton, Tabs } from '../components/common';
import { DateRangePicker } from '../components/DateRangePicker';
import { fmtDateTime, fmtNumber, fmtUsd } from '../lib/format';
import type { Cluster } from '../types';

const STEPS = [
  { step: 'write', label: 'Write' },
  { step: 'summaries', label: 'Summaries' },
  { step: 'seo', label: 'SEO' },
  { step: 'check', label: 'Check' },
  { step: 'image', label: 'Image' },
] as const;

function ClusterCard({ cluster, onDrafted }: { cluster: Cluster; onDrafted: () => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const score = Math.round(Math.max(0, Math.min(1, cluster.trend_score)) * 100);

  const draft = async () => {
    setBusy('draft');
    try {
      const res = await studioApi.draftFromCluster(cluster.id);
      const articleId = (res.id ?? res.article_id) as number | undefined;
      toast('Draft created', { description: 'Hermes wrote a first draft. Review it before approving.' });
      onDrafted();
      if (articleId) navigate(`/studio/articles/${articleId}`);
    } catch (err) {
      toast('Could not create a draft', { tone: 'error', description: errorText(err) });
    } finally {
      setBusy(null);
    }
  };
  const run = async (step: string) => {
    if (!cluster.draft_article) return;
    setBusy(step);
    try {
      await studioApi.runStep(cluster.draft_article, step);
      toast(`${step} finished`);
    } catch (err) {
      toast(`${step} failed`, { tone: 'error', description: errorText(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {cluster.is_breaking && <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.06em] text-destructive"><Zap className="size-3" /> Breaking</span>}
            <span className="font-mono text-xs text-muted-foreground">{cluster.size} items · {cluster.source_count} sources</span>
          </div>
          <h3 className="font-serif text-lg leading-snug">{cluster.title}</h3>
        </div>
        <div className="w-16 shrink-0 text-right" aria-label={`Trend score ${score} of 100`}>
          <p className="font-mono text-lg tabular-nums">{score}</p>
          <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} /></div>
        </div>
      </div>
      {cluster.summary && <p className="text-sm text-muted-foreground">{cluster.summary}</p>}
      {cluster.suggested_angle && (
        <p className="rounded-md bg-mist px-3 py-2 text-sm text-mist-foreground"><span className="font-medium">Angle: </span>{cluster.suggested_angle}</p>
      )}
      {cluster.keywords?.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">{cluster.keywords.slice(0, 6).map((k) => <li key={k} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.68rem] text-muted-foreground">{k}</li>)}</ul>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        {cluster.draft_article ? (
          <>
            <Button size="sm" variant="outline" asChild><Link to={`/studio/articles/${cluster.draft_article}`}><FileText /> Open draft</Link></Button>
            <span className="text-xs text-muted-foreground">Run:</span>
            {STEPS.map(({ step, label }) => (
              <Button key={step} size="sm" variant="ghost" onClick={() => run(step)} disabled={busy !== null}>
                {busy === step ? <Loader2 className="animate-spin" /> : <Play />} {label}
              </Button>
            ))}
          </>
        ) : (
          <Button size="sm" onClick={draft} loading={busy === 'draft'} disabled={cluster.status === 'ignored'}>
            {busy !== 'draft' && <FilePlus2 />} Create draft
          </Button>
        )}
      </div>
    </li>
  );
}

export default function Newsroom() {
  const { range, setRange } = useStudio();
  const key = JSON.stringify(range);
  const [tab, setTab] = useState<'radar' | 'runs'>('radar');
  const [clusterPage, setClusterPage] = useState(1);
  const [skill, setSkill] = useState('');
  const [ok, setOk] = useState('');
  const [runPage, setRunPage] = useState(1);
  const [researching, setResearching] = useState(false);

  const status = useApi(() => studioApi.newsroomStatus(), []);
  const clusters = useApi(() => studioApi.clusters(clusterPage), [clusterPage]);
  const stats = useApi(() => studioApi.newsroomStats(range), [key]);
  const runs = useApi(
    () => studioApi.hermesRuns({ skill, ok, page: runPage, page_size: 25, ...(range.start ? { start: range.start, end: range.end } : {}) }),
    [skill, ok, runPage, key],
  );
  const hermes = stats.data?.hermes;
  const configured = status.data?.hermes.configured;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Newsroom"
        description="Trending stories from your sources, Hermes drafts and what they cost. Drafts never publish without you."
        actions={
          <>
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs', configured ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200' : 'bg-muted text-muted-foreground')}>
              {configured ? <CircleCheck className="size-3.5" /> : <CircleX className="size-3.5" />}
              Hermes {status.data ? (configured ? status.data.hermes.status : 'not connected (stub mode)') : '...'}
            </span>
            <Button variant="outline" size="sm" loading={researching} onClick={async () => {
              setResearching(true);
              try {
                await studioApi.runResearch();
                toast('Research run finished', { description: 'The radar is refreshed.' });
                clusters.reload();
              } catch (err) {
                toast('Research failed', { tone: 'error', description: errorText(err) });
              } finally {
                setResearching(false);
              }
            }}>{!researching && <RefreshCw />} Refresh radar</Button>
          </>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs label="Newsroom view" value={tab} onChange={setTab} items={[{ value: 'radar', label: 'Trend radar' }, { value: 'runs', label: 'Hermes runs and cost' }]} />
        {tab === 'runs' && <DateRangePicker value={range} onChange={setRange} />}
      </div>

      {tab === 'radar' ? (
        clusters.error ? <ErrorState message={clusters.error} onRetry={clusters.reload} /> : clusters.loading && !clusters.data ? <RowsSkeleton rows={4} /> : !clusters.data?.results.length ? (
          <div className="rounded-lg border bg-card"><EmptyState icon={Radar} title="No trending clusters yet">Refresh the radar to group incoming stories.</EmptyState></div>
        ) : (
          <>
            <ul className="grid gap-3 lg:grid-cols-2">{clusters.data.results.map((c) => <ClusterCard key={c.id} cluster={c} onDrafted={clusters.reload} />)}</ul>
            <Pager page={clusterPage} count={clusters.data.count} pageSize={12} onPage={setClusterPage} />
          </>
        )
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Cost', hermes ? fmtUsd(hermes.cost_usd) : '–'],
              ['Runs', hermes ? fmtNumber(hermes.runs) : '–'],
              ['Live runs', hermes ? fmtNumber(hermes.live_runs) : '–'],
              ['Failed', hermes ? fmtNumber(hermes.failed) : '–'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-mono text-xl tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          {hermes?.by_skill && hermes.by_skill.length > 0 && (
            <Panel title="Cost by skill">
              <ul className="space-y-2">
                {hermes.by_skill.map((row) => {
                  const max = Math.max(...hermes.by_skill!.map((r) => r.cost_usd), 0.0001);
                  return (
                    <li key={row.skill} className="grid grid-cols-[7rem_1fr_5rem] items-center gap-3 text-sm">
                      <span className="truncate font-mono text-xs">{row.skill}</span>
                      <span className="h-2 rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(row.cost_usd / max) * 100}%` }} /></span>
                      <span className="text-right font-mono text-xs tabular-nums">{fmtUsd(row.cost_usd, 3)}</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
          <Panel
            title="Runs"
            actions={
              <div className="flex gap-2">
                <NativeSelect value={skill} onChange={(e) => { setSkill(e.target.value); setRunPage(1); }} aria-label="Skill">
                  <option value="">All skills</option>
                  {(hermes?.by_skill ?? []).map((r) => <option key={r.skill} value={r.skill}>{r.skill}</option>)}
                </NativeSelect>
                <NativeSelect value={ok} onChange={(e) => { setOk(e.target.value); setRunPage(1); }} aria-label="Result">
                  <option value="">Any result</option>
                  <option value="true">Succeeded</option>
                  <option value="false">Failed</option>
                </NativeSelect>
              </div>
            }
          >
            {runs.error ? <ErrorState message={runs.error} onRetry={runs.reload} /> : runs.loading && !runs.data ? <RowsSkeleton /> : !runs.data?.results.length ? (
              <EmptyState title="No runs in this range" />
            ) : (
              <>
                <DataTable>
                  <thead><tr><th>When</th><th>Skill</th><th>Article</th><th>Result</th><th className="text-right">Tokens</th><th className="text-right">Latency</th><th className="text-right">Cost</th></tr></thead>
                  <tbody>
                    {runs.data.results.map((r) => (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap font-mono text-xs text-muted-foreground">{fmtDateTime(r.created_at)}</td>
                        <td className="font-mono text-xs">{r.skill}{r.stub && <span className="ml-1 text-muted-foreground">(stub)</span>}</td>
                        <td className="max-w-[16rem] truncate">{r.article ? <Link to={`/studio/articles/${r.article}`} className="hover:text-primary">{r.article_title}</Link> : <span className="text-muted-foreground">–</span>}</td>
                        <td>{r.ok ? <span className="text-emerald-700 dark:text-emerald-400">ok</span> : <span className="text-destructive">{r.error || 'failed'}</span>}</td>
                        <td className="text-right font-mono text-xs tabular-nums">{fmtNumber(r.prompt_tokens + r.completion_tokens)}</td>
                        <td className="text-right font-mono text-xs tabular-nums">{r.latency_ms ? `${(r.latency_ms / 1000).toFixed(1)}s` : '–'}</td>
                        <td className="text-right font-mono text-xs tabular-nums">{fmtUsd(r.cost_usd, 4)}{r.cost_is_estimate && <span className="text-muted-foreground">*</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
                <p className="pt-2 text-xs text-muted-foreground">* estimated from tokens; the rest is provider-reported.</p>
                <Pager page={runPage} count={runs.data.count} pageSize={25} onPage={setRunPage} />
              </>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
