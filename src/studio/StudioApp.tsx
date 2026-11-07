import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { tokenStore } from '@/lib/api/client';
import { lazyRoute } from '@/lib/lazyRoute';
import { toast } from '@/lib/toast';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { StudioGate } from './StudioGate';
import { StudioShell } from './layout/StudioShell';
import { CommandPalette } from './components/CommandPalette';
import { StudioContext, type StudioContextValue } from './context';
import { errorText, studioApi } from './api';
import type { Me, RangeParams } from './types';
import StudioLogin from './pages/StudioLogin';

const Today = lazyRoute(() => import('./pages/Today'));
const Analytics = lazyRoute(() => import('./pages/Analytics'));
const Articles = lazyRoute(() => import('./pages/Articles'));
const ArticleEditor = lazyRoute(() => import('./pages/ArticleEditor'));
const Categories = lazyRoute(() => import('./pages/Categories'));
const Media = lazyRoute(() => import('./pages/Media'));
const Newsroom = lazyRoute(() => import('./pages/Newsroom'));
const Newsletter = lazyRoute(() => import('./pages/Newsletter'));
const Donations = lazyRoute(() => import('./pages/Donations'));
const Users = lazyRoute(() => import('./pages/Users'));
const SettingsPage = lazyRoute(() => import('./pages/Settings'));
const Ask = lazyRoute(() => import('./pages/Ask'));

const RANGE_KEY = 'agz-studio-range';

function readRange(): RangeParams {
  try {
    const raw = window.localStorage.getItem(RANGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as RangeParams) : null;
    if (parsed && (parsed.days || (parsed.start && parsed.end))) return parsed;
  } catch {
    /* ignore */
  }
  return { days: 30 };
}

/** Keeps the Studio out of search engines even if a crawler reaches it (also X-Robots-Tag and robots.txt). */
function useNoIndex() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Studio · The Age of GenZ';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !meta;
    const previous = meta?.content;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    return () => {
      document.title = previousTitle;
      if (created) meta?.remove();
      else if (meta && previous !== undefined) meta.content = previous;
    };
  }, []);
}

function PageFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function StudioInside({ me }: { me: Me }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [range, setRangeState] = useState<RangeParams>(() => (typeof window === 'undefined' ? { days: 30 } : readRange()));
  const [paletteOpen, setPaletteOpen] = useState(false);

  const setRange = useCallback((r: RangeParams) => {
    setRangeState(r);
    try {
      window.localStorage.setItem(RANGE_KEY, JSON.stringify(r));
    } catch {
      /* ignore */
    }
  }, []);
  const signOut = useCallback(() => {
    tokenStore.clear();
    navigate('/studio/login', { replace: true });
  }, [navigate]);
  const exportDonations = useCallback(() => {
    studioApi.exportDonations({}).then(
      () => toast('Donations CSV downloaded'),
      (err) => toast('Export failed', { tone: 'error', description: errorText(err) }),
    );
  }, []);

  const value = useMemo<StudioContextValue>(
    () => ({ me, range, setRange, signOut, openPalette: () => setPaletteOpen(true) }),
    [me, range, setRange, signOut],
  );

  return (
    <StudioContext.Provider value={value}>
      <StudioShell>
        <Suspense fallback={<PageFallback />}>
          <div key={location.pathname} className="motion-safe:animate-route-in">
            <Routes>
              <Route index element={<Today />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="articles" element={<Articles />} />
              <Route path="articles/new" element={<ArticleEditor />} />
              <Route path="articles/:id" element={<ArticleEditor />} />
              <Route path="categories" element={<Categories />} />
              <Route path="media" element={<Media />} />
              <Route path="newsroom" element={<Newsroom />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="donations" element={<Donations />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="ask" element={<Ask />} />
              <Route path="*" element={<Navigate to="/studio" replace />} />
            </Routes>
          </div>
        </Suspense>
      </StudioShell>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onSignOut={signOut} onExportDonations={exportDonations} />
    </StudioContext.Provider>
  );
}

/** The whole Studio console, mounted at /studio/* outside the public site chrome. Client-only data; never prerendered. */
export default function StudioApp() {
  useNoIndex();
  return (
    <>
      <Routes>
        <Route path="login" element={<StudioLogin />} />
        <Route path="*" element={<StudioGate>{(me) => <StudioInside me={me} />}</StudioGate>} />
      </Routes>
      <Toaster />
    </>
  );
}
