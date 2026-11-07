import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { useStudio } from '../context';
import { DataTable, EmptyState, ErrorState, KpiCard, NativeSelect, PageHeader, Pager, Panel, RowsSkeleton } from '../components/common';
import { DateRangePicker } from '../components/DateRangePicker';
import { fmtDateTime, fmtUsd } from '../lib/format';

const PAGE = 25;
const todayDhaka = () => new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() + 6 * 3600 * 1000 - (n - 1) * 86400000).toISOString().slice(0, 10);

/** Read-only donations with CSV export. */
export default function Donations() {
  const { range, setRange } = useStudio();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const start = range.start ?? daysAgo(range.days ?? 30);
  const end = range.end ?? todayDhaka();
  const key = `${start}-${end}-${status}`;
  const overview = useApi(() => studioApi.overview(range), [JSON.stringify(range)]);
  const list = useApi(() => studioApi.donations({ start, end, status, page, page_size: PAGE }), [key, page]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Donations"
        description="Read-only. Refunds and disputes are handled in Stripe."
        actions={
          <>
            <DateRangePicker value={range} onChange={(r) => { setRange(r); setPage(1); }} />
            <Button variant="outline" loading={exporting} onClick={async () => {
              setExporting(true);
              try {
                await studioApi.exportDonations({ start, end, status });
                toast('CSV downloaded');
              } catch (err) {
                toast('Export failed', { tone: 'error', description: errorText(err) });
              } finally {
                setExporting(false);
              }
            }}>{!exporting && <Download />} Export CSV</Button>
          </>
        }
      />
      <div className="grid max-w-md grid-cols-1">
        <KpiCard kpi={overview.data?.kpis.donations_total} loading={overview.loading && !overview.data} />
      </div>
      <div className="flex gap-2">
        <NativeSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </NativeSelect>
      </div>
      <Panel bodyClassName="p-0 sm:p-0">
        {list.error ? <div className="p-4"><ErrorState message={list.error} onRetry={list.reload} /></div> : list.loading && !list.data ? <div className="p-4"><RowsSkeleton /></div> : !list.data?.results.length ? <EmptyState title="No donations in this range" /> : (
          <div className="px-4 pb-3 sm:px-2">
            <DataTable>
              <thead><tr><th>When</th><th>Donor</th><th className="text-right">Amount</th><th>Plan</th><th>Status</th><th>Method</th></tr></thead>
              <tbody>
                {list.data.results.map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap font-mono text-xs text-muted-foreground">{fmtDateTime(d.created_at)}</td>
                    <td className="max-w-[14rem] truncate">{d.is_anonymous ? <span className="text-muted-foreground">Anonymous</span> : d.donor_name}</td>
                    <td className="text-right font-mono tabular-nums">{fmtUsd(d.amount)}</td>
                    <td className="text-muted-foreground">{d.plan} · {d.billing_cycle.replace('_', ' ')}</td>
                    <td>{d.status}</td>
                    <td className="font-mono text-xs text-muted-foreground">{d.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            <Pager page={page} count={list.data.count} pageSize={PAGE} onPage={setPage} />
          </div>
        )}
      </Panel>
    </div>
  );
}
