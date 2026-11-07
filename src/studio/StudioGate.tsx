import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ApiError, tokenStore } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { studioApi } from './api';
import type { Me } from './types';
import { ErrorState } from './components/common';

type GateState = { kind: 'checking' } | { kind: 'ok'; me: Me } | { kind: 'error'; message: string };

/**
 * Staff-only gate for every Studio route.
 * - No JWT: go to the Studio sign-in (which uses the site's normal login endpoint).
 * - Signed in but not staff: back to the public site.
 * - Staff: render the Studio. The backend still enforces is_staff on every call.
 */
export function StudioGate({ children }: { children: (me: Me) => ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<GateState>({ kind: 'checking' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    const next = encodeURIComponent(location.pathname + location.search);
    if (!tokenStore.access) {
      navigate(`/studio/login?next=${next}`, { replace: true });
      return;
    }
    setState({ kind: 'checking' });
    studioApi
      .me()
      .then((me) => {
        if (!alive) return;
        if (me.is_staff) {
          setState({ kind: 'ok', me });
        } else {
          toast('Studio is for staff only', { tone: 'info', description: 'You are signed in, but this account is not a staff account.' });
          navigate('/', { replace: true });
        }
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          tokenStore.clear();
          navigate(`/studio/login?next=${next}`, { replace: true });
          return;
        }
        setState({ kind: 'error', message: err instanceof Error ? err.message : 'Could not reach the backend.' });
      });
    return () => {
      alive = false;
    };
    // Re-check only on retry; route changes inside the Studio keep the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (state.kind === 'ok') return <>{children(state.me)}</>;
  if (state.kind === 'error') {
    return (
      <div className="mx-auto max-w-md p-6 pt-24">
        <ErrorState message={`Studio could not load: ${state.message}`} onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    );
  }
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground" aria-busy="true">
      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
      Checking access
    </div>
  );
}
