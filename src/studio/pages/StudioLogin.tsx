import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoMark } from '@/components/brand/Logo';
import { authApi, tokenStore } from '@/lib/api/client';
import { errorText } from '../api';

/** Studio sign-in: the same JWT login endpoint as the public site, then back to where you were. */
export default function StudioLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rawNext = params.get('next') || '/studio';
  const next = rawNext.startsWith('/studio') ? rawNext : '/studio';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await authApi.login(email.trim(), password);
      if (!data?.access) throw new Error('Sign-in failed. Check your email and password.');
      tokenStore.set(data.access, data.refresh);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorText(err, 'Sign-in failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <LogoMark className="h-8" />
          <h1 className="font-display text-2xl font-medium">Studio</h1>
          <p className="text-sm text-muted-foreground">Sign in with your staff account.</p>
        </div>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Email</span>
          <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Password</span>
          <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" loading={busy}>
          {!busy && <LogIn />}
          Sign in
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">Back to the site</Link>
        </p>
      </form>
    </div>
  );
}
