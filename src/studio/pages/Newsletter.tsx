import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Newspaper, Search, Send, Trash2, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { DataTable, EmptyState, ErrorState, Field, NativeSelect, PageHeader, Pager, Panel, RowsSkeleton, Switch, Tabs } from '../components/common';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fmtDate, fmtDateTime, fmtNumber, fmtPct } from '../lib/format';
import { sanitizeArticleHtml } from '../lib/sanitize';
import type { Campaign } from '../types';

function CampaignDetail({ campaign, onChanged, onDeleted }: { campaign: Campaign; onChanged: (c: Campaign) => void; onDeleted: () => void }) {
  const isDraft = campaign.status === 'draft';
  const [subject, setSubject] = useState(campaign.subject);
  const [name, setName] = useState(campaign.name);
  const [saving, setSaving] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const recipients = useApi(() => studioApi.recipients(campaign.id), [campaign.id, campaign.status]);
  useEffect(() => {
    setSubject(campaign.subject);
    setName(campaign.name);
  }, [campaign]);
  const dirty = subject !== campaign.subject || name !== campaign.name;
  const count = recipients.data?.recipients;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={cn('rounded-full px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.06em]', isDraft ? 'bg-mist text-secondary-foreground' : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200')}>{campaign.status}</span>
        <span className="font-mono text-xs text-muted-foreground">{campaign.sent_at ? `Sent ${fmtDateTime(campaign.sent_at)}` : `Created ${fmtDateTime(campaign.created_at)}`}</span>
      </div>
      {isDraft ? (
        <div className="space-y-3">
          <Field label="Internal name">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
          <Field label="Subject line" counter={`${subject.length}/200`}>{(id) => <Input id={id} value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} />}</Field>
          {dirty && (
            <Button size="sm" variant="outline" loading={saving} onClick={async () => {
              setSaving(true);
              try {
                onChanged(await studioApi.updateCampaign(campaign.id, { subject, name }));
                toast('Campaign saved');
              } catch (err) {
                toast('Could not save', { tone: 'error', description: errorText(err) });
              } finally {
                setSaving(false);
              }
            }}>Save changes</Button>
          )}
        </div>
      ) : (
        <div>
          <p className="font-medium">{campaign.subject}</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
            {[
              ['Delivered', fmtNumber(campaign.emails_delivered)],
              ['Opened', campaign.emails_delivered ? fmtPct((campaign.emails_opened / campaign.emails_delivered) * 100, 0) : '–'],
              ['Clicked', campaign.emails_delivered ? fmtPct((campaign.emails_clicked / campaign.emails_delivered) * 100, 0) : '–'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md bg-muted/50 p-2"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-mono tabular-nums">{v}</dd></div>
            ))}
          </dl>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
        <UsersIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        {recipients.loading && !recipients.data ? 'Counting recipients...' : recipients.error ? 'Could not count recipients' : (
          <span><span className="font-mono tabular-nums">{fmtNumber(count)}</span> {isDraft ? 'subscribers would receive this' : 'subscribers match its targeting'}</span>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Preview</p>
        <iframe
          title="Email preview"
          sandbox=""
          className="h-80 w-full rounded-md border bg-white"
          srcDoc={`<!doctype html><meta charset="utf-8"><style>body{font-family:Georgia,serif;margin:16px;color:#121723;line-height:1.5}a{color:#0047FF}</style>${sanitizeArticleHtml(campaign.html_content || `<p>${campaign.content}</p>`)}`}
        />
      </div>

      {isDraft && (
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Button onClick={() => setSendOpen(true)} disabled={!count || dirty}><Send /> Send campaign</Button>
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}><Trash2 /> Delete draft</Button>
          {dirty && <p className="w-full text-xs text-muted-foreground">Save your changes before sending.</p>}
        </div>
      )}

      <ConfirmDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        tone="public"
        title="Send this newsletter now?"
        description={<>This emails <strong className="text-foreground">{fmtNumber(count)}</strong> subscribers with the subject “{campaign.subject}”. Sent email cannot be recalled.</>}
        confirmLabel={`Send to ${fmtNumber(count)}`}
        typedConfirmation="SEND"
        onConfirm={async () => {
          await studioApi.sendCampaign(campaign.id);
          onChanged(await studioApi.campaign(campaign.id));
          toast('Newsletter sent');
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tone="destructive"
        title="Delete this draft campaign?"
        confirmLabel="Delete draft"
        onConfirm={async () => {
          await studioApi.deleteCampaign(campaign.id);
          toast('Draft deleted');
          onDeleted();
        }}
      />
    </div>
  );
}

function Campaigns() {
  const [params, setParams] = useSearchParams();
  const list = useApi(() => studioApi.campaigns({ page_size: 50 }), []);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [kind, setKind] = useState<'daily' | 'breaking'>('daily');
  const [drafting, setDrafting] = useState(false);
  const selected = list.data?.results.find((c) => c.id === selectedId) ?? list.data?.results[0] ?? null;

  const draftDigest = async () => {
    setDrafting(true);
    try {
      const res = await studioApi.draftDigest(kind);
      if (!res) toast('Nothing to send yet', { tone: 'info', description: 'No live articles in the digest window.' });
      else {
        toast('Digest draft created', { description: res.subject });
        list.reload();
        setSelectedId(res.campaign_id);
      }
    } catch (err) {
      toast('Could not draft the digest', { tone: 'error', description: errorText(err) });
    } finally {
      setDrafting(false);
    }
  };

  useEffect(() => {
    if (params.get('digest') === '1') {
      params.delete('digest');
      setParams(params, { replace: true });
      void draftDigest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect value={kind} onChange={(e) => setKind(e.target.value as 'daily' | 'breaking')} aria-label="Digest type">
          <option value="daily">Daily digest</option>
          <option value="breaking">Breaking alert</option>
        </NativeSelect>
        <Button onClick={draftDigest} loading={drafting}>{!drafting && <Newspaper />} Draft from digest</Button>
        <p className="text-xs text-muted-foreground">Creates a draft from recent live articles. It is never sent automatically.</p>
      </div>
      {list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : list.loading && !list.data ? <RowsSkeleton /> : !list.data?.results.length ? (
        <div className="rounded-lg border bg-card"><EmptyState icon={Mail} title="No campaigns yet">Draft one from the digest to get started.</EmptyState></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <ul className="space-y-1.5" aria-label="Campaigns">
            {list.data.results.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  aria-current={selected?.id === c.id}
                  className={cn('w-full rounded-lg border bg-card p-3 text-left transition-colors duration-fast ease-standard hover:border-foreground/20', selected?.id === c.id && 'border-primary ring-1 ring-primary')}
                >
                  <p className="line-clamp-1 text-sm font-medium">{c.subject}</p>
                  <p className="mt-0.5 flex justify-between font-mono text-xs text-muted-foreground"><span>{c.status}</span><span>{fmtDate(c.sent_at ?? c.created_at)}</span></p>
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <Panel>
              <CampaignDetail
                key={selected.id}
                campaign={selected}
                onChanged={(c) => list.setData((prev) => (prev ? { ...prev, results: prev.results.map((x) => (x.id === c.id ? c : x)) } : prev))}
                onDeleted={() => { setSelectedId(null); list.reload(); }}
              />
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

function Subscribers() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState('true');
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(q, 300);
  const list = useApi(() => studioApi.subscribers({ q: query, is_active: active, page, page_size: 25 }), [query, active, page]);
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search email" className="pl-9" aria-label="Search subscribers" />
        </div>
        <NativeSelect value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }} aria-label="Status">
          <option value="true">Active</option>
          <option value="false">Unsubscribed</option>
          <option value="">All</option>
        </NativeSelect>
      </div>
      <Panel bodyClassName="p-0 sm:p-0">
        {list.error ? <div className="p-4"><ErrorState message={list.error} onRetry={list.reload} /></div> : list.loading && !list.data ? <div className="p-4"><RowsSkeleton /></div> : !list.data?.results.length ? <EmptyState title="No subscribers match" /> : (
          <div className="px-4 pb-3 sm:px-2">
            <DataTable>
              <thead><tr><th>Email</th><th>Joined</th><th>Frequency</th><th className="text-right">Engagement</th><th>Subscribed</th></tr></thead>
              <tbody>
                {list.data.results.map((s) => (
                  <tr key={s.id}>
                    <td className="max-w-[16rem] truncate">{s.email}</td>
                    <td className="font-mono text-xs text-muted-foreground">{fmtDate(s.subscription_date)}</td>
                    <td className="text-muted-foreground">{s.frequency}</td>
                    <td className="text-right font-mono tabular-nums">{fmtNumber(s.engagement_score, 1)}</td>
                    <td>
                      <Switch label={`${s.email} subscribed`} checked={s.is_active} onCheckedChange={async (v) => {
                        try {
                          await studioApi.updateSubscriber(s.id, { is_active: v });
                          list.reload();
                        } catch (err) {
                          toast('Could not update', { tone: 'error', description: errorText(err) });
                        }
                      }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            <Pager page={page} count={list.data.count} pageSize={25} onPage={setPage} />
          </div>
        )}
      </Panel>
    </div>
  );
}

export default function Newsletter() {
  const [tab, setTab] = useState<'campaigns' | 'subscribers'>('campaigns');
  return (
    <div className="space-y-5">
      <PageHeader title="Newsletter" description="Campaigns go out only after you type SEND in the confirmation." />
      <Tabs label="Newsletter view" value={tab} onChange={setTab} items={[{ value: 'campaigns', label: 'Campaigns' }, { value: 'subscribers', label: 'Subscribers' }]} />
      {tab === 'campaigns' ? <Campaigns /> : <Subscribers />}
    </div>
  );
}
