import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Download, ExternalLink, FilePlus2, LogOut, Moon, Newspaper, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { NAV } from '../nav';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

const itemClass =
  'flex h-11 cursor-pointer select-none items-center gap-3 rounded-md px-3 text-sm text-foreground aria-selected:bg-muted data-[disabled=true]:opacity-50 sm:h-10 [&_svg]:size-4 [&_svg]:text-muted-foreground';

/** Ctrl/Cmd+K: jump anywhere in the Studio and run common actions. Public or destructive actions only navigate to their confirm step. */
export function CommandPalette({ open, onOpenChange, onSignOut, onExportDonations }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  onExportDonations: () => void;
}) {
  const navigate = useNavigate();
  const { toggle } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };
  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="top-[18%] w-[min(36rem,calc(100vw-1.5rem))] translate-y-0 gap-0 overflow-hidden p-0" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command label="Studio commands" loop className="flex max-h-[min(28rem,70dvh)] flex-col">
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <Command.Input autoFocus placeholder="Go to, or do..." className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm" />
            <kbd className="hidden rounded border px-1.5 font-mono text-[0.65rem] text-muted-foreground sm:inline">Esc</kbd>
          </div>
          <Command.List className="overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">No match.</Command.Empty>
            <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground">
              {NAV.map((item) => (
                <Command.Item key={item.to} value={`${item.label} ${item.keywords ?? ''}`} onSelect={() => go(item.to)} className={itemClass}>
                  <item.icon />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground">
              <Command.Item value="new article write draft" onSelect={() => go('/studio/articles/new')} className={itemClass}>
                <FilePlus2 /> New article
              </Command.Item>
              <Command.Item value="review approval queue ready" onSelect={() => go('/studio/articles?status=ready')} className={itemClass}>
                <Newspaper /> Review ready drafts
              </Command.Item>
              <Command.Item value="newsletter digest draft" onSelect={() => go('/studio/newsletter?digest=1')} className={itemClass}>
                <Newspaper /> Draft newsletter from digest
              </Command.Item>
              <Command.Item value="export donations csv" onSelect={() => run(onExportDonations)} className={itemClass}>
                <Download /> Export donations CSV
              </Command.Item>
              <Command.Item value="toggle dark light theme mode" onSelect={() => run(toggle)} className={itemClass}>
                <Moon /> Toggle dark mode
              </Command.Item>
              <Command.Item value="open public site" onSelect={() => run(() => window.open('/', '_blank', 'noopener'))} className={itemClass}>
                <ExternalLink /> Open the public site
              </Command.Item>
              <Command.Item value="sign out log out" onSelect={() => run(onSignOut)} className={itemClass}>
                <LogOut /> Sign out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
