import { useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { toast } from '@/lib/toast';
import { studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { useStudio } from '../context';
import { DataTable, EmptyState, ErrorState, NativeSelect, PageHeader, Pager, Panel, RowsSkeleton } from '../components/common';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fmtDate, relativeFromNow } from '../lib/format';
import type { StudioUser } from '../types';

export default function Users() {
  const { me } = useStudio();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(q, 300);
  const [target, setTarget] = useState<{ user: StudioUser; action: 'disable' | 'enable' } | null>(null);
  const params = filter === 'staff' ? { is_staff: 'true' } : filter === 'disabled' ? { is_active: 'false' } : {};
  const list = useApi(() => studioApi.users({ q: query, page, page_size: 25, ...params }), [query, filter, page]);

  return (
    <div className="space-y-5">
      <PageHeader title="Users" description="Reader and staff accounts. Disabling blocks sign-in; nothing is deleted." />
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search email or name" className="pl-9" aria-label="Search users" />
        </div>
        <NativeSelect value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} aria-label="Filter">
          <option value="">Everyone</option>
          <option value="staff">Staff</option>
          <option value="disabled">Disabled</option>
        </NativeSelect>
      </div>
      <Panel bodyClassName="p-0 sm:p-0">
        {list.error ? <div className="p-4"><ErrorState message={list.error} onRetry={list.reload} /></div> : list.loading && !list.data ? <div className="p-4"><RowsSkeleton /></div> : !list.data?.results.length ? <EmptyState title="No users match" /> : (
          <div className="px-4 pb-3 sm:px-2">
            <DataTable>
              <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Last sign-in</th><th>Status</th><th className="w-32" /></tr></thead>
              <tbody>
                {list.data.results.map((u) => {
                  const self = u.id === me.id;
                  const locked = u.is_superuser && !me.is_superuser;
                  return (
                    <tr key={u.id}>
                      <td>
                        <span className="block max-w-[16rem] truncate font-medium">{`${u.first_name} ${u.last_name}`.trim() || u.username || u.email}</span>
                        <span className="block max-w-[16rem] truncate text-xs text-muted-foreground">{u.email}</span>
                      </td>
                      <td className="text-muted-foreground">{u.is_superuser ? 'superuser' : u.is_staff ? 'staff' : u.role || 'reader'}</td>
                      <td className="font-mono text-xs text-muted-foreground">{fmtDate(u.date_joined)}</td>
                      <td className="font-mono text-xs text-muted-foreground">{relativeFromNow(u.last_login)}</td>
                      <td>{u.is_active ? 'active' : <span className="text-destructive">disabled</span>}</td>
                      <td className="text-right">
                        {u.is_active ? (
                          <Button size="sm" variant="ghost" disabled={self || locked} onClick={() => setTarget({ user: u, action: 'disable' })} title={self ? 'You cannot disable yourself' : undefined}>
                            <UserX /> Disable
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setTarget({ user: u, action: 'enable' })}><UserCheck /> Enable</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
            <Pager page={page} count={list.data.count} pageSize={25} onPage={setPage} />
          </div>
        )}
      </Panel>
      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        tone={target?.action === 'disable' ? 'destructive' : 'default'}
        title={target?.action === 'disable' ? `Disable ${target.user.email}?` : `Enable ${target?.user.email ?? ''}?`}
        description={target?.action === 'disable' ? 'They will not be able to sign in until you enable the account again.' : 'They will be able to sign in again.'}
        confirmLabel={target?.action === 'disable' ? 'Disable account' : 'Enable account'}
        onConfirm={async () => {
          if (!target) return;
          if (target.action === 'disable') await studioApi.disableUser(target.user.id);
          else await studioApi.enableUser(target.user.id);
          toast(target.action === 'disable' ? 'Account disabled' : 'Account enabled');
          list.reload();
        }}
      />
    </div>
  );
}
