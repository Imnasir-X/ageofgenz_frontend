import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { AuthShell, Field } from '@/components/layout/PageShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    setBusy(true);
    try {
      await authApi.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Reset your password" path="/forgot-password/" noindex />
      <AuthShell
        title="Forgot your password?"
        dek="Enter your email and we’ll send a link to choose a new one."
        footer={
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        {sent ? (
          <Alert variant="success">
            <MailCheck />
            <p>If an account exists for {email.trim()}, a reset link is on its way. It expires, so use it soon.</p>
          </Alert>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {error && <Alert variant="destructive">{error}</Alert>}
            <Field id="fp-email" label="Email">
              <Input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={busy} loading={busy}>
              Send reset link
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
