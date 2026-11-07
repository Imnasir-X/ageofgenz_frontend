import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { AuthShell, Field } from '@/components/layout/PageShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', email: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.username.trim().length < 3) return setError('Choose a username of at least 3 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Use a password of at least 8 characters.');
    if (form.password !== form.password_confirm) return setError('The passwords don’t match.');
    setBusy(true);
    try {
      await register({ ...form, username: form.username.trim(), email: form.email.trim() });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Create an account" description="Create a free The Age of GenZ account." path="/signup/" noindex />
      <AuthShell
        title={done ? 'Check your inbox.' : 'Create your account.'}
        dek={done ? undefined : 'Free. Follow stories, get the weekly briefing, support independent journalism.'}
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        {done ? (
          <Alert variant="success">
            <CheckCircle2 />
            <p>Your account is created. If we sent a verification email, confirm it, then sign in.</p>
          </Alert>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {error && <Alert variant="destructive">{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="su-first" label="First name">
                <Input id="su-first" autoComplete="given-name" value={form.first_name} onChange={set('first_name')} />
              </Field>
              <Field id="su-last" label="Last name">
                <Input id="su-last" autoComplete="family-name" value={form.last_name} onChange={set('last_name')} />
              </Field>
            </div>
            <Field id="su-user" label="Username">
              <Input id="su-user" autoComplete="username" value={form.username} onChange={set('username')} required />
            </Field>
            <Field id="su-email" label="Email">
              <Input id="su-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
            </Field>
            <Field id="su-pass" label="Password" hint="8+ characters">
              <Input id="su-pass" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} required />
            </Field>
            <Field id="su-pass2" label="Confirm password">
              <Input id="su-pass2" type="password" autoComplete="new-password" value={form.password_confirm} onChange={set('password_confirm')} required />
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Create account
            </Button>
            <p className="text-xs text-muted-foreground">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        )}
      </AuthShell>
    </>
  );
}
