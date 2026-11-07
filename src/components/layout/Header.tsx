import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { Wordmark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { PRIMARY_NAV, SECONDARY_NAV, SECTIONS } from '@/constants/sections';
import { TAGLINE, cn } from '@/lib/utils';
import { useSearchPalette } from '@/hooks/useSearchPalette';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-2.5 text-[0.875rem] font-medium transition-colors duration-fast ease-standard xl:min-h-9',
    "after:absolute after:inset-x-2.5 after:bottom-1 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-base after:ease-standard",
    isActive ? 'text-primary after:scale-x-100' : 'text-foreground/70 after:scale-x-0 hover:text-foreground',
  );

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  return (
    <div
      ref={wrap}
      className="relative"
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className="flex min-h-9 items-center gap-1 rounded-md px-2.5 text-[0.875rem] font-medium text-foreground/70 transition-colors duration-fast hover:text-foreground"
        aria-expanded={open}
        aria-controls="more-sections"
        onClick={() => setOpen((v) => !v)}
      >
        More <ChevronDown className={cn('size-3.5 transition-transform duration-base ease-standard', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div id="more-sections" className="absolute left-0 top-full z-50 w-56 origin-top-left animate-in fade-in-0 zoom-in-95 rounded-lg border bg-popover p-1.5 shadow-lg duration-fast">
          {SECONDARY_NAV.map((key) => (
            <Link key={key} to={SECTIONS[key].path} className="block rounded-md px-3 py-2 text-sm transition-colors duration-fast hover:bg-muted">
              {SECTIONS[key].title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Opens the search palette. Desktop shows the shortcut so the faster path is discoverable. */
function SearchButton() {
  const { open } = useSearchPalette();
  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search" aria-keyshortcuts="Control+K Meta+K /" onClick={() => open()}>
        <Search />
      </Button>
      <button
        type="button"
        onClick={() => open()}
        aria-label="Search stories"
        aria-keyshortcuts="Control+K Meta+K /"
        className="mr-1 hidden h-9 w-52 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground transition-colors duration-fast ease-standard hover:border-foreground/30 hover:text-foreground lg:flex"
      >
        <Search className="size-4" aria-hidden="true" />
        <span>Search</span>
        <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[0.68rem]">/</kbd>
      </button>
    </>
  );
}

const sheetLink = ({ isActive }: { isActive: boolean }) =>
  cn('flex min-h-11 items-center rounded-md px-3 font-display text-lg font-medium transition-colors duration-fast', isActive ? 'bg-mist text-secondary-foreground' : 'hover:bg-muted');

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
          <SearchButton />
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
            <SheetContent side="right">
              <div className="border-b px-5 py-4">
                <SheetTitle asChild>
                  <span>
                    <Wordmark />
                  </span>
                </SheetTitle>
                <SheetDescription className="mt-2 text-xs text-muted-foreground">{TAGLINE}</SheetDescription>
              </div>
              <nav aria-label="All sections" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
                <NavLink to="/" end className={sheetLink}>
                  Latest
                </NavLink>
                {[...PRIMARY_NAV, ...SECONDARY_NAV].map((key) => (
                  <NavLink key={key} to={SECTIONS[key].path} className={sheetLink}>
                    {SECTIONS[key].title}
                  </NavLink>
                ))}
              </nav>
              {/* Primary actions sit at the bottom of the sheet: the thumb zone on a phone. */}
              <Separator />
              <div className="flex flex-col gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                <Button size="lg" asChild>
                  <Link to="/subscribe">Subscribe</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Swipeable category tabs. The right edge fades out so it reads as "more to the side". */}
      <nav
        aria-label="Sections (compact)"
        className="no-scrollbar overflow-x-auto border-t [mask-image:linear-gradient(to_right,#000_calc(100%-3rem),transparent)] xl:hidden"
      >
        <div className="container flex h-10 items-center gap-0.5 pr-10">
          <NavLink to="/" end className={navClass}>
            Latest
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
