import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { AuthShell, Field } from '@/components/layout/PageShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/client';

interface GoogleTokenClient {
  requestAccessToken: () => void;
}
interface GoogleOAuth {
  accounts?: { oauth2?: { initTokenClient: (cfg: { client_id: string; scope: string; callback: (r: { access_token?: string; error?: string }) => void }) => GoogleTokenClient } };
}

const loadGoogle = () =>
  new Promise<GoogleOAuth>((resolve, reject) => {
    const w = window as unknown as { google?: GoogleOAuth };
    if (w.google?.accounts?.oauth2) return resolve(w.google);
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => (w.google ? resolve(w.google) : reject(new Error('Google sign-in is unavailable.')));
    script.onerror = () => reject(new Error('Google sign-in is unavailable.'));
    document.head.appendChild(script);
  });

export default function Login() {
  const { login, socialLogin, setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'' | 'email' | 'google' | 'x'>('');

  const afterLogin = () => {
    const intent = sessionStorage.getItem('subscriptionIntent');
    navigate(intent ? '/subscribe' : '/', { replace: true });
  };

  // X OAuth callback: the backend redirects back here with ?access=&refresh= or ?error=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err) setError(err);
    const access = params.get('access');
    const refresh = params.get('refresh');
    if (access && refresh) {
      setSession(access, refresh);
      navigate('/', { replace: true });
    }
  }, [location.search, navigate, setSession]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy('email');
    try {
      await login(email.trim(), password);
      afterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setBusy('');
    }
  };

  const google = async () => {
    setError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google sign-in isn’t configured.');
      return;
    }
    setBusy('google');
    try {
      const g = await loadGoogle();
      const client = g.accounts!.oauth2!.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (res) => {
          if (!res.access_token) {
            setError('Google sign-in was cancelled.');
            setBusy('');
            return;
          }
          try {
            await socialLogin('google', res.access_token);
            afterLogin();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed.');
          } finally {
            setBusy('');
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      setBusy('');
    }
  };

  const xLogin = () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter your email above first: X sign-in needs it to link your account.');
      return;
    }
    setBusy('x');
    window.location.href = authApi.xLoginUrl(email.trim());
  };

  return (
    <>
      <Seo title="Sign in" description="Sign in to The Age of GenZ." path="/login/" noindex />
      <AuthShell
        title="Welcome back."
        dek="Sign in to follow stories and manage your subscription."
        footer={
          <>
            New here?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        }
      >
        {error && (
          <Alert variant="destructive" className="mb-5">
            {error}
          </Alert>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={google} disabled={Boolean(busy)} loading={busy === 'google'}>
            Continue with Google
          </Button>
          <Button variant="outline" onClick={xLogin} disabled={Boolean(busy)} loading={busy === 'x'}>
            Continue with X
          </Button>
        </div>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" /> or with email <Separator className="flex-1" />
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field id="login-email" label="Email">
            <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field
            id="login-password"
            label="Password"
            hint={
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            }
          >
            <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={Boolean(busy)} loading={busy === 'email'}>
            Sign in
          </Button>
        </form>
      </AuthShell>
    </>
  );
}
