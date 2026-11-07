import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

/**
 * Explicit marketing opt-in. Always starts unchecked and is never pre-ticked or bundled with the
 * purchase: the value sent to the backend is exactly what the reader chose.
 */
export function MarketingConsent({ checked, onChange, id = 'marketing-opt-in', className }: { checked: boolean; onChange: (value: boolean) => void; id?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-input accent-[rgb(var(--primary))]"
      />
      <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-foreground">
        {t('consent.label')}
        <span className="block text-muted-foreground">{t('consent.hint')}</span>
      </label>
    </div>
  );
}
