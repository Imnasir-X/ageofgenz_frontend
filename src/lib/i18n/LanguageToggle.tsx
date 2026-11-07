import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from './useI18n';

/** Header switch between the English and Bangla interface. Its visible text is the other language. */
export function LanguageToggle({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'default' }) {
  const { lang, toggle, t } = useI18n();
  const target = lang === 'en' ? 'bn' : 'en';
  return (
    <Button variant="ghost" size={size} onClick={toggle} className={cn('gap-1.5 px-2.5', className)} data-testid="lang-toggle">
      <Languages aria-hidden="true" />
      <span lang={target}>{t('lang.toggle')}</span>
      <span className="sr-only">: {t('lang.toggleLabel')}</span>
    </Button>
  );
}
