import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Command, ExternalLink, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { LogoMark } from '@/components/brand/Logo';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { NAV, NAV_GROUPS, isActive } from '../nav';
import { useStudio } from '../context';

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Studio" className="space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group} className="space-y-1">
          <p className="px-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">{group}</p>
          {NAV.filter((n) => n.group === group).map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/studio'}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-10 items-center gap-2.5 rounded-md px-3 text-sm transition-colors duration-fast ease-standard sm:h-9',
                  active ? 'bg-mist font-medium text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/studio" className="flex items-center gap-2 px-3">
      <LogoMark className="h-6" />
      <span className="font-display text-lg font-semibold tracking-[-0.02em]">Studio</span>
    </Link>
  );
}

export function StudioShell({ children, toolbar }: { children: ReactNode; toolbar?: ReactNode }) {
  const { me, signOut, openPalette } = useStudio();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[15rem_1fr]">
      <a href="#studio-main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r bg-card/60 px-2 py-4 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="space-y-1 border-t px-1 pt-3">
          <p className="truncate px-2 text-xs text-muted-foreground" title={me.email}>{me.name}</p>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1 justify-start" asChild>
              <a href="/" target="_blank" rel="noopener"><ExternalLink /> Site</a>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-5">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <div className="lg:hidden"><Brand /></div>
          <div className="ml-auto flex items-center gap-1.5">
            {toolbar}
            <Button variant="outline" size="sm" onClick={openPalette} className="gap-2" aria-label="Open command palette (Ctrl+K)">
              <Command />
              <span className="hidden font-mono text-xs sm:inline">Ctrl K</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
          </div>
        </header>
        <main id="studio-main" tabIndex={-1} className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-5 outline-none sm:px-6 sm:py-7">
          {children}
        </main>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="gap-6 px-2 py-4" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Studio menu</SheetTitle>
          <Brand />
          <div className="flex-1 overflow-y-auto">
            <NavList onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="border-t px-1 pt-3">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}><LogOut /> Sign out</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
