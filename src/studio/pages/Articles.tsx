import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FilePlus2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { CheckFlags, DataTable, EmptyState, ErrorState, NativeSelect, PageHeader, Pager, Panel, RowsSkeleton, StatusBadge, Tabs } from '../components/common';
import { fmtDateTime, fmtNumber } from '../lib/format';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'ready', label: 'Ready' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;
type StatusValue = (typeof STATUSES)[number]['value'];
const PAGE_SIZE = 25;

export default function Articles() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? '') as StatusValue;
  const category = params.get('category') ?? '';
  const check = params.get('check') ?? '';
  const page = Number(params.get('page') ?? '1') || 1;
  const [q, setQ] = useState(params.get('q') ?? '');
  const debouncedQ = useDebouncedValue(q, 300);

  const set = (next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    if (!('page' in next)) p.delete('page');
    setParams(p, { replace: true });
  };

  const categories = useApi(() => studioApi.categories(), []);
  const list = useApi(
    () =>
      studioApi.articles({
        status,
        category,
        check_status: check,
        q: debouncedQ,
        page,
        page_size: PAGE_SIZE,
        ordering: status === 'published' ? '-published_at' : '-updated_at',
      }),
    [status, category, check, debouncedQ, page],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Articles"
        description="Every article in every state. Publishing always asks you to confirm."
        actions={<Button asChild><Link to="/studio/articles/new"><FilePlus2 /> New article</Link></Button>}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs label="Status" value={status} onChange={(v) => set({ status: v })} items={STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles" className="pl-9 sm:w-64" aria-label="Search articles" />
          </div>
          <NativeSelect value={category} onChange={(e) => set({ category: e.target.value })} aria-label="Category">
            <option value="">All categories</option>
            {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
          <NativeSelect value={check} onChange={(e) => set({ check: e.target.value })} aria-label="Check status">
            <option value="">Any check</option>
            <option value="passed">Passed</option>
            <option value="needs_human">Needs review</option>
            <option value="blocked">Blocked</option>
            <option value="pending">Pending</option>
          </NativeSelect>
        </div>
      </div>

      <Panel bodyClassName="p-0 sm:p-0">
        {list.error ? (
          <div className="p-4"><ErrorState message={list.error} onRetry={list.reload} /></div>
        ) : list.loading && !list.data ? (
          <div className="p-4"><RowsSkeleton rows={8} /></div>
        ) : !list.data?.results.length ? (
          <EmptyState title="No articles match">Try another status or clear the search.</EmptyState>
        ) : (
          <div className="px-4 pb-3 sm:px-2">
            <DataTable>
              <thead>
                <tr>
                  <th className="w-[46%]">Title</th>
                  <th>Status</th>
                  <th className="hidden md:table-cell">Checks</th>
                  <th>Updated</th>
                  <th className="text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {list.data.results.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link to={`/studio/articles/${a.id}`} className="line-clamp-2 font-medium hover:text-primary">{a.title || 'Untitled'}</Link>
                      <span className="text-xs text-muted-foreground">{a.category_name ?? 'No category'}</span>
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="hidden md:table-cell"><CheckFlags flags={a.check_flags} compact /></td>
                    <td className="whitespace-nowrap font-mono text-xs text-muted-foreground">{fmtDateTime(a.status === 'published' ? a.published_at : a.updated_at)}</td>
                    <td className="text-right font-mono tabular-nums">{fmtNumber(a.view_count)}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            <Pager page={page} count={list.data.count} pageSize={PAGE_SIZE} onPage={(p) => set({ page: String(p) })} />
          </div>
        )}
      </Panel>
    </div>
  );
}
