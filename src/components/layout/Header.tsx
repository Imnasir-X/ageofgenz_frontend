import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Sun, User } from 'lucide-react';
import { Wordmark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { PRIMARY_NAV, SECONDARY_NAV, SECTIONS } from '@/constants/sections';
import { TAGLINE, cn } from '@/lib/utils';
import { SearchPopover } from './SearchPopover';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative whitespace-nowrap px-2.5 py-1.5 text-[0.875rem] font-medium transition-colors',
    isActive ? 'text-primary' : 'text-foreground/70 hover:text-foreground',
  );

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="flex items-center gap-1 px-2.5 py-1.5 text-[0.875rem] font-medium text-foreground/70 hover:text-foreground"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        More <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 w-56 animate-fade-up rounded-lg border bg-popover p-1.5 shadow-lg">
          {SECONDARY_NAV.map((key) => (
            <Link key={key} to={SECTIONS[key].path} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">
              {SECTIONS[key].title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const sheetLink = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-md px-3 py-2.5 font-display text-lg font-medium', isActive ? 'bg-mist text-secondary-foreground' : 'hover:bg-muted');

export function Header() {
  const { theme, toggle } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
      <div className="container flex h-[var(--header-h)] items-center gap-3">
        <Link to="/" className="shrink-0" aria-label="The Age of GenZ, home">
          <Wordmark />
        </Link>

        <nav aria-label="Sections" className="ml-4 hidden min-w-0 items-center xl:flex">
          {PRIMARY_NAV.map((key) => (
            <NavLink key={key} to={SECTIONS[key].path} className={navClass}>
              {SECTIONS[key].label}
            </NavLink>
          ))}
          <MoreMenu />
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <SearchPopover />
          <Button variant="ghost" size="icon" onClick={toggle} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={logout} title={user?.email}>
                <LogOut /> Sign out
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            )}
            <Button size="sm" asChild>
              <Link to="/subscribe">Subscribe</Link>
            </Button>
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <div className="border-b px-5 py-4">
                <SheetTitle asChild>
                  <span>
                    <Wordmark />
                  </span>
                </SheetTitle>
                <SheetDescription className="mt-2 text-xs text-muted-foreground">{TAGLINE}</SheetDescription>
              </div>
              <nav aria-label="All sections" className="flex flex-col px-3 py-3">
                <NavLink to="/" end className={sheetLink}>
                  Today’s briefing
                </NavLink>
                {[...PRIMARY_NAV, ...SECONDARY_NAV].map((key) => (
                  <NavLink key={key} to={SECTIONS[key].path} className={sheetLink}>
                    {SECTIONS[key].title}
                  </NavLink>
                ))}
              </nav>
              <Separator />
              <div className="flex flex-col gap-2 p-5">
                <Button asChild>
                  <Link to="/subscribe">Subscribe</Link>
                </Button>
                {isAuthenticated ? (
                  <Button variant="outline" onClick={logout}>
                    <LogOut /> Sign out
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/login">
                      <User /> Sign in
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link to="/donate">Support our journalism</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <nav aria-label="Sections (compact)" className="no-scrollbar overflow-x-auto border-t xl:hidden">
        <div className="container flex h-10 items-center gap-1">
          <NavLink to="/" end className={navClass}>
            Briefing
          </NavLink>
          {PRIMARY_NAV.map((key) => (
            <NavLink key={key} to={SECTIONS[key].path} className={navClass}>
              {SECTIONS[key].label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
