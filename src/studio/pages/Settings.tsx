import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { errorText, studioApi } from '../api';
import { useApi } from '../hooks/useApi';
import { ErrorState, Field, PageHeader, Panel, RowsSkeleton, Switch } from '../components/common';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { SiteSettings } from '../types';

export default function Settings() {
  const loaded = useApi(() => studioApi.settings(), []);
  const status = useApi(() => studioApi.newsroomStatus(), []);
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [maintenanceConfirm, setMaintenanceConfirm] = useState<boolean | null>(null);
  useEffect(() => setForm(loaded.data), [loaded.data]);

  if (loaded.error) return <ErrorState message={loaded.error} onRetry={loaded.reload} />;
  if (!form) return <RowsSkeleton rows={4} />;
  const dirty = JSON.stringify(form) !== JSON.stringify(loaded.data);

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="Settings" description="Site-wide settings. Secrets and API keys live on the server, never here." />
      <Panel title="Site">
        <div className="space-y-4">
          <Field label="Site name">{(id) => <Input id={id} value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} />}</Field>
          <Field label="Description">{(id) => <Textarea id={id} rows={3} value={form.site_description} onChange={(e) => setForm({ ...form, site_description: e.target.value })} />}</Field>
          <Button disabled={!dirty} loading={saving} onClick={async () => {
            setSaving(true);
            try {
              const saved = await studioApi.updateSettings({ site_name: form.site_name, site_description: form.site_description });
              loaded.setData(saved);
              toast('Settings saved');
            } catch (err) {
              toast('Could not save', { tone: 'error', description: errorText(err) });
            } finally {
              setSaving(false);
            }
          }}>{!saving && <Save />} Save</Button>
        </div>
      </Panel>
      <Panel title="Maintenance mode" description="Shows readers a maintenance notice instead of the site.">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">{form.maintenance_mode ? 'The site is in maintenance mode.' : 'The site is live.'}</span>
          <Switch label="Maintenance mode" checked={form.maintenance_mode} onCheckedChange={(v) => setMaintenanceConfirm(v)} />
        </div>
      </Panel>
      <Panel title="Newsroom automation" description="Read-only here; set through server environment variables.">
        {status.data ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              ['Hermes', status.data.hermes.configured ? status.data.hermes.status : 'not connected (stubs)'],
              ['Auto publish', status.data.auto_publish ? 'on' : 'off (human approval required)'],
              ['Research', status.data.research_enabled ? 'on' : 'off'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 rounded-md bg-muted/50 px-3 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-mono text-xs">{v}</dd></div>
            ))}
          </dl>
        ) : <RowsSkeleton rows={2} />}
      </Panel>
      <ConfirmDialog
        open={maintenanceConfirm !== null}
        onOpenChange={(o) => !o && setMaintenanceConfirm(null)}
        tone={maintenanceConfirm ? 'destructive' : 'public'}
        title={maintenanceConfirm ? 'Turn on maintenance mode?' : 'Bring the site back?'}
        description={maintenanceConfirm ? 'Readers will see a maintenance notice until you turn it off.' : 'Readers will see the site again.'}
        confirmLabel={maintenanceConfirm ? 'Turn on' : 'Turn off'}
        onConfirm={async () => {
          const saved = await studioApi.updateSettings({ maintenance_mode: Boolean(maintenanceConfirm) });
          loaded.setData(saved);
          setForm((f) => (f ? { ...f, maintenance_mode: saved.maintenance_mode } : f));
          toast(saved.maintenance_mode ? 'Maintenance mode on' : 'Site is live');
        }}
      />
    </div>
  );
}
